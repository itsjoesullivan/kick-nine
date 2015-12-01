(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"noise-buffer":3}],2:[function(require,module,exports){
var Kick9 = require('./index');

var context = new AudioContext();

var kick = Kick9(context);

document.getElementById('kick').addEventListener('click', function(e) {
  var node = kick();
  node.connect(context.destination);
  node.start(context.currentTime + 0.1);
});

},{"./index":1}],3:[function(require,module,exports){
// courtesy of http://noisehack.com/generate-noise-web-audio-api/
module.exports = function(length) {
  var sampleRate = 44100;
  var samples = length * sampleRate;
  var context = new OfflineAudioContext(1, samples, sampleRate);
  var noiseBuffer = context.createBuffer(1, samples, sampleRate);

  var output = noiseBuffer.getChannelData(0);
  for (var i = 0; i < samples; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
};

},{}]},{},[2]);
