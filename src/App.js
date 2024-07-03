/*
 * @Author: AJ Javadi
 * @Email: amirjavadi25@gmail.com
 * @Date: 2024-07-02 21:36:57
 * @Last Modified by: AJ Javadi
 * @Last Modified time: 2024-07-02 23:30:49
 * @Description: file:///Users/aj/sandbox/lydia/src/App.js
 * - create an audio context and oscillators for different waverorms
 */

import React, { useState, useEffect, useRef } from "react";
import { Midi } from "@tonejs/midi";
import "./App.css";

// initialize the app
const App = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [oscillators, setOscillators] = useState([]);
  const [currentPattern, setCurrentPattern] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120); // 120 BPM
  const [scale, setScale] = useState("C"); // C Major

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);
  }, []);

  //  create an oscillator
  const createOscillator = (type) => {
    const osc = audioContext.createOscillator();
    osc.type = type;
    osc.connect(audioContext.destination);
    return osc;
  };

  // start an oscillator
  const startOscillator = (oscillator) => {
    oscillator.start();
  };

  // stop oscillator
  const stopOscillator = (oscillator) => {
    oscillator.stop();
  };

  // Generate a random pattern based on the selected scale
  // for simplicity, we will use a fixed pattern here
  const generatePattern = () => {
    // TODO: change this to random later
    const pattern = [
      { time: 0, type: "sine" },
      { time: 0.5, type: "square" },
      { time: 1, type: "sawtooth" },
      { time: 1.5, type: "triangle" },
    ];
    setCurrentPattern(pattern);
  };

  // play the pattern (if there is audio context and if the pattern is not over)
  const playPattern = () => {
    if (!audioContext || !currentPattern.length) return;

    currentPattern.forEach((note) => {
      const osc = createOscillator(note.type);
      osc.start(audioContext.curentTime + note.time);
      osc.stop(audioContext.curentTime + note.time);
      osc.stop(audioContext.currentTime + note.time + 0.25);
    });
  };

  //  EXPORTS

  //  record Audio
  const recordAudio = () => {
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);

    currentPattern.forEach((note) => {
      const osc = createOscillator(note.type);
      osc.connect(mediaStreamDestination);
      osc.start(audioContext.curentTime + note.time);
      osc.stop(audioContext.curentTime + note.time + 0.25);
    });

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000); // Record for 5 seconds  //TODO: change to as long as they want

    mediaRecorder.ondataavailable = (e) => {
      const blob = new Blob([e.data], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sequence.wav";
      a.click();
    };
  };

  //  export MIDI

  const exportMidi = () => {
    const midi = new Midi();
    const track = midi.addTrack();
    currentPattern.forEach((note) => {
      track.addNote({
        midi: 60, // Middle C //TODO: need to create a doc with all of the standard MIDIs
        time: note.time,
        duration: 0.25,
      });
    });
    const midiData = midi.toArray();
    const blob = new Blob([midiData], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sequence.mid"; //TODO: add timestampp to the end of the sequence.mid name
    a.click();
  };

  // return
  // JSX

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lydia -- The Online Sequencer </h1>
        <article>
          <p> Courtey of AJ Javadi </p>
        </article>
        <div>
          <button onClick={generatePattern}>Generate Pattern</button>
          <button onClick={playPattern}>Play Pattern</button>
          <button onClick={recordAudio}>Record Audio</button>
          <button onClick={exportMidi}>Export MIDI</button>
        </div>
      </header>
    </div>
  );
};

export default App;
