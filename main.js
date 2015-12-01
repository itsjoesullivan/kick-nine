var Kick9 = require('./index');

var context = new AudioContext();

var kick = Kick9(context);

document.getElementById('kick').addEventListener('click', function(e) {
  var node = kick();
  node.connect(context.destination);
  node.start(context.currentTime + 0.1);
});
