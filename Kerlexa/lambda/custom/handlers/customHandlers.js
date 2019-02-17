/*
 * File: customHandlers.js
 * Description: File that handlers the actual intent & event request globally
 */

const logger = require('../utils/logger.js');
const KSPControl = require('../utils/ksp.js');

const helpers = {
  
}

const customHandlers = {
  InProgressDirectionalCommandIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.InProgressDirectionalCommandIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'DirectionalCommandIntent'
        && requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
      logger.debug('CUSTOM.InProgressDirectionalCommandIntent: handle');
      let { responseBuilder, requestEnvelope } = handlerInput;
      const currentIntent = requestEnvelope.request.intent;
  
      return responseBuilder
        .addDelegateDirective(currentIntent)
        .getResponse();
    },
  },

  CompletedDirectionalCommandIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.CompletedDirectionalCommandIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'DirectionalCommandIntent'
        && requestEnvelope.request.dialogState === 'COMPLETED';
    },
    async handle(handlerInput) {
      logger.debug('CUSTOM.CompletedDirectionalCommandIntent: handle');
      await KSPControl.sendDirectionalCommand(handlerInput);
      return handlerInput.responseBuilder.getResponse();
    }
  },

  InProgressGetAttributeIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.InProgressGetAttributeIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'InProgressGetAttributeIntent'
        && requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
      logger.debug('CUSTOM.InProgressGetAttributeIntent: handle');
      let { responseBuilder, requestEnvelope } = handlerInput;
      const currentIntent = requestEnvelope.request.intent;
  
      return responseBuilder
        .addDelegateDirective(currentIntent)
        .getResponse();
    },
  },

  CompletedGetAttributeIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.GetAttributeIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'GetAttributeIntent'
        && requestEnvelope.request.dialogState === 'COMPLETED';
    },
    async handle(handlerInput) {
      logger.debug('CUSTOM.GetAttributeIntent: handle');
      await KSPControl.getAttribute(handlerInput);
      return handlerInput.responseBuilder.getResponse();
    }
  },

  InProgressBurnCommandIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.InProgressBurnCommandIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'InProgressBurnCommandIntent'
        && requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
      logger.debug('CUSTOM.InProgressBurnCommandIntent: handle');
      let { responseBuilder, requestEnvelope } = handlerInput;
      const currentIntent = requestEnvelope.request.intent;
  
      return responseBuilder
        .addDelegateDirective(currentIntent)
        .getResponse();
    },
  },

  CompletedBurnCommandIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.BurnCommandIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'BurnCommandIntent'
        && requestEnvelope.request.dialogState === 'COMPLETED';
    },
    async handle(handlerInput) {
      logger.debug('CUSTOM.BurnCommandIntent: handle');
      await KSPControl.sendBurnCommand(handlerInput);
      return handlerInput.responseBuilder.getResponse();
    }
  },

  InProgressSetThrottleIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.InProgressSetThrottleIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'InProgressSetThrottleIntent'
        && requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
      logger.debug('CUSTOM.InProgressSetThrottleIntent: handle');
      let { responseBuilder, requestEnvelope } = handlerInput;
      const currentIntent = requestEnvelope.request.intent;
  
      return responseBuilder
        .addDelegateDirective(currentIntent)
        .getResponse();
    },
  },

  CompletedSetThrottleIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.SetThrottleIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'SetThrottleIntent'
        && requestEnvelope.request.dialogState === 'COMPLETED';
    },
    async handle(handlerInput) {
      logger.debug('CUSTOM.SetThrottleIntent: handle');
      await KSPControl.setThrottle(handlerInput);
      return handlerInput.responseBuilder.getResponse();
    }
  },

  StageRocketIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.StageRocketIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'StageRocketIntent';
    },
    async handle(handlerInput) {
      logger.debug('CUSTOM.StageRocketIntent: handle');
      await KSPControl.stageRocket(handlerInput);
      return handlerInput.responseBuilder.getResponse();
    }
  }
}

module.exports = customHandlers;