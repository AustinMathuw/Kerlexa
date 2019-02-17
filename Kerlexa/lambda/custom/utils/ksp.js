/*
 * File: rider.js
 * Description: This file contains most of the game logic, while the actual intent & event request
 *    handler can be found in the gamePlayHandlers.js file.
 */

'use strict';
var logger = require('../utils/logger.js');
var settings = require('../config/settings.js');
var moment = require('moment');
var alexaPlusUnity = settings.UNITY_COMS;
const DefaultHandlers = require('./../handlers/defaultHandlers.js');

const helpers = {
    getSlotValues: function(filledSlots) {
        const slotValues = {};
      
        console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
        Object.keys(filledSlots).forEach((item) => {
          const name = filledSlots[item].name;
      
          if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
              case 'ER_SUCCESS_MATCH':
                slotValues[name] = {
                  synonym: filledSlots[item].value,
                  resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                  isValidated: true,
                };
                break;
              case 'ER_SUCCESS_NO_MATCH':
                slotValues[name] = {
                  synonym: filledSlots[item].value,
                  resolved: filledSlots[item].value,
                  isValidated: false,
                };
                break;
              default:
                break;
            }
          } else {
            slotValues[name] = {
              synonym: filledSlots[item].value,
              resolved: filledSlots[item].value,
              isValidated: false,
            };
          }
        }, this);
        console.log(`The formatted slots: ${JSON.stringify(slotValues)}`);
        return slotValues;
    },

    getDurationInSeconds: function(formatted) {
      var duration = formatted;
      var x = moment.duration(duration, moment.ISO_8601);
      console.log(x.asSeconds());
      return x.asSeconds();
    }
}

const KSP = {
    sendDirectionalCommand: async function (handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        let ctx = attributesManager.getRequestAttributes();

        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = helpers.getSlotValues(filledSlots);

        var values = {
          "up": 1,
          "down": -1,
          "forward": 1,
          "backward": -1,
          "right": 1,
          "left": -1,
        }

        var command = slotValues.command.resolved;
        var direction = slotValues.direction.resolved;
        var value = values[direction];
        

        var time = handlerInput.requestEnvelope.request.intent.slots.duration.value;
        time = helpers.getDurationInSeconds(time);

        logger.debug(command);

        var payloadObj = {
            type: "ExecuteCommand",
            message: command,
            time: time,
            value: value
        };

        return await alexaPlusUnity.publishMessage(payloadObj, sessionAttributes.PUBNUB_CHANNEL).then((data) => {
            var outputSpeech = "Executing...";
            var reprompt = ctx.t("GENERAL_REPROMPT");
            outputSpeech += reprompt;
            logger.debug(outputSpeech);
            ctx.outputSpeech.push(outputSpeech);
            //ctx.openMicrophone = false;
            ctx.reprompt.push(reprompt);
            ctx.openMicrophone = true;
        }).catch((err) => {
            return DefaultHandlers.ErrorHandler.handle(handlerInput, err);
        });
    },

    getAttribute: async function (handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        let ctx = attributesManager.getRequestAttributes();

        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = helpers.getSlotValues(filledSlots);

        var attr = slotValues.attribute.resolved;

        logger.debug(attr);

        var payloadObj = {
            type: "GetAttribute",
            message: attr
        };

        return await alexaPlusUnity.publishMessageAndListenToResponse(payloadObj, sessionAttributes.PUBNUB_CHANNEL, 4000).then((data) => {
            var outputSpeech;
            switch(attr) {
                case 'mass':
                    outputSpeech = 'Our mass is currently ' + data.message.object.toFixed(2) + ' tons';
                    break;
                case 'altitude':
                    outputSpeech = 'Our altitude is ' + data.message.object.toFixed(2) + ' meters';
                    break;
                case 'body':
                    outputSpeech = 'We are currently in ' + data.message.object + '\'s sphere of influence.';
                    break;
                case 'velocity':
                    outputSpeech = 'Our velocity is currently '  + data.message.object.toFixed(2) + ' meters per second';
                    break;
            }

            var reprompt = ctx.t("GENERAL_REPROMPT");
            outputSpeech += reprompt;
            logger.debug(outputSpeech);
            ctx.outputSpeech.push(outputSpeech);
            //ctx.openMicrophone = false;
            ctx.reprompt.push(reprompt);
            ctx.openMicrophone = true;
        }).catch((err) => {
            return DefaultHandlers.ErrorHandler.handle(handlerInput, err);
        });
    },

    sendBurnCommand: async function(handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        let ctx = attributesManager.getRequestAttributes();

        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = helpers.getSlotValues(filledSlots);

        var throttle = handlerInput.requestEnvelope.request.intent.slots.throttle.value;
        var time = slotValues.duration.resolved;
        time = helpers.getDurationInSeconds(time);

        logger.debug(throttle + " " + time);

        var payloadObj = {
            type: "BurnCommand",
            message: throttle/100,
            time: time
        };

        return await alexaPlusUnity.publishMessage(payloadObj, sessionAttributes.PUBNUB_CHANNEL).then((data) => {
            var outputSpeech = "Executing...";
            var reprompt = ctx.t("GENERAL_REPROMPT");
            outputSpeech += reprompt;
            logger.debug(outputSpeech);
            ctx.outputSpeech.push(outputSpeech);
            //ctx.openMicrophone = false;
            ctx.reprompt.push(reprompt);
            ctx.openMicrophone = true;
        }).catch((err) => {
            return DefaultHandlers.ErrorHandler.handle(handlerInput, err);
        });
    },

    setThrottle: async function(handlerInput) {
      let {
          requestEnvelope,
          attributesManager
      } = handlerInput;
      let sessionAttributes = attributesManager.getSessionAttributes();
      let ctx = attributesManager.getRequestAttributes();

      var throttle = handlerInput.requestEnvelope.request.intent.slots.percent.value;

      throttle = throttle/100;
      console.log(throttle);

      logger.debug("SetThrottle: " + throttle);

      var payloadObj = {
          type: "SetThrottle",
          message: throttle
      };

      return await alexaPlusUnity.publishMessage(payloadObj, sessionAttributes.PUBNUB_CHANNEL).then((data) => {
          var outputSpeech = "Executing...";
          var reprompt = ctx.t("GENERAL_REPROMPT");
          outputSpeech += reprompt;
          logger.debug(outputSpeech);
          ctx.outputSpeech.push(outputSpeech);
          //ctx.openMicrophone = false;
          ctx.reprompt.push(reprompt);
          ctx.openMicrophone = true;
      }).catch((err) => {
          return DefaultHandlers.ErrorHandler.handle(handlerInput, err);
      });
    },

    stageRocket: async function(handlerInput) {
      let {
          requestEnvelope,
          attributesManager
      } = handlerInput;
      let sessionAttributes = attributesManager.getSessionAttributes();
      let ctx = attributesManager.getRequestAttributes();

      logger.debug("Stage");

      var payloadObj = {
          type: "Stage"
      };

      return await alexaPlusUnity.publishMessage(payloadObj, sessionAttributes.PUBNUB_CHANNEL).then((data) => {
          var outputSpeech = "Executing...";
          var reprompt = ctx.t("GENERAL_REPROMPT");
          outputSpeech += reprompt;
          logger.debug(outputSpeech);
          ctx.outputSpeech.push(outputSpeech);
          //ctx.openMicrophone = false;
          ctx.reprompt.push(reprompt);
          ctx.openMicrophone = true;
      }).catch((err) => {
          return DefaultHandlers.ErrorHandler.handle(handlerInput, err);
      });
    }
};
module.exports = KSP;