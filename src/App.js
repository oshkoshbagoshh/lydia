/*
 * @Author: AJ Javadi
 * @Email: amirjavadi25@gmail.com
 * @Date: 2024-07-02 21:36:57
 * @Last Modified by: AJ Javadi
 * @Last Modified time: 2024-07-02 22:17:11
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


const playPattern = () => {
  if (!audioContext || !currentPattern.length) return;
  
  currentPattern.forEach(note => {
    const osc = createOscillator(note.type);
    osc.start(audioContext.curentTime + note.time);
    osc.stop(audioContext.curentTime + note.time);
    osc.stop(audioContext.currentTime + note.time + 0.25);

  });
  

  
};
