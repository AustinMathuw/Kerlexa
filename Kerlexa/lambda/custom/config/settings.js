/*
 * File: settings.js
 * Description: File that configures the behavior of the game
 */

"use strict";

module.exports = (function () {
  /**
   * APP_ID:
   *  The skill ID to be matched against requests for confirmation.
   *  It helps protect against spamming your skill.
   *  This value can also be configured in lambda as described in the Hackster instructions.
   */

  const APP_ID = '';

  const alexaPlusUnityClass = require('alexaplusunity');
  const alexaPlusUnity = new alexaPlusUnityClass("pub-xxx", "sub-xxx", true); //Third parameter enables verbose logging

  /**
   * STORAGE.SESSION_TABLE:
   *  The name of the table in DynamoDB where you want to store session and game data.
   */
  const STORAGE = {
    // Session persistence
    SESSION_TABLE: 'KSPController'
  };

  const AUDIO = Object.freeze({
      
  });

  /**
   * A set of images to show on backgrounds and in display templates when the skill
   * is used with a device with a screen like the Echo Show or Echo Spot
   * https://developer.amazon.com/docs/custom-skills/display-interface-reference.html
   *
   * The skill template chooses images randomly from each array to provide some
   * variety for the user.
   */
  const IMAGES = Object.freeze({
    BACKGROUND_IMAGES: [
      'https://s3.amazonaws.com/austinmatthuw/Rider/background.jpg',
    ],
    LOGO: "https://s3.amazonaws.com/austinmatthuw/Rider/largeIcon.png",
  });

  // return the externally exposed settings object
  return Object.freeze({
    SKILL_TITLE: 'Kerbal Kontrol',
    UNITY_COMS: alexaPlusUnity,
    APP_ID: APP_ID,
    STORAGE: STORAGE,
    AUDIO: AUDIO,
    IMAGES: IMAGES,
    LOG_LEVEL: 'DEBUG',
    pickRandom(arry) {
      if (Array.isArray(arry)) {
        return arry[Math.floor(Math.random() * Math.floor(arry.length))]
      }
      return arry;
    }
  });
})();