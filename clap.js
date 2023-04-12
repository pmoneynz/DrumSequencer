function createClap(audioContext) {
  var context = audioContext;
  var noteFrequencies = [3600, 1800, 5000, 2400];
  var delayTimes = [0, 17, 23, 37];

  return {
    trigger: function () {
      for (var i = 0; i < noteFrequencies.length; i++) {
        var noise = audioContext.createBufferSource();
        var noiseGain = audioContext.createGain();
        noiseGain.gain.value = 0;

        // Set up the lowpass filter
        var lowpassFilter = audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.value = 14000;
        lowpassFilter.Q.value = 10;

        // Set up the highpass filter
        var highpassFilter = audioContext.createBiquadFilter();
        highpassFilter.type = 'highpass';
        highpassFilter.frequency.value = 800; 
        highpassFilter.Q.value = 7;

        var filterNode = audioContext.createBiquadFilter();
        filterNode.type = "lowpass";
        filterNode.frequency.value = noteFrequencies[i];
        filterNode.Q.value = 1;

        var delayNode = audioContext.createDelay();
        delayNode.delayTime.value = delayTimes[i] / 1000;

        var attackTime = 0.001;
        var decayTime = 0.1;
        var sustainLevel = 0.005;
        var releaseTime = i === 3 ? 0.8 : 0.0001;
        var now = audioContext.currentTime;

        // Set up the noise buffer
        var bufferSize = 2 * audioContext.sampleRate;
        var noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        var output = noiseBuffer.getChannelData(0);

        for (var j = 0; j < bufferSize; j++) {
          output[j] = Math.random() * 2 - 1;
        }

        noise.buffer = noiseBuffer;
        noise.loop = true;

        // Set up the noise gain node with ADSR controls
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.4, now + attackTime);
        noiseGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noiseGain.gain.setValueAtTime(sustainLevel, now + attackTime + decayTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.00001, now + attackTime + decayTime + releaseTime);

        // Connect the nodes together
        noise.connect(noiseGain);
        noiseGain.connect(lowpassFilter);
        lowpassFilter.connect(highpassFilter);
        highpassFilter.connect(filterNode);
        filterNode.connect(delayNode);
        delayNode.connect(audioContext.destination);

        // Start the noise
        noise.start();
        setTimeout((function(index) {
          return function() {
            noise.stop();
            noise.disconnect();
          };
        })(i), delayTimes[i] + 1000);
      }
    },
  };
}

// Export the createClap function
export function createVoice(audioContext) {
  return createClap(audioContext);
}
