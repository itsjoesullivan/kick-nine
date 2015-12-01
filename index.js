var NoiseBuffer = require('noise-buffer');

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

module.exports = function(context) {
  return function() {
    var node = context.createGain();
    var osc = context.createOscillator();
    osc.connect(node);

    var distortion = context.createWaveShaper();
    distortion.curve = [0,1];
    distortion.oversample = '4x';

    osc.connect(distortion);
    distortion.connect(node);

    var noiseSource = context.createBufferSource();
    noiseSource.buffer = NoiseBuffer(0.2);

    var noiseLowpass = context.createBiquadFilter();
    noiseLowpass.type = "lowpass";
    noiseLowpass.frequency.value = 3000;

    var noisePath = context.createGain();
    noisePath.connect(node);
    noiseSource.connect(noiseLowpass);
    noiseLowpass.connect(noisePath);

    node.start = function(when) {
      if (typeof when !== 'number') {
        when = context.currentTime;
      }
      node.gain.setValueAtTime(1, when);
      node.gain.exponentialRampToValueAtTime(0.0001, when + 1)

      osc.start(when);
      osc.frequency.setValueAtTime(180, when);
      osc.frequency.exponentialRampToValueAtTime(55, when + 0.1);

      noiseSource.start(when);
      noisePath.gain.exponentialRampToValueAtTime(0.0001, when + 0.001);


    };
    node.stop = function(when) {
      if (typeof when !== 'number') {
        when = context.currentTime;
      }
    };
    return node;
  };

};
