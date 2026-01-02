// Variables for tracking beats and bpm

const BPM_CONVERSION_FACTOR = 60_000;
const MS_CONVERSION_FACTOR = 1_000;
const LOCAL_STORAGE_INPUT_TYPE_KEY = "bpmInputType";
const DEFAULT_INPUT_TYPE_ID = "any-input";

const bpmElem = document.getElementById("bpm");
const beatsElem = document.getElementById("beat-count");
const timeElem = document.getElementById("time");
const timeBetweenBeatsElem = document.getElementById("time-between-beats");

let startMs, beats, elapsedMs;

const resetBeats = () => {
  startMs = undefined;
  beats = 0;
  elapsedMs = 0;

  updateBeatDisplay();
};

const updateBeatDisplay = () => {
  beatsElem.innerText = `${beats}`;
  const elapsedSecs = elapsedMs / MS_CONVERSION_FACTOR;
  timeElem.innerText = `${elapsedSecs.toFixed(3)}`;

  // The BPM only makes sense if there have been at least 2 beats
  // If not, display defaults
  const calcBpm = beats >= 2;

  const timeBetweenBeats = calcBpm ? elapsedSecs / (beats - 1) : 0;
  timeBetweenBeatsElem.innerText = `${timeBetweenBeats.toFixed(3)}`;

  const bpm = calcBpm
    ? Math.floor((BPM_CONVERSION_FACTOR * (beats - 1)) / elapsedMs)
    : 0;
  bpmElem.innerText = `${bpm}`;
};

const countBeat = () => {
  beats++;
  if (!startMs) {
    startMs = new Date().getTime();
  } else {
    elapsedMs = new Date().getTime() - startMs;
  }

  updateBeatDisplay();
};

// Handle changes to the user's settings

const updateInstructions = () => {
  const instructions = document.getElementById("instructions");
  if (document.getElementById("click-only").checked) {
    instructions.innerText = "Click or tap anywhere to register a beat.";
  } else if (document.getElementById("key-only").checked) {
    instructions.innerText = "Press any key to register a beat.";
  } else {
    instructions.innerText =
      "Click or tap anywhere, or press any key, to register a beat.";
  }
};

// Save settings in local storage
const saveSettings = () => {
  for (input of document.querySelectorAll("input[name='input-type']")) {
    if (input.checked) {
      localStorage.setItem(LOCAL_STORAGE_INPUT_TYPE_KEY, input.id);
      break;
    }
  }
};

// Read settings from local storage if they exist and apply them
const getSettings = () => {
  const inputId =
    localStorage.getItem(LOCAL_STORAGE_INPUT_TYPE_KEY) ?? DEFAULT_INPUT_TYPE_ID;
  document.getElementById(inputId).checked = true;
};

const onSettingsChange = () => {
  saveSettings();
  updateInstructions();
};

const initSettings = () => {
  getSettings();
  updateInstructions();
};

// Set up listeners for click and keyboard events

const NAVIGATION_KEYS = ["Tab", "Escape"];
const BUTTON_INTERACTION_KEYS = [" ", "Enter"];
const settingsModal = document.getElementById("settings-modal");

const attachBeatListeners = () => {
  const rootElem = document.querySelector("html");
  rootElem.addEventListener("click", (e) => {
    if (settingsModal.open) return;
    if (document.getElementById("key-only").checked) return;

    // Keyboard interactions that trigger buttons cause both click and keydown events;
    // don't count them
    if (e.target.tagName === "BUTTON") return;

    countBeat();
  });

  rootElem.addEventListener("keydown", (e) => {
    if (settingsModal.open) return;
    if (document.getElementById("click-only").checked) return;
    if (NAVIGATION_KEYS.includes(e.key)) return;

    // Keyboard interactions that trigger buttons cause both click and keydown events;
    // don't count them, but do count other key presses even when buttons are focused
    if (
      e.target.tagName === "BUTTON" &&
      BUTTON_INTERACTION_KEYS.includes(e.key)
    ) {
      return;
    }

    countBeat();
  });
};

const attachSettingsListeners = () => {
  document.querySelectorAll("input[name='input-type']").forEach((elem) =>
    elem.addEventListener("click", () => {
      onSettingsChange();
    })
  );

  // Workaround for browsers that don't support command/commandfor
  document
    .getElementById("show-settings-modal")
    .addEventListener("click", () => {
      settingsModal.showModal();
    });
  document
    .getElementById("close-settings-modal")
    .addEventListener("click", () => {
      settingsModal.close();
    });
};

const attachResetButtonListener = () => {
  const resetButton = document.getElementById("reset");
  resetButton.addEventListener("click", () => {
    resetBeats();
  });
};

// Main entry point

function main() {
  resetBeats();

  attachBeatListeners();
  attachSettingsListeners();
  attachResetButtonListener();

  initSettings();
}
main();
