function initAudioContext() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  kick = createKick(audioContext);
  snare = createSnare(audioContext);
  clap = createClap(audioContext);
  hihat = createHiHat(audioContext);
}

import { createVoice as createKick } from "./kick.js";
import { createVoice as createSnare } from "./snare.js";
import { createVoice as createClap } from "./clap.js";
import { createVoice as createHiHat } from "./hihat.js";

let audioContext;
let isPlaying = false;
let currentStep = 0;
const bpm = 100;
let sequenceInterval;

let kick, snare, clap, hihat;

function startSequencer() {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  isPlaying = true;
  sequenceInterval = setInterval(playSequence, (30 / bpm) * 1000);
}

function stopSequencer() {
  isPlaying = false;
  clearInterval(sequenceInterval);
  currentStep = 0; // Reset the current step to the beginning when the sequencer is stopped
}

function toggleSequencer() {
  var button = document.querySelector("button");
  if (isPlaying) {
    stopSequencer();
    button.classList.remove("stop");
    button.classList.add("play");
    button.textContent = 'Play'; // Update the button text to 'Play'
  } else {
    startSequencer();
    button.classList.remove("play");
    button.classList.add("stop");
    button.textContent = 'Stop'; // Update the button text to 'Stop'
  }
}


function toggleCell(cell) {
  cell.classList.toggle("on");
}

function playSynth(track) {
  switch (track) {
    case "kick":
      kick.trigger();
      break;
    case "snare":
      snare.trigger();
      break;
    case "clap":
      clap.trigger();
      break;
    case "hihat":
      hihat.trigger();
      break;
    default:
      break;
  }
}

function playSequence() {
  var cells = document.querySelectorAll(".cell");

  for (var i = 0; i < 4; i++) {
    var cell = cells[currentStep + i * 16];
    if (cell.classList.contains("on")) {
      playSynth(cell.dataset.track);
    }
  }

  currentStep = (currentStep + 1) % 16;
}

document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("grid");
  var cells = grid.getElementsByClassName("cell");
  for (var i = 0; i < cells.length; i++) {
    cells[i].addEventListener("click", function () {
      toggleCell(this);
    });
        // Add the row class to the cell
    if (i < 16) {
      cells[i].classList.add("row1");
    } else if (i < 32) {
      cells[i].classList.add("row2");
    } else if (i < 48) {
      cells[i].classList.add("row3");
    } else {
      cells[i].classList.add("row4");
    }
  }

  var toggleButton = document.getElementById('toggleSequencer');
  toggleButton.addEventListener('click', function() {
    if (!audioContext) {
      initAudioContext();
    }
    toggleSequencer();
  });

  document.addEventListener("keydown", function (event) {
    if (event.code === "Space") { // Check if the pressed key is the spacebar
      event.preventDefault(); // Prevent scrolling with spacebar in some browsers
      if (!audioContext) {
        initAudioContext();
      }
      toggleSequencer();
    }
  });
}); 