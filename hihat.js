function createClosedHiHat(audioContext) {
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
  distortion.curve = makeDistortionCurve(0);
  distortion.oversample = "4x";

  // Set up the filter node as a bandpass filter
  var filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 11175;
  filter.Q.value = 2;

  return {
    trigger: function() {
      var noise = context.createBufferSource();
      var noiseGain = context.createGain();

      // Set up the noise buffer
      var bufferSize = 2 * context.sampleRate;
      var noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
      var output = noiseBuffer.getChannelData(0);

      for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      noise.buffer = noiseBuffer;
      noise.loop = true;

      // Set up the noise gain node with ADSR controls
      var attackTime = 0.001;
      var decayTime = 0.1;
      var sustainLevel = 0.01;
      var releaseTime = 0.1;
      var now = context.currentTime;

      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(1, now + attackTime);
      noiseGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
      noiseGain.gain.setValueAtTime(sustainLevel, now + attackTime + decayTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + attackTime + decayTime + releaseTime);

      // Connect the nodes together
      noise.connect(noiseGain);
      noiseGain.connect(filter);
      filter.connect(distortion);
      distortion.connect(context.destination);

      // Start the noise
      noise.start();
      setTimeout(() => {
        noise.stop();
      }, releaseTime * 1000);
    },
  };
}

// Export the createClosedHihat function
export function createVoice(audioContext) {
  return createClosedHiHat(audioContext);
}
