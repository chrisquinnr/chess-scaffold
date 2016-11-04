import {Chess} from 'chess';
import {Session} from 'meteor/session';
import {Streamy} from 'meteor/yuukan:streamy';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';

let game = new Chess();
let board = false;

export var gameState = new ReactiveVar();

Template.mainGame.onRendered(()=>{

  let onDragMove = function(newLocation, oldLocation, source,
      piece, position, orientation) {
    // console.log("New location: " + newLocation);
    // console.log("Old location: " + oldLocation);
    // console.log("Source: " + source);
    // console.log("Piece: " + piece);
    // console.log("Position: " + ChessBoard.objToFen(position));
    // console.log("Orientation: " + orientation);
    // console.log("--------------------");

  };

  let removeGreySquares = function() {
    $('#board .square-55d63').css('background', '');
  };

  let greySquare = function(square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
      background = '#696969';
    }

    squareEl.css('background', background);
  };

  let onDragStart = function(source, piece) {
    // do not pick up pieces if the game is over
    // or if it's not that side's turn

    if(Session.get('player') === 'black'){
      if(game.turn() === 'w'){
        return false;
      }
    }

    if(Session.get('player') === 'white'){
      if(game.turn() === 'b'){
        return false;
      }
    }

    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {

      gameState.set('over');
      return false;
    }
  };

  let onDrop = function(source, target) {
    removeGreySquares();

    // see if the move is legal
    let move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return 'snapback';

    console.log(move);
    if(move && move.captured){
      $('#board').addClass('shake');
      let target = move.to;
      $('[data-square='+target+']').addClass('bomb');
      setTimeout(()=>{
        $('#board').removeClass('shake');
      },800);
    }

  };

  let onMouseoverSquare = function(square, piece) {
    // get list of possible moves for this square
    let moves = game.moves({
      square: square,
      verbose: true
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    // highlight the square they moused over
    greySquare(square);

    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      greySquare(moves[i].to);
    }
  };

  let onMouseoutSquare = function(square, piece) {
    removeGreySquares();
  };

  let onSnapEnd = function() {
    // Update the local render
    board.position(game.fen());

    let state = { game: game.fen(), data: board };

    // Set the game state
    gameState.set(state);

    // And broadcast to opponent
    Streamy.broadcast('game', state);
  };


  let cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    snapSpeed: 'fast',
    onSnapEnd: onSnapEnd,
    showNotation: false,
    onDragMove: onDragMove
  };
  if(Session.get('player') === 'black'){
    cfg.orientation = 'black';
    if(gameState.get() && gameState.get().fen()){
      cfg.position = gameState.get().fen()
    }
  }
  board = ChessBoard('board', cfg);

  // Listen for opponent moves
  Streamy.on('game', function(data) {

    // Update our local gamestate
    gameState.set(data);

    // Set the game logic
    game.load(data.game);

    // Update the view
    board.position(game.fen());
  });
});