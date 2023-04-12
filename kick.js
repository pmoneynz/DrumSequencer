function createKick(audioContext) {
  var context = audioContext;

  function makeDistortionCurve(amount) {
    var n_samples = 44100;
    var curve = new Float32Array(n_samples);
    var deg = Math.PI / 180;
    var x;
    for (var i = 0; i < n_samples; ++i) {
      x = i * 2 / n_samples - 1;
      curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  // Set up the distortion node with a subtle curve
  var distortion = context.createWaveShaper();
  distortion.curve = makeDistortionCurve(20);
  distortion.oversample = "4x";

  // Set up the filter node as a low pass Butterworth filter
  var filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;
  filter.Q.value = 8;

  return {
    trigger: function () {
      var osc1 = context.createOscillator();
      var osc2 = context.createOscillator();
      var gain = context.createGain();

      // Set up the oscillators
      osc1.type = "sine";
      osc1.frequency.value = 87.3;
      osc1.detune.value = -10;
      osc2.type = "sine";
      osc2.frequency.value = 43.7;
      osc2.detune.value = 10;

      // Set up the gain node with ADSR controls
      var attackTime = 0.0001;
      var decayTime = 1.0;
      var sustainLevel = 2.0;
      var releaseTime = 1.0;
      var now = context.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.6, now + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.000001, now + attackTime + decayTime + releaseTime);

      // Connect the nodes together
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(filter);
      distortion.connect(filter);
      filter.connect(context.destination);

      // Start the oscillators
      osc1.start();
      osc2.start();
      setTimeout(function () {
        osc1.stop();
        osc2.stop();
      }, releaseTime * 1000);
    },
  };
}

// Export the createKick function
export function createVoice(audioContext) {
  return createKick(audioContext);
}
