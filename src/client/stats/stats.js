import {gameState} from '../main-game/main-game';

Template.stats.helpers({
  getStats:()=>{
    console.log(gameState.get());
    if(gameState.get() === undefined){
      console.log('Game not initialised');
    } else {

    }
    // let turn = 'White';
    // if(game.turn() === 'b'){
    //   turn = 'Black';
    // }

    // return {
    //   turn: turn
    // }

  }
});