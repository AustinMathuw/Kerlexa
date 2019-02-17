/*
 * File: index.js
 * Description: File that configures the skill with Lambda
 */

'use strict';

const Alexa = require('ask-sdk');
const settings = require('./config/settings.js');
const logger = require('./utils/logger.js');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});


/**
 * Import interceptors and handlers for the different skill states.
 */
const DefaultHandlers = require('./handlers/defaultHandlers');
const CustomHandlers = require('./handlers/customHandlers');

/**
 * Lambda setup.
 */
exports.handler = function (event, context) {
  let factory = Alexa.SkillBuilders.standard()
    .addRequestHandlers(
      CustomHandlers.InProgressGetAttributeIntent,
      CustomHandlers.CompletedGetAttributeIntent,
      CustomHandlers.InProgressSetThrottleIntent,
      CustomHandlers.CompletedSetThrottleIntent,
      CustomHandlers.StageRocketIntent,
      CustomHandlers.InProgressDirectionalCommandIntent,
      CustomHandlers.CompletedDirectionalCommandIntent,
      CustomHandlers.InProgressBurnCommandIntent,
      CustomHandlers.CompletedBurnCommandIntent,
      DefaultHandlers.LaunchHandler,
      DefaultHandlers.HelpHandler,
      DefaultHandlers.StopCancelHandler,
      DefaultHandlers.SessionEndedRequestHandler,
      DefaultHandlers.DefaultHandler
    )
    .addRequestInterceptors(DefaultHandlers.RequestInterceptor)
    .addResponseInterceptors(DefaultHandlers.ResponseInterceptor)
    .addErrorHandlers(DefaultHandlers.ErrorHandler);

  if (settings.APP_ID) {
    factory.withSkillId(settings.APP_ID);
  }

  /**
   * Check if the DYNAMODB TABLE was set in the Enviroment Variables
   */
  logger.debug("===ENV VAR DYNAMODB TABLE===: " + process.env.DYNAMODB_TABLE_NAME);
  if (process.env.DYNAMODB_TABLE_NAME && process.env.DYNAMODB_TABLE_NAME !== '') {
    settings.STORAGE.SESSION_TABLE = process.env.DYNAMODB_TABLE_NAME;
    logger.debug("===STORAGE SESSION TABLE Set to===: " + settings.STORAGE.SESSION_TABLE);
  }

  if (settings.STORAGE.SESSION_TABLE) {
    factory.withTableName(settings.STORAGE.SESSION_TABLE)
      .withAutoCreateTable(true);
  }

  let skill = factory.create();

  return skill.invoke(event, context);
}