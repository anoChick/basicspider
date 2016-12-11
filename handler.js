'use strict';
var client = require('cheerio-httpcli');
var vogels = require('vogels'),
  Joi = require('joi');
vogels.AWS.config.update({
  region: 'ap-northeast-1'
});
var BasicSpider = vogels.define('BasicSpider', {
  hashKey: 'target_url',
  timestamps: true,
  schema: {
    target_url: Joi.string(),
    root_url: Joi.string(),
    selector: Joi.string(),
    result: Joi.string(),
  },
  tableName: 'BasicSpider'
});


module.exports.spide = (event, context) => {

  console.log('実行');
  if (event.Records[0].eventName != 'INSERT') return;

  var newImage = event.Records[0].dynamodb.NewImage;
  if (!newImage.target_url || !newImage.selector || !newImage.root_url ||
    newImage.result)
    return;
  var url = newImage.target_url['S'];
  var selector = newImage.selector['S'];
  var rootURL = newImage.root_url['S'];
  console.log('検索:' + url);
  console.log(newImage.result);
  client.fetch(url, {}, function(err, $, res) {
    BasicSpider
      .scan()
      .select('COUNT')
      .exec(function(err, acc) {
        if (acc.Count > 1000) return; //1000件を越えたらページ捜査を止める。
        $('a').each(function(i, e) {
          var link = ($(e).attr('href') || '').replace('rootURL',
            '');
          if (link[0] == '/') {
            var target_url = rootURL + link;
            BasicSpider
              .query(
                target_url)
              .exec(function(err, acc) {

                if (acc.Count) return;

                BasicSpider.create({
                  target_url: target_url,
                  root_url: rootURL,
                  selector: selector
                }, function(err, post) {
                  console.log("create:" + target_url);
                });
              });
          }
        });
      });

    console.log('結果:' + $(selector).text());
    BasicSpider.update({
      target_url: url,
      result: $(selector).text()
    }, function(err, acc) {});
  });
};
