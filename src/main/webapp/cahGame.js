/**
 * Copyright (C) 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Tic Tac Toe Gameplay with Chromecast
 * This file exposes cast.TicTacToe as an object containing a ChannelHandler
 * and capable of receiving and sending messages to the sender application.
 */

var cast = window.cast || {};

// Anonymous namespace
(function() {
  'use strict';

  TicTacToe.PROTOCOL = 'com.meadowhawk.chromecast.cah';

  TicTacToe.PLAYER = {
    O: 'O',
    X: 'X'
  };

  TicTacToe.CARD_DECK = [{"id":1, "content": "Being on fire.", "type": "W"},
{"id":2, "content": "Raceism.", "type": "W"},
{"id":3, "content": "Old-people smell.", "type": "W"},
{"id":4, "content": "A micropenis.", "type": "W"},
{"id":5, "content": "Women in yoguart commercials.","type": "W"},
{"id":6, "content": "Classist undertones.","type": "W"},
{"id":7, "content": "Not giving a shit about the Third World.","type": "W"},
{"id":8, "content": "Sexting.","type": "W"},
{"id":9, "content": "Roofies.", "type": "W"},
{"id":10, "content": "A windmill full of corpses.", "type": "W"},
{"id":11, "content": "The gays.", "type": "W"},
{"id":12, "content": "An oversized lollipop.", "type": "W"},
{"id":13, "content": "African children.","type": "W"},
{"id":14, "content": "An asymmetric boob job.","type": "W"},
{"id":15, "content": "Bengeing and purging.","type": "W"},
{"id":16, "content": "The hardworking Mexican.","type": "W"},
{"id":17, "content": "An Oedipus complex.","type": "W"},
{"id":18, "content": "A tiny horse.","type": "W"},
{"id":19, "content": "Boogers.","type": "W"},
{"id":10, "content": "Penis envy.","type": "W"},
{"id":50, "content": "Darth Vader.", "type": "W"},
{"id":51, "content": "Women.","type": "W"},
{"id":52, "content": "World of Warcraft.","type": "W"}];

TicTacToe.BLACK_CARD_DECK = [{"id":1000, "content": "Thats right I killed ______.  How, you ask? ______", "type": "B","pickCt":2,"draw":1},
  {"id":1001, "content": "How did I loose my verginity?", "type": "B","pickCt":1,"draw":1},
  {"id":1002, "content": "Why can't I sleep at night?", "type": "B","pickCt":1,"draw":1},
  {"id":1003, "content": "What's that smell?", "type": "B","pickCt":1,"draw":1},
  {"id":1004, "content": "I got 99 problems but ______ ain't one.", "type": "B","pickCt":1,"draw":1},
  {"id":1004, "content": "Maybe she's born with it, maybe it's ______.", "type": "B","pickCt":1,"draw":1},
  {"id":1004, "content": "What's the next Happy Meal toy?", "type": "B","pickCt":1,"draw":1},
  {"id":1004, "content": "Here is the church. Here is the steeple. Open the door and here is ______.", "type": "B","pickCt":1,"draw":1},
  {"id":1004, "content": "It's a pitty that kids these days are all involved with ______.", "type": "B","pickCt":1,"draw":1},
  ];

function Game(id, updateListener){
  this.id = id;
  this.updateListener = updateListener;
  this.pointGoal = 7;
  this.turnNumber = 1;
  this.bossUser = "";
  this.gameState = "PLAY"; //PLAY|REVIEW
  this.blackCardInPlay = {};
  this.players = [];
  this.deck = [];
  this.blackDeck = [];
  this.submittedCards = [];

  this.addPlayer = function(newPlayer){
    if(this.getPlayerByName(newPlayer.name)) {
      updateListener(this.players.push(newPlayer));
    } else {
      console.log("Player " + newPlayer + "already logged in!");
    }
  };

  this.setBlackCard = function(){
    this.blackCardInPlay = this.blackDeck.pop();
  };

  /**
   * Randomize array element order in-place.
   * Using Fisher-Yates shuffle algorithm.
   */
  this.shuffleCards = function(array) {
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
      return array;
  },

  this.getCards = function(cardsNeeded) {
    var newCardsSet = [];
    if(this.deck.length < cardsNeeded){
      //out of cards, shuffle.
      this.deck = this.shuffleCards(TicTacToe.CARD_DECK);
    }

    for (var i = cardsNeeded - 1; i >= 0; i--) {
         newCardsSet.push(this.deck.pop());    
    };
    return newCardsSet; 
  };

  this.getPlayerByName = function(playerName) {
    var _player = null;
    this.players.forEach(function(plr){
      if(plr.name == playerName){
        _player = plr;
        return;
      }
    });
    return _player;
  };

  /**
   * Helper for looking up card references.
   */
  this.getCardById = function(cardId){
    var crd;
    TicTacToe.CARD_DECK.forEach(function(card){
      if(card.id == parseInt(cardId)){
        crd = card;
        return
      }
    });
    return crd;
  };

  this.addPlayerCards = function(player, cardIds){
    var cards = [];

    if(cardIds.length > 0){
      var card = this.getCardById(cardIds[0]);
      card.playerName = player.name;
      cards.push(card);  
    } 
    if(cardIds.length > 1){
      var card1 = this.getCardById(cardIds[1]);
      card1.playerName = player.name;
      cards.push(card1);  
    }
    this.submittedCards.push(cards);
  };
};

function Player(name, channel){
  this.name = name;
  this.channel = channel;
  this.awesomePoints = 0;
  this.imCzar = false;
  this.state = 'ACTIVE';  //ACTIVE|DROPED
  this.submitedCards = [];

  this.imCzarImg = function(){
      var imgPath = "img/wt_circle.png"; 
    if(this.imCzar){
      imgPath = "img/wt_crown.png";
    } 
    console.log("imgPath="+imgPath);
    return imgPath;
  }
}
/* Defined for compleatness and reference, data will usually be geenrated or loaded.*/
function Card(){
  this.content = '';
  this.type  = 'W'; //W|B
  this.pickCt = 1;
  this.draw = 1;
}

  /**
   * Creates a TicTacToe object with an optional board and attaches a
   * cast.receiver.ChannelHandler, which receives messages from the
   * channel between the sender and receiver.
   * @param {board} opt_board an optional game board.
   * @constructor
   */
  function TicTacToe(updateListener) {
    this.updateListener = updateListener;
    this.mPlayer1 = -1;
    this.mPlayer2 = -1;
    this.mCurrentPlayer;
    this.game = new Game(0, updateListener);

    console.log('Creating TicTacToe object');

    this.mChannelHandler =
        new cast.receiver.ChannelHandler('TicTacToeDebug');
    this.mChannelHandler.addEventListener(
        cast.receiver.Channel.EventType.MESSAGE,
        this.onMessage.bind(this));
    this.mChannelHandler.addEventListener(
        cast.receiver.Channel.EventType.OPEN,
        this.onChannelOpened.bind(this));
    this.mChannelHandler.addEventListener(
        cast.receiver.Channel.EventType.CLOSED,
        this.onChannelClosed.bind(this));

    //shuffle the deck
    this.game.deck = this.game.shuffleCards(TicTacToe.CARD_DECK.slice());
    this.game.blackDeck = this.game.shuffleCards(TicTacToe.BLACK_CARD_DECK.slice());

    //Set the first black card.
    this.game.setBlackCard();
  }

  // Adds event listening functions to TicTacToe.prototype.
  TicTacToe.prototype = {

    /**
     * Randomize array element order in-place.
     * Using Fisher-Yates shuffle algorithm.
     */
    shuffleCards: function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    },

    /**
     * Channel opened event; checks number of open channels.
     * @param {event} event the channel open event.
     */
    onChannelOpened: function(event) {
      console.log('onChannelOpened. Total number of channels: ' +
          this.mChannelHandler.getChannels().length);
    },

    /**
     * Channel closed event; if all devices are disconnected,
     * closes the application.
     * @param {event} event the channel close event.
     */
    onChannelClosed: function(event) {
      console.log('onChannelClosed. Total number of channels: ' +
          this.mChannelHandler.getChannels().length);

      if (this.mChannelHandler.getChannels().length == 0) {
        window.close();
      }
    },

    /**
     * Message received event; determines event message and command, and
     * choose function to call based on them.
     * @param {event} event the event to be processed.
     */
    onMessage: function(event) {
      var message = event.message;
      var channel = event.target;
      console.log('********onMessage********' + JSON.stringify(message));
      console.log('mPlayer1: ' + this.mPlayer1);
      console.log('mPlayer2: ' + this.mPlayer2);

      if (message.command == 'join') {
        this.onJoin(channel, message);
      } else if (message.command == 'leave') {
        this.onLeave(channel);
      } else if (message.command == 'req-card') {
        this.onRequestCards(channel, message);
      } else if (message.command == 'play-card') {
        this.onPlayCards(channel, message);
      } else if (message.command == 'czar-review') {
        this.onCzarReview(channel, message);
      } else if (message.command == 'czar-pick-winner') {
        this.onCzarPickWinner(channel, message);
      } else {
        cast.log.error('Invalid message command: ' + message.command);
      }
    },

    /**
     * Player joined event: registers a new player who joined the game, or
     * prevents player from joining if invalid.
     * @param {cast.receiver.channel} channel the channel the message came from.
     * @param {Object|string} message the name of the player who just joined.
     */
    onJoin: function(channel, message) {
      console.log('****onJoin: ' + JSON.stringify(message));

      if(message.name){
        this.game.addPlayer(new Player(message.name, channel));
      } else {
        this.sendError(channel, 'Required player name is missing!');
        return;
      }

   /*   if (this.mPlayer1 != -1 && this.mPlayer2 != -1) {
        console.log('board setup');
        this.mBoard.reset();
        this.startGame_();
        console.log('end board setup');
      }*/
      console.log('**** End onJoin');
      channel.send({ 'event': 'joined', 'playerName': message.name });
    },

    /**
     * Player leave event: determines which player left and unregisters that
     * player, and ends the game if all players are absent.
     * @param {cast.receiver.channel} channel the channel of the leaving player.
     */
    onLeave: function(channel) {
      console.log('****OnLeave');

      if (this.mPlayer1 != -1 && this.mPlayer1.channel == channel) {
        this.mPlayer1 = -1;
      } else if (this.mPlayer2 != -1 && this.mPlayer2.channel == channel) {
        this.mPlayer2 = -1;
      } else {
        console.log('Neither player left the game');
        return;
      }
      console.log('mBoard.GameResult: ' + this.mBoard.getGameResult());
      if (this.mBoard.getGameResult() == -1) {
        this.mBoard.setGameAbandoned();
        this.broadcastEndGame(this.mBoard.getGameResult());
      }
    },

    /**
     * Retrieve cards for player, only return the number requested. if no number then return no cards.
     * Msg format:  {"isCzar":true|false, "blackCardInPlay":{cardType}, "newCards":[{cardType},{cardType},...]}
     * @param {cardsInHand|int} message contains card count of playesrs current hand.
     *
     */
    onRequestCards: function(channel, message){
      console.log('****onRequestCards: ' + JSON.stringify(message));
      //Determine if user is Czar, get cards needed and return hand plus the next Black Card.

      var cardsNeeded = 10 - message.cardsInHand;
      console.log('cardsNeeded='+cardsNeeded);
      var newCardsSet  = this.game.getCards(cardsNeeded);
      console.log('Resp: '+JSON.stringify(newCardsSet));

      //get users czar status.
      try{
        channel.send({ event: 'got_cards', imCzar: false,  newCards: newCardsSet, blackCardInPlay: this.game.blackCardInPlay});
      } catch(err){
        this.sendError(channel, 'Couldn\'t retrieve cards.');
      }
    },

    /**
     * Processes played cards sent from the user. Something needs to verify that user has submitted enough cards. maybe do this on the CC screen.

     */
    onPlayCards: function(channel, message){
      //TODO: Add check to prevent user from submitting more cards if already submitted?
      console.log('****onPlayCards: ' + JSON.stringify(message));
      if(message.playerName && message.cards){
        var player = this.game.getPlayerByName(message.playerName);
        if(player){
          if(!player.submitedCards) {
            player.submitedCards = [];
          }
          var ids = this.stringToArray(message.cards);
          this.game.addPlayerCards(player, ids);

          //Only 2 cards are sent so since all efforts at a for loop fail, jsut call them directly.
          

          /*ids.forEach(function(id){
            var tmpCard  = this.game.getCardById(id);
            player.submitedCards.push(tmpCard);
          });*/

          //player.submitedCards.push(this.game.getCardById(ids[0]));
          //for (i = 0; i < ids.length; ++i) {
          //    player.submitedCards.push(this.game.getCardById(ids[i]))  ;
          //}
        } else{
          //return an error.
          this.sendError(channel, 'Invalid user name, sorry something went wrong.');
        } 
      }
      
       try{
          channel.send({event: 'card_played' , cards: message.cards});
        } catch(err){
          console.log("ERROR: " + err);
          this.sendError(channel, 'Couldn\'t retrieve cards.');
        }
    },

    onCzarReview: function(channel, message){
      console.log('****onCzarReview: ' + JSON.stringify(message));
      //return all submitted cards for review.
       //get users czar status.
      var reviewCardsSet  = this.game.submittedCards;
      console.log('Resp: '+JSON.stringify(reviewCardsSet));

      try{
        channel.send({ event: 'got_cards', reviewCards: reviewCardsSet, blackCardInPlay: this.game.blackCardInPlay});
      } catch(err){
        this.sendError(channel, 'Couldn\'t retrieve cards.');
      }
    },

    onCzarPickWinner: function(channel, message){
      // winningCard
      console.log('****onCzarPickWinner: ' + JSON.stringify(message));
//TODO: add point to winner,  clear selected 
    },

    stringToArray: function(inStr){
      var rtnArray = [];
      if(inStr){
        //trim off brackets if present
        inStr = inStr.replace("[","").replace("]","");
        rtnArray = inStr.split(",");    
      }
      return rtnArray;
    },

    sendError: function(channel, errorMessage) {
      channel.send({ event: 'error',
                     message: errorMessage });
    },

    broadcastEndGame: function(endState, winningLocation) {
      console.log('****endGame');
      this.mPlayer1 = -1;
      this.mPlayer2 = -1;
      this.broadcast({ event: 'endgame',
                       end_state: endState,
                       winning_location: winningLocation });
    },

    /**
     * @private
     */
    startGame_: function() {
      console.log('****startGame');
      var firstPlayer = Math.floor((Math.random() * 10) % 2);
      this.mPlayer1.player = (firstPlayer === 0) ?
          TicTacToe.PLAYER.X : TicTacToe.PLAYER.O;
      this.mPlayer2.player = (firstPlayer === 0) ?
          TicTacToe.PLAYER.O : TicTacToe.PLAYER.X;
      this.mCurrentPlayer = TicTacToe.PLAYER.X;

      this.mPlayer1.channel.send({ event: 'joined',
                                   player: this.mPlayer1.player,
                                   opponent: this.mPlayer2.name });
      this.mPlayer2.channel.send({ event: 'joined',
                                   player: this.mPlayer2.player,
                                   opponent: this.mPlayer1.name });
    },

    /**
     * Broadcasts a message to all of this object's known channels.
     * @param {Object|string} message the message to broadcast.
     */
    broadcast: function(message) {
      this.mChannelHandler.getChannels().forEach(
        function(channel) {
          channel.send(message);
        });
    }

  };

  // Exposes public functions and APIs
  cast.TicTacToe = TicTacToe;
})();
