Template.body.helpers({
  playerID:()=>{
    if(Session.get('player')){
      return true;
    }
  }
});

Template.body.events({
  'click .white':()=>{
    Session.set('player', 'white');
  },
  'click .black':()=>{
    Session.set('player', 'black');
  },
});