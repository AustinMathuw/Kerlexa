/*
 * Rider Alexa Skill
 * Author: Austin Wilson
 * Copyright 2019
 * 
 * File: messages.js
 * Description: File that holds all of the speech outputs and their translations
 */

'use strict';

const settings = require('./settings');

// Game Title in English
const SKILL_TITLE = settings.SKILL_TITLE;

// Translations
const messages = {
  // Translations for English (ALL)
  en: {
    translation: {
      'WELCOME_NOT_SETUP': {
        outputSpeech: 'Welcome to ' + SKILL_TITLE + '! Before we begin playing, we need to go through some setup. I have sent your player ID to your Alexa app. You will need to input this ID in the game when prompted.',
        reprompt: "Sorry, I didn't catch that, what would you like to do next?",
        displayTitle: SKILL_TITLE + ' - Welcome Setup',
        displayText: 'Look for your player key in your Alexa App!'
      },
      'WELCOME_SETUP': {
        outputSpeech: 'Welcome to ' + SKILL_TITLE + '! What would you like to do?',
        reprompt: "Sorry, I didn't catch that, what would you like to do?",
        displayTitle: SKILL_TITLE + ' - Welcome',
        displayText: 'What would you like to do?'
      },
      'GENERAL_HELP': {
        outputSpeech: 'Try asking to change the throttle to 50 percent. ' +
          'What would you like to do? ',
        reprompt: "Sorry, I didn't catch that, what would you like to do next?",
        displayTitle: SKILL_TITLE + ' - Help',
        displayText: 'I can help you fly your space ship!'
      },
      'UNHANDLED_REQUEST': {
        outputSpeech: "Sorry, I didn't get that. Please say again!",
        reprompt: "Please say it again. You can ask for help if you're not sure what to do."
      },
      'GOOD_BYE': {
        outputSpeech: "Ok, see you next time!",
        reprompt: ''
      },
      'GENERAL_HINT': [
          'What\'s next?'
      ],
      'ERROR': {
        outputSpeech: "There was an issue! Please try again later!"
      },
      'GENERAL_REPROMPT': " What's next?"
    }
  }
};

module.exports = messages;