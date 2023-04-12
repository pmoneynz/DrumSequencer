function createSnare(audioContext) {
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

  // Set up the filter node as a low pass Butterworth filter
  var filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 5587.7;
  filter.Q.value = 4;

  // Set up the high pass filter
  var highpassFilter = context.createBiquadFilter();
  highpassFilter.type = 'highpass';
  highpassFilter.frequency.value = 349.2;
  highpassFilter.Q.value = 4;

  return {
    trigger: function () {
      var osc1 = context.createOscillator();
      var osc2 = context.createOscillator();
      var gain = context.createGain();
      var noise = context.createBufferSource();
      var noiseGain = context.createGain();

      // Set up the oscillators
      osc1.type = "sine";
      osc1.frequency.value = 174.6;
      osc2.type = "sine";
      osc2.frequency.value = 349.2;

      // Set up the gain node with ADSR controls
      var attackTime = 0.001; 
      var decayTime = 0.15;
      var sustainLevel = 0.01;
      var releaseTime = 0.01;
      var now = context.currentTime;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + attackTime);
      gain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
      gain.gain.setValueAtTime(sustainLevel, now + attackTime + decayTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + attackTime + decayTime + releaseTime);

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
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(1, now + attackTime);
      noiseGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
      noiseGain.gain.setValueAtTime(sustainLevel, now + attackTime + decayTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + attackTime + decayTime + releaseTime);

      // Connect the nodes together
      osc1.connect(gain);
      osc2.connect(gain);
      noise.connect(noiseGain);
      gain.connect(distortion);
      noiseGain.connect(distortion);
      distortion.connect(filter);
      filter.connect(highpassFilter);
      highpassFilter.connect(context.destination);

      // Start the oscillators and noise
      osc1.start();
      osc2.start();
      noise.start();
      setTimeout(function () {
        osc1.stop();
        osc2.stop();
        noise.stop();
      }, 300);
    },
  };
}

// Export the createSnare function
export function createVoice(audioContext) {
  return createSnare(audioContext);
}
