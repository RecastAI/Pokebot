# PokeBot

This Pokedex bot is powered by Natural Language Processsing (NLP) with [Recast.AI](https://recast.ai) and can be connected to both Slack, Messenger or Kik.

#### You have 3 different ways to use PokeBot:

- Use it straight away [here](https://www.facebook.com/Pokebot-1549503468692232/)
- Follow the following procedure to run it by yourself on your computer.
- Make your own one from A to Z with the [tutorial](https://github.com/RecastAI/Pokebot/wiki).

## Get your Recast Bot Token

* Log in to your recast account
* Go to [Pokebot](https://recast.ai/hugo-cherchi/pokebotv2/core)
* Click on the 'Fork the Bot' Button
* Then on your profile, choose your fresh forked Bot
* On the bottom, in the curl request is your precious Token

## Get your Microsoft secret

* Create an account on [Microsoft Bot Framework](https://dev.botframework.com/)
* Create a new Bot and follow the procedure. The callback Url you have to put will be explain later.
* During the process, you'll have to create a Microsoft App: keep your Secret and AppId, they will be used later
* Follow the differents steps for every channel you want to add.

## Put your local server Online

```
./ngrok http 8080
```

this terminal is now used by ngrok and you can see your full Url that is required on microsoft bot Platform

## Launch Pokebot

#### Complete the config.js

* Clone this Repository

```
git clone https://github.com/hcherchi/PokeBot.git
```

* Fill the config.js with your Tokens

```
var tokens =
{
	recast: 'Recast Token',
	AppId: 'Application Id',
	Secret: 'Your Microsoft Secret',
}
```

#### Run

* install the dependencies

```
npm install
```

* run Pokebot

```
node pokebot.js
```

## Use Pokebot


![Alt text](./pictures/recast-ai-info-pikachu.png)


Your can :

* Ask informations about a specific Pokemon

* Ask resist and strengh about a specific type

* Ask Stats about a specific Pokemon

* Ask Moves a specific Pokemon can learn

* Ask informations about a specific move

* Ask about the family of a specific Pokemon

* Ask for a random Pokemon of a certain type
