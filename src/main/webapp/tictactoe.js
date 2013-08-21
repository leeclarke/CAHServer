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
{"id":52, "content": "World of Warcraft..","type": "W"}];

  /**
   * Creates a TicTacToe object with an optional board and attaches a
   * cast.receiver.ChannelHandler, which receives messages from the
   * channel between the sender and receiver.
   * @param {board} opt_board an optional game board.
   * @constructor
   */
  function TicTacToe(opt_board) {
    this.mBoard = opt_board;
    this.mPlayer1 = -1;
    this.mPlayer2 = -1;
    this.mCurrentPlayer;

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
    this.shuffleCards(TicTacToe.CARD_DECK);
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
      } else if (message.command == 'move') {
        this.onMove(channel, message);
      } else if (message.command == 'board_layout_request') {
        this.onBoardLayoutRequest(channel);
      } else {
        cast.log.error('Invalid message command: ' + message.command);
      }
      //TODO: ADD Czar fuctions, remove sample methods.
    },

    /**
     * Player joined event: registers a new player who joined the game, or
     * prevents player from joining if invalid.
     * @param {cast.receiver.channel} channel the channel the message came from.
     * @param {Object|string} message the name of the player who just joined.
     */
    onJoin: function(channel, message) {
      console.log('****onJoin: ' + JSON.stringify(message));

      if ((this.mPlayer1 != -1) &&
          (this.mPlayer1.channel == channel)) {
        this.sendError(channel, 'You are already ' +
                       this.mPlayer1.player +
                       ' You aren\'t allowed to play against yourself.');
        return;
      }
      if ((this.mPlayer2 != -1) &&
          (this.mPlayer2.channel == channel)) {
        this.sendError(channel, 'You are already ' +
                       this.mPlayer2.player +
                       ' You aren\'t allowed to play against yourself.');
        return;
      }

      if (this.mPlayer1 == -1) {
        this.mPlayer1 = new Object();
        this.mPlayer1.name = message.name;
        this.mPlayer1.channel = channel;
      } else if (this.mPlayer2 == -1) {
        this.mPlayer2 = new Object();
        this.mPlayer2.name = message.name;
        this.mPlayer2.channel = channel;
      } else {
        console.log('Unable to join a full game.');
        this.sendError(channel, 'Game is full.');
        return;
      }

      console.log('mPlayer1: ' + this.mPlayer1);
      console.log('mPlayer2: ' + this.mPlayer2);

      if (this.mPlayer1 != -1 && this.mPlayer2 != -1) {
        console.log('board setup');
        this.mBoard.reset();
        this.startGame_();
        console.log('end board setup');
      }
      console.log('**** End onJoin');
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
      var newCards  = [];
      
      for (var i = cardsNeeded - 1; i >= 0; i--) {
         newCards.push(TicTacToe.CARD_DECK.pop());    
       }; 
      //TODO: The debug doesnt work... but the results are correct.
      console.log(JSON.stringify(newCards));
      // channel.send({ event: 'error', message: errorMessage });
    },

    /**
     * Processes played cards sent from the user. Something needs to verify that user has submitted enough cards. maybe do this on the CC screen.
     */
    onPlayCards: function(channel, message){
      console.log('****onPlayCards: ' + JSON.stringify(message));

    },

    /**
     * Move event: checks whether a valid move was made and updates the board
     * as necessary.
     * @param {cast.receiver.channel} channel the source of the move, which
     *     determines the player.
     * @param {Object|string} message contains the row and column of the move.
     */
    onMove: function(channel, message) {
      console.log('****onMove: ' + JSON.stringify(message));
      var isMoveValid;

      if ((this.mPlayer1 == -1) || (this.mPlayer2 == -1)) {
        console.log('Looks like one of the players is not there');
        console.log('mPlayer1: ' + this.mPlayer1);
        console.log('mPlayer2: ' + this.mPlayer2);
        return;
      }

      if (this.mPlayer1.channel == channel) {
        if (this.mPlayer1.player == this.mCurrentPlayer) {
          if (this.mPlayer1.player == TicTacToe.PLAYER.X) {
            isMoveValid = this.mBoard.drawCross(message.row, message.column);
          } else {
            isMoveValid = this.mBoard.drawNaught(message.row, message.column);
          }
        } else {
          console.log('Ignoring the move. It\'s not your turn.');
          this.sendError(channel, 'It\'s not your turn.');
          return;
        }
      } else if (this.mPlayer2.channel == channel) {
        if (this.mPlayer2.player == this.mCurrentPlayer) {
          if (this.mPlayer2.player == TicTacToe.PLAYER.X) {
            isMoveValid = this.mBoard.drawCross(message.row, message.column);
          } else {
            isMoveValid = this.mBoard.drawNaught(message.row, message.column);
          }
        } else {
          console.log('Ignoring the move. It\'s not your turn.');
          this.sendError(channel, 'It\'s not your turn.');
          return;
        }
      } else {
        console.log('Ignorning message. Someone other than the current' +
            'players sent a move.');
        this.sendError(channel, 'You are not playing the game');
        return;
      }

      if (isMoveValid === false) {
        this.sendError(channel, 'Your last move was invalid');
        return;
      }

      var isGameOver = this.mBoard.isGameOver();
      this.broadcast({ event: 'moved',
                       player: this.mCurrentPlayer,
                       row: message.row,
                       column: message.column,
                       game_over: isGameOver });

      console.log('isGameOver: ' + isGameOver);
      console.log('winningLoc: ' + this.mBoard.getWinningLocation());

      // When the game should end
      if (isGameOver == true) {
        this.broadcastEndGame(this.mBoard.getGameResult(),
            this.mBoard.getWinningLocation());
      }
      // Switch current player
      this.mCurrentPlayer = (this.mCurrentPlayer == TicTacToe.PLAYER.X) ?
          TicTacToe.PLAYER.O : TicTacToe.PLAYER.X;
    },

    /**
     * Request event for the board layout: sends the current layout of pieces
     * on the board through the channel.
     * @param {cast.receiver.channel} channel the channel the event came from.
     */
    onBoardLayoutRequest: function(channel) {
      console.log('****onBoardLayoutRequest');
      var boardLayout = [];
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          boardLayout[i * 3 + j] = this.mBoard.mBoard[i][j];
        }
      }
      channel.send({ 'event': 'board_layout_response',
                     'board': boardLayout });
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
