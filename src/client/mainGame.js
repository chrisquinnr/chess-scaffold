import {Chess} from 'chess';
import {Session} from 'meteor/session';
import {Streamy} from 'meteor/yuukan:streamy';
import buzz from 'buzz';


export let game = new Chess();
export let board = false;

// Client
Streamy.on('game', function(data) {
  console.log(data);
  Session.set('fen', data.fen)
  game.load(data.fen);
  board.position(game.fen());
});

Template.mainGame.onRendered(()=>{

  var removeGreySquares = function() {
    $('#board .square-55d63').css('background', '');
  };

  var greySquare = function(square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
      background = '#696969';
    }

    squareEl.css('background', background);
  };

  var onDragStart = function(source, piece) {
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
      return false;
    }
  };

  var onDrop = function(source, target) {
    removeGreySquares();

    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return 'snapback';
  };

  var onMouseoverSquare = function(square, piece) {
    // get list of possible moves for this square
    var moves = game.moves({
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

  var onMouseoutSquare = function(square, piece) {
    removeGreySquares();
  };

  var onSnapEnd = function() {
    board.position(game.fen());
    Session.set('fen', game.fen());

    Streamy.broadcast('game', { fen: game.fen(), turn: game.turn() });

    let rand = _.random(1,3);
    if(rand == 4){
      var sound = new buzz.sound("/effects/zombie" + rand, {
        formats: [ "flac"]
      });
    } else {
      var sound = new buzz.sound("/effects/zombie" + rand, {
        formats: [ "wav"]
      });
    }


    console.log(sound);
    sound.play();
  };

  var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
  };
  if(Session.get('player') === 'black'){
    cfg.orientation = 'black';
    cfg.position = Session.get('fen')
  }
  board = ChessBoard('board', cfg);
});