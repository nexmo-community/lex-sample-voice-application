'use strict';

let fs = require('fs');
let request = require('request');

require("dotenv").config();

const express = require('express');
let bodyParser = require('body-parser');

const app = express();

let Nexmo = require('nexmo');

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
const appId = process.env.APP_ID;
const awsKey = process.env.AWS_KEY;
const awsSecret = process.env.AWS_SECRET;
const awsRegion = process.env.AWS_REGION;
const lexReferenceConnection = process.env.LEX_REFERENCE_CONNECTION;
const botName = process.env.BOT_NAME;
const publishAlias = process.env.BOT_ALIAS;

const port = process.env.PORT || 8000;

const privateKey = require('fs').readFileSync('private.key');

const nexmo = new Nexmo({
  apiKey: apiKey,
  apiSecret: apiSecret,
  applicationId: appId,
  privateKey: privateKey
});

//-----------

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//-----------

app.get('/lambda', (req, res) => {
  res.status(200).send('Ok');
});

//-----

app.get('/answer', (req, res) => {

  const hostName = `${req.hostname}`;
  const uuid = req.query.uuid;
  const callerNumber = req.query.from;
  
  res.json(
    [
      {
        "action": "talk",
        "voiceName": "Joanna",
        "text": "Please wait"
      }
      ,
      {
        "action": "connect",
        "endpoint": [
            {
              "content-type": "audio/l16;rate=8000",
              "headers": {
                "aws_key": awsKey,
                "aws_secret": awsSecret,
                "aws_region": awsRegion,
                "client_id": uuid + "_" + callerNumber, // Set to any argument as needed by your application logic
                "webhook_url": "https://" + hostName + "/analytics", // Will receive transcripts and sentiment analysis (if latter is enabled)
                "sensitivity": 3  // Voice activity detection, possible values 0 (most sensitive) to 3 (least sensitive)
                          },          
              "type": "websocket",
              "uri": "wss://" + lexReferenceConnection + "/bot/" + botName + "/alias/" + publishAlias + "/user/" + req.query.uuid + "_" + req.query.from  + "/content"
            }
          ],
        "from": "12995550101",
        "eventType": "synchronous",
        "eventMethod": "POST",
        "eventUrl": ["https://" + hostName + "/ws_event?orig_uuid=" + uuid]
      }
    ]
  );

});

//-----------

app.get('/event', (req, res) => {
  res.status(200).send('Ok');
});

//------------

app.post('/event', (req, res) => {
 
  res.status(200).send('Ok');

});

//-----------

app.post('/ws_event', (req, res) => {

  if (req.body.status == "answered") {

      console.log (">>> Websocket answered");

      const wsUuid = req.body.uuid;

      // Get Lex to say its welcome greeting right from the start
      setTimeout(() => {
      
        console.log (">>> Send greeting TTS");

        nexmo.calls.talk.start(wsUuid, {text: 'Good morning', voiceName: 'Joanna', loop: 1}, (err, res) => {
          if (err) { console.error('>>> TTS to bot websocket ' + wsUuid + ' error:', err); }
          else {console.log ('>>> TTS to bot websocket ' + wsUuid + ' ok!')}
        });
      
      }, 500);  

  }

  // if (req.body.status == "answered") {

  //     console.log (">>> Websocket answered");

  //     res.json(
  //       [
  //         {
  //           "action": "talk",
  //           "voiceName": "Joanna",
  //           "text": "Hello"
  //         }
  //       ]
  //     );

  // }
  // else {
  //     res.json([]);   
  // }    

  res.status(200).send('Ok');

});

//-----------

app.post('/recordings', (req, res) => {

  res.status(200).send('Ok');

});

//-----------

app.post('/analytics', (req, res) => {

  console.log(">>> POST body content:", req.body);
 
  res.status(200).send('Ok');

});


//------------

app.use ('/', express.static(__dirname));

app.get('/:name', function (req, res, next) {

  let options = {
    root: __dirname,
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

  let fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });

});

//--------

app.listen(port, () => console.log(`Server application listening on port ${port}!`));