/*
 * File: defaultHandlers.js
 * Description: File that handlers the actual intent & event request globally
 */

const display = require('../utils/display.js');
const i18n = require('i18next');
const logger = require('../utils/logger.js');
const messages = require('../config/messages.js');
const settings = require('../config/settings.js');
var alexaPlusUnity = settings.UNITY_COMS;

const helpers = {
  launchSetUp: async function(handlerInput, attributes) {
  
    // Step 9: Create a sqs queue and send it to user for them to input in the game
    var response = await alexaPlusUnity.addChannelToGroup(attributes.PUBNUB_CHANNEL, "KSPAlexa").then(async (data) => {
      var responseToReturn = null;
      
      var userId = handlerInput.requestEnvelope.session.user.userId;
      return await helpers.sendUserId(userId, attributes, handlerInput, responseToReturn);
      }).catch((err) => {
          return defaultHandlers.ErrorHandler.handle(handlerInput, err);
      });
  
    var result = {
      response: response,
      attributes: attributes
    }
    return result;
  },
  
  sendUserId: async function(userId, attributes, handlerInput, response) {
  
    // Step 10: Create a payload that has the user's alexa id
    var payloadObj = {
      type: "AlexaUserId",
      message: userId
    };
  
    // Step 11: Add alexaPlusUnity.publishEvent and send our payload
    return await alexaPlusUnity.publishMessage(payloadObj, attributes.PUBNUB_CHANNEL).then((data) => {
      return response;
    }).catch((err) => {
        return defaultHandlers.ErrorHandler.handle(handlerInput, err);
    });
  },
  
  setAttributes: function(attributes) {
    logger.debug(Object.keys(attributes).length);
    if (Object.keys(attributes).length === 0) {
      console.log("here");
      // Step 12: Initialize the attributes
      attributes.SETUP_STATE = "STARTED";
      var newChannel = "default";

      if(newChannel != null) {
          attributes.PUBNUB_CHANNEL = newChannel;
      } else {
          return null;
      }
      //Add more attributes here that need to be initalized at skill start
    }
    return attributes;
  }
}

