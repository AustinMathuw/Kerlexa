/*
 * File: directives.js
 * Description: Defines the directives we will be sending to Alexa
 *    and allows our skill easy access to them.
 */

'use strict';

// Require our APL templates
var defaultTemplate = require('../apl/defaultTemplate.json');

// Alexa Presentation Language (APL) Directives
const APL = {

  // returns a RenderDocument directive for all visuals, except for song displaying
  setDefaultDisplay: function (backgroundImageUrl, skillTitle, message, logoUrl, hintText) {
    let data = {
      "transformers": [
        {
          "inputPath": "hintText",
          "transformer": "textToHint"
        }
      ],
      "type": "object",
      "properties": {
        "backgroundImageUrl": backgroundImageUrl,
        "skillTitle": skillTitle,
        "message": message,
        "logoUrl": logoUrl,
        "hintText": hintText
      }
    }
    console.log(data);
    return {
      "type": 'Alexa.Presentation.APL.RenderDocument',
      "version": '1.0',
      "document": defaultTemplate.document,
      "datasources": {data}
    };
  }
};

// Hint Directives (Pair with DisplayRender to add Hints to visuals)
const Hint = {
  setHint: function (hint) {
    return {
      "type": "Hint",
      "hint": {
        "type": "PlainText",
        "text": hint
      }
    };
  }
};

module.exports.APL = APL;
module.exports.Hint = Hint;