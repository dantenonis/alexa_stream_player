/* eslint-disable no-mixed-operators */
/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const i18n = require('i18next'); 
const sprintf = require('i18next-sprintf-postprocessor'); 
const Util = require('./util.js');

const languageStrings = {
    'en' : require('./i118n/en'),
    'pt' : require('./i118n/pt')
}

var streamPlayingId = 0;

function getStreamObject(streamIndex){
    
    const logoUrl = Util.getS3PreSignedUrl("Media/pt-BR_largeIconUri.png");
    const backgroundImage = Util.getS3PreSignedUrl("Media/pt-BR_backgroundImage.png");
    
    const STREAMS = [
      {
        'token': `vipfm1:${new Date()}`,
        'url': 'https://streaming.inweb.com.br/vipfm1',
        'metadata': {
          'title': 'VIP FM - Musics',
          'subtitle': 'The best songs in the world!',
          'art': {
            'sources': [
              {
                'contentDescription': 'VIP FM Musics',
                'url': logoUrl,
                'widthPixels': 512,
                'heightPixels': 512,
              },
            ],
          },
          'backgroundImage': {
            'sources': [
              {
                'contentDescription': 'VIP FM Musics',
                'url': backgroundImage,
                'widthPixels': 1024,
                'heightPixels': 640,
              },
            ],
          },          
        },
      },
      {
        'token': `vipfm2:${new Date()}`,
        'url': 'https://streaming.inweb.com.br/vipfm2',
        'metadata': {
          'title': 'VIP FM - News',
          'subtitle': '90,9 Afiliada Rádio Bandeirantes',
          'art': {
            'sources': [
              {
                'contentDescription': 'VIP FM News',
                'url': logoUrl,
                'widthPixels': 512,
                'heightPixels': 512,
              },
            ],
          },
          'backgroundImage': {
            'sources': [
              {
                'contentDescription': 'VIP FM News',
                'url': backgroundImage,
                'widthPixels': 1024,
                'heightPixels': 640,
              },
            ],
          },          
        },
      }  
    ];
    
    return STREAMS[streamIndex];
}

const PlayStreamIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (
        handlerInput.requestEnvelope.request.intent.name === 'PlayStreamIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'PlayMusicStreamIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOnIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOnIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PlayStreamIntent'
      );
  },
  handle(handlerInput) {
    console.log(`PlayStreamIntentHandler: ${handlerInput.requestEnvelope.request.type}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechGreeting = requestAttributes.t('GREETING');
    const greetingCard = requestAttributes.t('GREETING_CARD');
    
        
    streamPlayingId = 0;
    const stream = getStreamObject(0);
    
    handlerInput.responseBuilder
        .speak(speechGreeting)
        .withSimpleCard(greetingCard)
        .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata);

    return handlerInput.responseBuilder
      .getResponse();        
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    console.log(`HelpIntentHandler: ${handlerInput.requestEnvelope.request.type}`);          
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechOutput = requestAttributes.t('HELP');

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AboutIntent';
  },
  handle(handlerInput) {
    console.log(`AboutIntentHandler: ${handlerInput.requestEnvelope.request.type}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechOutput = requestAttributes.t('HELP');
      
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' 
      && (
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOffIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOffIntent'
      );
  },
  handle(handlerInput) {
    console.log(`CancelAndStopIntentHandler: ${handlerInput.requestEnvelope.request.type}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechOutput = requestAttributes.t('STOPING');
      
    handlerInput.responseBuilder
      .speak(speechOutput)
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};


const PlaybackStartedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted'
    || handlerInput.requestEnvelope.request.type === 'PlaybackController.PauseCommandIssued'
    || handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackNearlyFinished';
  },
  handle(handlerInput) {
    console.log(`PlaybackStartedIntentHandler: ${handlerInput.requestEnvelope.request.type}`);      
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    console.log(`PlaybackStoppedIntentHandler: ${handlerInput.requestEnvelope.request.type}`);      
    handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackResumeIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'PlaybackController.PlayCommandIssued';
  },
  handle(handlerInput) {
    console.log(`PlaybackResumeIntentHandler: ${handlerInput.requestEnvelope.request.type}`);      
    
    const stream = getStreamObject(streamPlayingId);
    
    handlerInput.responseBuilder
        .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata);    
    
    return handlerInput.responseBuilder
      .getResponse();
  },
};


const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`SessionEndedRequestHandler: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const ExceptionEncounteredRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`ExceptionEncounteredRequestHandler: ${handlerInput.requestEnvelope.request.reason}`);

    return true;
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(handlerInput.requestEnvelope.request.type);
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true,
        });

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function (...args) {
            return localizationClient.t(...args);
        };
    },
};

exports.handler = skillBuilder
  .addRequestHandlers(
    PlayStreamIntentHandler,
    PlaybackStartedIntentHandler,
    CancelAndStopIntentHandler,
    PlaybackStoppedIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    ExceptionEncounteredRequestHandler,
    SessionEndedRequestHandler,
    PlaybackResumeIntentHandler
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();