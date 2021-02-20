# Amazon Lex sample Voice API application

Use this sample application using Vonage Voice API to connect to a Lex connector for voice interaction with a Lex Bot, including real time transcripts and sentiment analysis.

## Amazon Lex access

In order to get started, you will need to have an [AWS account](http://aws.amazon.com), as well as a bot on [Amazon Lex](https://aws.amazon.com/lex/).

Use an existing Amazon Lex bot or create a new one.

You will need your Lex bot name, which can be found in the Settings -> General on your Amazon Lex bot page, as well as the Alias of the bot, which is located in Settings -> Aliases.

You will also need to know an active AWS Access Key ID and Secret Key pair.

If necessary, create a new pair of keys:
- Log in to your [AWS Management Console](http://aws.amazon.com).
- Click on your user name at the top right of the page.
- Click on the My Security Credentials link from the drop-down menu.
- Go to Access keys section,
- Click on \[Create New Access Key\] (\*)

(\*) *Note: Your AWS account may be limited to only 2 active Access Keys. To create a new pair of Keys, you may need to "Make Inactive" an existing active Access Key ID, however before doing so, you need to absolutely make sure that key is not used by your other applications.*

## About this sample application

This sample application makes use of Vonage Voice API to answer incoming voice calls and set up a websocket connection to stream audio to and from the Lex connector for each call.

The Lex connector will:
- Send audio to Lex bot from caller's speech,
- Stream audio responses from the Lex bot to the caller via the websocket,
- Post back in real time transcripts and optionally sentiment scores (if enabled in Lex Bot) via webhooks call back to this Voice API sample application.

Once this application will be running, you call in to the **`phone number linked`** to your application (as explained below) to interact via voice with your Lex bot.</br>

## Set up the connector server - Public hostname and port

First set up a Lex connector server from https://github.com/nexmo-se/lex-connector.

Default local (not public!) connector server `port` is: 5000.

If you plan to test using `Local deployment` with ngrok for both the Lex connector application and this sample application, you may set up [multiple ngrok tunnels](https://ngrok.com/docs#multiple-tunnels).

For the next steps, you will need:
- The Lex connector server's public hostname and if necessary public port,</br>
e.g. `xxxxxxxx.ngrok.io`, `xxxxxxxx.herokuapp.com`, `myserver.mycompany.com:32000`  (as **`LEX_CONNECTOR_SERVER`**, no `port` is necessary with ngrok or heroku as public hostname)

## Sample Voice API application public hostname and port

Default local (not public!) sample application `port` is: 8000.

If you plan to test using `Local deployment` with ngrok for both this sample application and the Lex connector application, you may set up [multiple ngrok tunnels](https://ngrok.com/docs#multiple-tunnels).

For the next steps, you will need:
- The server's public hostname and if necessary public port on where this application is running,</br>
e.g. `yyyyyyyy.ngrok.io`, `yyyyyyyy.herokuapp.com`, `myserver.mycompany.com:32001` (as `host`), no `port` is necessary with ngrok or heroku as public hostname.

## Set up your Vonage Voice API application credentials and phone number

[Log in to your](https://dashboard.nexmo.com/sign-in) or [sign up for a](https://dashboard.nexmo.com/sign-up) Vonage APIs account.

Go to [Your applications](https://dashboard.nexmo.com/applications), access an existing application or [+ Create a new application](https://dashboard.nexmo.com/applications/new).

Under Capabilities section (click on [Edit] if you do not see this section):

Enable Voice
- Under Event URL, select HTTP POST, and enter https://\<host\>:\<port\>/event (replace \<host\> and \<port\> with the public host name and if necessary public port of the server where your application is running)</br>
- Under Answer URL, leave HTTP GET, and enter https://\<host\>:\<port\>/answer (replace \<host\> and \<port\> with the actual value as mentioned above)</br>
- Click on [Generate public and private key] if you did not yet create or want new ones, save the private.key file in this application folder.</br>
IMPORTANT: Do not forget to click on [Save changes] at the bottom of the screen if you have created a new key set.</br>
- Link a phone number to this application if none has been linked to the application.

Please take note of your **application ID** and the **linked number** (as they are needed in the very next section.)

For the next steps, you will need:</br>
- Your `application ID` (as **`APP_ID`**),</br>
- The **`phone number linked`** to your application (your phone will **call that number**),</br>
- Your [Vonage API key](https://dashboard.nexmo.com/settings) (as **`API_KEY`**)</br>
- Your [Vonage API secret](https://dashboard.nexmo.com/settings), not signature secret, (as **`API_SECRET`**)</br>
- The Lex connector server public hostname and port (as **`LEX_CONNECTOR_SERVER`**)</br>

## Overview on how this sample Voice API application works

- On an incoming call to the **`phone number linked`** to your application, GET `/answer` route plays a TTS greeting to the caller ("action": "talk"), then start a websocket connection to the Lex connector ("action": "connect"),
- Once the websocket is established (GET `/ws_event` with status "answered"), play a TTS greeting to Lex bot, as Lex expects the user to speak first, we need to start the conversation as one would in a phone call, with the answerer greeting the caller. The result is that the caller with directly hear the Lex bot initial greeting (e.g. "How may I help you?") without having to say anything yet.
You can customise that inital TTS played to Lex text to fit your Lex bot programming and use case.
- Transcript and sentiment scores will be received by this application in real time,</br>
- When the caller hangs up, both phone call leg and websocket leg will be automatically terminated.



You may look at the [range of voices available on Nexmo](https://docs.nexmo.com/voice/voice-api/ncco-reference#talk) and on Lex to select the same voice, so that it feels natural for the caller. (There is some overlap in the choice of voices available from both Nexmo and Lex.)

The parameter `sensitivity` allows you to set the VAD (Voice Activity Detection) sensitivity from the most sensitive (value = 0) to the least sensitive (value = 3), this is an integer value.

The path portion of the uri in "action": "connect" is the same as the path to the `PostContent` [endpoint within Lex](http://docs.aws.amazon.com/lex/latest/dg/API_PostContent.html) but with your server host address, e.g. `xxxxx.ngrok.io`. Therefore you should set your BOTNAME, ALIAS and USER details as part of this URI. You can get these details from your AWS Console after you set up a new instance of Lex.
USER's value may be set to any value as needed by your own application logic.

Within the "headers" section of the "endpoint" you must supply your `aws_key` and `aws_secret` that will be used to connect to Amazon Lex.

The `eventUrl` is where Nexmo will send events regarding the connection to the Lex Connector so that your application can be aware of the start and end of a session.

## Running Lex sample Voice API application

You may select one of the following 2 types of deployments.

### Local deployment

To run your own instance locally you'll need an up-to-date version of Node.js (we tested with version 14.3.0).

Copy the `.env.example` file over to a new file called `.env`:
```bash
cp .env.example .env
```

Edit `.env` file, and set the 8 parameter values:</br>
API_KEY=</br>
API_SECRET=</br>
APP_ID=</br>
LEX_CONNECTOR_SERVER=</br>
AWS_KEY=</br>
AWS_SECRET=</br>
BOT_NAME=</br>
ALIAS=</br>

Install dependencies once:
```bash
npm install
```

Launch the applicatiom:
```bash
node lex-voice-application
```

### Command Line Heroku deployment

Copy the `.env.example` file over to a new file called `.env`:
```bash
cp .env.example .env
```

Edit `.env` file, and set the 8 parameter values:</br>
API_KEY=</br>
API_SECRET=</br>
APP_ID=</br>
LEX_CONNECTOR_SERVER=</br>
AWS_KEY=</br>
AWS_SECRET=</br>
BOT_NAME=</br>
ALIAS=</br>

If you do not yet have a local git repository, create one:</br>
```bash
git init
git add .
git commit -am "initial"
```

Deploy this application to Heroku from the command line using the Heroku CLI:

```bash
heroku create \<myappname\>
```

On your Heroku dashboard where your application page is shown, click on `Settings` button,
add the following `Config Vars` and set them with their respective values:</br>
API_KEY</br>
API_SECRET</br>
APP_ID</br>
LEX_CONNECTOR_SERVER</br>
AWS_KEY</br>
AWS_SECRET</br>
BOT_NAME</br>
ALIAS</br>

```bash
git push heroku master
```

On your Heroku dashboard where your application page is shown, click on `Open App` button, that hostname is the one to be used under your corresponding [Vonage Voice API application Capabilities](https://dashboard.nexmo.com/applications) (click on your application, then [Edit]).</br>
See more details in above section **Set up your Vonage Voice API application credentials and phone number**.
