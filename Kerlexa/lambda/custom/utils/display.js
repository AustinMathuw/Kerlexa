/*
 * File: display.js
 * Description: Defines helper methods to create the visuals of the skill
 *    for screen-enabled devices.
 */

const Alexa = require('ask-sdk');
const settings = require('../config/settings.js');
const directives = require('../utils/directives.js');
const logger = require('../utils/logger.js');

const Display = {
  isAPLCapatable: function(handlerInput) {

    /**
     * Check if display supports APL and our skill is in APL mode
     */
    if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces["Alexa.Presentation.APL"]) {
      logger.debug('Display does support APL');
      return true;
    } else {
      logger.debug('Display does not support APL');
      return false;
    }
  },

  // Render the default view
  renderDefault: function (
    /* The Alexa request and attributes */
    handlerInput,
    {
      displayTitle,
      /* primary text content to display */
      displayText,
      /* (optional) secondary text content to display */
      displaySubText,
      /* a background image to be displayed under the text content */
      backgroundImage,
      /* (optional) an image to be displayed on the side of the text content */
      image
    } = {}) {
    let ctx = handlerInput.attributesManager.getRequestAttributes();
    
    if(!ctx.isAPLCapatable(handlerInput)) {
      return;
    }

    if (!displayText) {
      logger.warn('Render template without primary text!');
    }

    let text = displayText || '';
    if (Array.isArray(text)) {
      text = settings.pickRandom(text);
    }

    let subText = displaySubText || '';
    if (Array.isArray(subText)) {
      subText = settings.pickRandom(subText);
    }

    const background = backgroundImage || settings.pickRandom(settings.IMAGES.BACKGROUND_IMAGES);
    ctx.directives.push(directives.APL.setDefaultDisplay(
      background,
      displayTitle,
      displayText,
      settings.IMAGES.LOGO,
      settings.pickRandom(ctx.t('GENERAL_HINT'))
    ));
  },
};
module.exports = Display;