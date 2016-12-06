'use strict';

var vogels = require('vogels'),
    Joi    = require('joi');
var Spider = vogels.define('Spider', {
  hashKey : 'URL',
  timestamps : true,
  schema : {
    ProjectName : Joi.string(),
    Selector : Joi.string(),
    URL : Joi.string()
  },
  tableName: 'Spider'
});



module.exports.spide = (event, context, callback) => {
  var randnum = Math.floor( Math.random() * 30 );
  if(randnum == 10){
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: '終わり',
        input: event,
      }),
    };
    callback(null, response);
    return;
  }

  Spider.create({
    ProjectName : 'ne',
    Selector : 'ko' ,
    URL : 'mi'+randnum
  }, function (err, spider) {
  if (err)  {
    return context.fail(err);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);
  return context.succeed(spider.get());
});


  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