const defaultHandlers = {
  /**
   * Intercept the incomming request before dispatching to handler
   */
  RequestInterceptor: {
    async process(handlerInput) {
      logger.debug('Default.RequestInterceptor: pre-processing response');
      let {
        attributesManager,
        requestEnvelope
      } = handlerInput;
      let ctx = attributesManager.getRequestAttributes();
      let persistentAtttributes = await attributesManager.getPersistentAttributes();

      logger.debug('----- CURRENT PERSISTENT ATTRIBUTES -----');
      logger.debug(JSON.stringify(persistentAtttributes, null, 2));

      let sessionAttributes = attributesManager.getSessionAttributes();

      // Apply the persistent attributes to the current session
      attributesManager.setSessionAttributes(Object.assign({}, persistentAtttributes, sessionAttributes));
      sessionAttributes = attributesManager.getSessionAttributes();

      // Apply the persistent attributes to the current session
      attributesManager.setSessionAttributes(Object.assign({}, persistentAtttributes, sessionAttributes));

      /**
       * Log the request for debug purposes.
       */
      logger.debug('----- REQUEST -----');
      logger.debug(JSON.stringify(requestEnvelope, null, 2));

      /**
       * Ensure we're starting at a clean state.
       */
      ctx.directives = [];
      ctx.outputSpeech = [];
      ctx.reprompt = [];
      ctx.card = {};

      ctx.APLCommands = [];

      /**
       * For ease of use we'll attach the utilities for handling localized tts to the request attributes.
       */
      logger.debug('Initializing messages for ' + handlerInput.requestEnvelope.request.locale);
      const localizationClient = i18n.init({
        lng: handlerInput.requestEnvelope.request.locale,
        resources: messages,
        returnObjects: true,
        fallbackLng: 'en'
      });
      ctx.t = function (...args) {
        return localizationClient.t(...args);
      };
      ctx.renderDefault = function (...args) {
        return display.renderDefault(...args);
      }
      ctx.createAPLCommandDirective = function (...args) {
        return display.sendAPLCommands(...args);
      }
      ctx.isAPLCapatable = function (...args) {
        return display.isAPLCapatable(...args);
      }
      ctx.addAPLCommand = function (command) {
        ctx.APLCommands.push(command);
      }
      ctx.addAPLCommands = function (commands) {
        commands.forEach(command => {
          ctx.APLCommands.push(command);
        });
      }
      ctx.setCard = function(isSimple, title, cardContent, image = {
        "smallImageUrl": settings.IMAGES.LOGO,
        "largeImageUrl": settings.IMAGES.LOGO
      }) {
        if(isSimple) {
          responseBuilder.withSimpleCard(title, cardContent);
        } else {
          responseBuilder.withStandardCard(title, cardContent, image.smallImageUrl, image.largeImageUrl);
        }
      }
      logger.debug('Default.RequestInterceptor: pre-processing response complete');
    }
  },

  /**
   * Intercept the outgoinging response before sending back to Alexa
   */
  ResponseInterceptor: {
    async process(handlerInput) {
      logger.debug('Default.ResponseInterceptor: post-processing response');
      let {
        attributesManager,
        responseBuilder
      } = handlerInput;
      let ctx = attributesManager.getRequestAttributes();
      let sessionAttributes = attributesManager.getSessionAttributes();
      let persistentAtttributes = await attributesManager.getPersistentAttributes();

      /**
       * Log the attributes and response for debug purposes.
       */
      logger.debug('----- REQUEST ATTRIBUTES -----');
      logger.debug(JSON.stringify(ctx, null, 2));

      logger.debug('----- SESSION ATTRIBUTES -----');
      logger.debug(JSON.stringify(sessionAttributes, null, 2));

      logger.debug('----- CURRENT PERSISTENT ATTRIBUTES -----');
      logger.debug(JSON.stringify(persistentAtttributes, null, 2));

      /**
       * Build the speech response.
       */
      if (ctx.outputSpeech.length > 0) {
        let outputSpeech = ctx.outputSpeech.join(' ');
        logger.debug('Global.ResponseInterceptor: adding ' +
          ctx.outputSpeech.length + ' speech parts');
        responseBuilder.speak(outputSpeech);
      }
      if (ctx.reprompt.length > 0) {
        logger.debug('Global.ResponseInterceptor: adding ' +
          ctx.reprompt.length + ' speech reprompt parts');
        let reprompt = ctx.reprompt.join(' ');
        responseBuilder.reprompt(reprompt);
      }
      if(ctx.isAPLCapatable(handlerInput)) {
        if (ctx.APLCommands.length > 0) {
          logger.debug('Global.ResponseInterceptor: adding ' +
            ctx.APLCommands.length + ' APLCommands');
          ctx.createAPLCommandDirective(handlerInput, ctx.APLCommands, "token");
        }
      }

      let response = responseBuilder.getResponse();

      /**
       * Apply the custom directives to the response.
       */
      if (Array.isArray(ctx.directives)) {
        logger.debug('Default.ResponseInterceptor: processing ' + ctx.directives.length + ' custom directives ');
        response.directives = response.directives || [];
        for (let i = 0; i < ctx.directives.length; i++) {
          response.directives.push(ctx.directives[i]);
        }
      }

      if ('openMicrophone' in ctx) {
        if (ctx.openMicrophone) {
          /**
           * setting shouldEndSession = false - lets Alexa know that we want an answer from the user
           * see: https://developer.amazon.com/docs/gadget-skills/receive-voice-input.html#open
           *      https://developer.amazon.com/docs/gadget-skills/keep-session-open.html
           */
          response.shouldEndSession = false;
          logger.debug('Default.ResponseInterceptor: request to open microphone -> shouldEndSession = false');
        } else {
          if (ctx.endSession){
            // We have explicitely asked for the session to end
            response.shouldEndSession = true;
          } else {
            /**
             * deleting shouldEndSession will keep the skill session going,
             * while the input handler is active, waiting for button presses
             * see: https://developer.amazon.com/docs/gadget-skills/keep-session-open.html
             */
            delete response.shouldEndSession;
          }

          logger.debug('Default.ResponseInterceptor: request to open microphone -> delete shouldEndSession');
        }
      }

      /**
       * Persist the current session attributes
       */
      attributesManager.setPersistentAttributes(sessionAttributes);
      await attributesManager.savePersistentAttributes();
      persistentAtttributes = await attributesManager.getPersistentAttributes();
      logger.debug('----- NEW PERSISTENT ATTRIBUTES -----');
      logger.debug(JSON.stringify(persistentAtttributes, null, 2));

      /**
       * Log the attributes and response for debug purposes.
       */
      logger.debug('----- RESPONSE -----');
      logger.debug(JSON.stringify(response, null, 2));

      return response;
    }
  },

  /**
   * Catch-all handler (For error handling)
   */
  DefaultHandler: {
    canHandle(handlerInput) {
      logger.debug('Default.DefaultHandler: canHandle');

      /**
       * Catch all for requests.
       */
      return true;
    },
    handle(handlerInput) {
      logger.debug('Default.DefaultHandler: handle');
      let {
        attributesManager,
        responseBuilder
      } = handlerInput;
      let ctx = attributesManager.getRequestAttributes();
      let {
        outputSpeech,
        reprompt
      } = ctx.t('UNHANDLED_REQUEST');

      ctx.outputSpeech.push(outputSpeech);
      ctx.reprompt.push(reprompt);
      ctx.openMicrophone = true;

      return responseBuilder.getResponse();
    }
  },

  /**
   * Default Help
   */
  LaunchHandler: {
    canHandle(handlerInput) {
      logger.debug('Default.LaunchHandler: canHandle');
      /**
       * Handle all help requests and treat don't know requests as
       * help requests except when in game loop state
       */
      let {
        attributesManager,
        requestEnvelope
      } = handlerInput;
      let request = requestEnvelope.request;
      let sessionAttributes = attributesManager.getSessionAttributes();
      return request.type === 'LaunchRequest'
    },
    async handle(handlerInput) {
      logger.debug('Default.LaunchHandler: handle');
      let {
        attributesManager,
        responseBuilder,
        requestEnvelope
      } = handlerInput;
      let ctx = attributesManager.getRequestAttributes();
      let sessionAttributes = attributesManager.getSessionAttributes();
      sessionAttributes = helpers.setAttributes(sessionAttributes);
      let messageKey = "";
      if(sessionAttributes.SETUP_STATE != "STARTED") {
        messageKey = 'WELCOME_SETUP';

        let responseMessage = ctx.t(messageKey);
        ctx.renderDefault(handlerInput, responseMessage);
        ctx.outputSpeech.push(responseMessage.outputSpeech);
        ctx.reprompt.push(responseMessage.reprompt);
      } else {
        var launchSetUpResult = await helpers.launchSetUp(handlerInput, sessionAttributes);
        sessionAttributes = launchSetUpResult.attributes;
        messageKey = 'WELCOME_NOT_SETUP';
        let responseMessage = ctx.t(messageKey);
        ctx.outputSpeech.push(responseMessage.outputSpeech);
        
        ctx.renderDefault(handlerInput, responseMessage);
      }

      ctx.openMicrophone = true;
      return responseBuilder.getResponse();
    }
  },

  /**
   * Default Help
   */
  HelpHandler: {
    canHandle(handlerInput) {
      logger.debug('Default.HelpHandler: canHandle');
      /**
       * Handle all help requests and treat don't know requests as
       * help requests except when in game loop state
       */
      let {
        attributesManager,
        requestEnvelope
      } = handlerInput;
      let request = requestEnvelope.request;
      let sessionAttributes = attributesManager.getSessionAttributes();
      return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent'
    },
    handle(handlerInput) {
      logger.debug('Default.HelpHandler: handle');
      let {
        attributesManager,
        responseBuilder
      } = handlerInput;
      let ctx = attributesManager.getRequestAttributes();
      let sessionAttributes = attributesManager.getSessionAttributes();

      /**
       * Figure out where we need help
       */
      let messageKey = 'GENERAL_HELP';

      let responseMessage = ctx.t(messageKey);
      ctx.renderDefault(handlerInput, responseMessage);
      ctx.outputSpeech.push(responseMessage.outputSpeech);
      ctx.reprompt.push(responseMessage.reprompt);
      ctx.openMicrophone = true;

      return responseBuilder.getResponse();
    }
  },

  /**
   * Stop and Cancel both respond by saying goodbye and ending the session by not setting openMicrophone
   */
  StopCancelHandler: {
    canHandle(handlerInput) {
      logger.debug('Default.StopCancelHandler: canHandle');
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent' ||
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent')
    },
    handle(handlerInput) {
      logger.debug('Default.StopCancelHandler: handle');
      let {
        attributesManager,
        responseBuilder
      } = handlerInput;
      let ctx = attributesManager.getRequestAttributes();
      let {
        outputSpeech
      } = ctx.t('GOOD_BYE');

      ctx.outputSpeech.push(outputSpeech);
      ctx.openMicrophone = false;
      ctx.endSession = true;

      return responseBuilder.getResponse();
    }
  },

  /**
   * Handler for when session is closed
   */
  SessionEndedRequestHandler: {
    canHandle(handlerInput) {
      logger.debug('Default.SessionEndedRequestHandler: canHandle');
      return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
      logger.debug('Default.SessionEndedRequestHandler: handle');
      logger.info(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
      let {
        attributesManager,
        responseBuilder
      } = handlerInput;
      /**
       *  setting shouldEndSession = true  -  lets Alexa know that the skill is done
       *  see: https://developer.amazon.com/docs/gadget-skills/receive-voice-input.html
       */
      let response = responseBuilder.getResponse();
      response.shouldEndSession = true;
      return response;
    }
  },

  /**
   * Error Handler
   */
  ErrorHandler: {
    canHandle() {
      // Handle all errors. We'll just log them.
      logger.debug('Default.ErrorHandler: canHandle');
      return true;
    },
    handle(handlerInput, error) {
      logger.debug('Default.ErrorHandler: handle');
      logger.error('Default.ErrorHandler: Error = ' + error.message);
      logger.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

      return handlerInput.responseBuilder
        .speak('An error was encountered while handling your request. Try again later')
        .getResponse();
    }
  }
}

module.exports = defaultHandlers;