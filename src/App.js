
import React, { useState, useEffect, useRef } from "react";
import { Midi } from "@tonejs/midi";
import * as d3 from "d3";
import "./App.css";
import "./App.scss";

// initialize the app
const App = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [gainNode, setGainNode] = useState(null);
  const [eqNodes, setEqNodes] = useState([]);
  const [delayNode, setDelayNode] = useState(null);
  const [filterNode, setFilterNode] = useState(null);
  const [reverbNode, setReverbNode] = useState(null);
  const [currentPattern, setCurrentPattern] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120); // 120 BPM
  const [scale, setScale] = useState("C"); // C Major
  const [duration, setDuration] = useState(4); // 4 bars
  const gainRef = useRef(null);
  const delayRef = useRef(null);
  const filterRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const gain = context.createGain();
    const delay = context.createDelay();
    const filter = context.createBiquadFilter();
    const reverb = context.createConvolver();
    const eq = [
      createEqNode(context, 32),
      createEqNode(context, 64),
      createEqNode(context, 125),
      createEqNode(context, 250),
      createEqNode(context, 500),
      createEqNode(context, 1000),
      createEqNode(context, 2000),
      createEqNode(context, 4000),
      createEqNode(context, 8000),
      createEqNode(context, 16000),
    ];

    gain.connect(context.destination);
    eq.forEach((node, i) => {
      if (i === 0) {
        node.connect(gain);
      } else {
        eq[i - 1].connect(node);
      }
    });
    filter.connect(eq[eq.length - 1]);
    delay.connect(filter);
    reverb.connect(delay);
    setAudioContext(context);
    setGainNode(gain);
    setDelayNode(delay);
    setFilterNode(filter);
    setReverbNode(reverb);
    setEqNodes(eq);
  }, []);

  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = gainRef.current.value;
    }
    if (delayNode) {
      delayNode.delayTime.value = delayRef.current.value;
    }
    if (filterNode) {
      filterNode.frequency.value = filterRef.current.value;
    }
    if (reverbNode) {
      // Reverb settings would typically involve loading an impulse response file
      // For simplicity, we are not changing the reverb settings dynamically here
    }
  }, [gainNode, delayNode, filterNode, reverbNode]);

  const createEqNode = (context, frequency) => {
    const eq = context.createBiquadFilter();
    eq.type = "peaking";
    eq.frequency.value = frequency;
    eq.Q.value = 1;
    eq.gain.value = 0;
    return eq;
  };

  //  create an oscillator
  const createOscillator = (type) => {
    const osc = audioContext.createOscillator();
    osc.type = type;
    osc.connect(reverbNode);
    return osc;
  };

  // start an oscillator
  const startOscillator = (oscillator, time) => {
    if (isFinite(time)) {
      oscillator.start(time);
    } else {
      console.error("Invalid start time:", time);
    }
  };

  // stop oscillator
  const stopOscillator = (oscillator, time) => {
    if (isFinite(time)) {
      oscillator.stop(time);
    } else {
      console.error("Invalid stop time:", time);
    }
  };

  // Generate a random pattern based on the selected scale
  const generatePattern = () => {
    const scales = {
      C: ["C", "D", "E", "F", "G", "A", "B"],
      G: ["G", "A", "B", "C", "D", "E", "F#"],
      D: ["D", "E", "F#", "G", "A", "B", "C#"],
      A: ["A", "B", "C#", "D", "E", "F#", "G#"],
      E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
      B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
      F: ["F", "G", "A", "Bb", "C", "D", "E"],
    };

    const scaleNotes = scales[scale];
    const waveforms = ["sine", "square", "sawtooth", "triangle"];
    const pattern = [];
    const noteDuration = (60 / bpm) / 2; // Each note lasts for half a beat
    const totalNotes = (duration * bpm) / 30; // Total notes based on duration and BPM

    for (let i = 0; i < totalNotes; i++) {
      const time = i * noteDuration;
      const type = waveforms[Math.floor(Math.random() * waveforms.length)];
      pattern.push({ time, type });
    }

    setCurrentPattern(pattern);
  };

  // play the pattern (if there is audio context and if the pattern is not over)
  const playPattern = () => {
    if (!audioContext || !currentPattern.length) return;

    const noteDuration = (60 / bpm) / 2; // Each note lasts for half a beat

    currentPattern.forEach((note) => {
      const osc = createOscillator(note.type);
      const startTime = audioContext.currentTime + note.time;
      startOscillator(osc, startTime);
      stopOscillator(osc, startTime + noteDuration);

      // Update the visualization
      d3.select(`#note-${note.time}`)
        .classed("active", true)
        .transition()
        .delay(startTime * 1000)
        .duration(noteDuration * 1000)
        .classed("active", false);
    });
  };

  // return
  // JSX
  
  //  EXPORTS
  
  //  record Audio
  const recordAudio = () => {
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
  
    currentPattern.forEach((note) => {
      const osc = createOscillator(note.type);
      osc.connect(mediaStreamDestination);
      const startTime = audioContext.currentTime + note.time;
      startOscillator(osc, startTime);
      stopOscillator(osc, startTime + noteDuration);
    });
  
    mediaRecorder.start();
  
    setTimeout(() => {
      mediaRecorder.stop();
    }, duration * 60 * 1000 / bpm); // Record for the duration specified
  
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
  ;
  
  const exportMidi = () => {
    const midi = new Midi();
    const track = midi.addTrack();
  
    currentPattern.forEach((note) => {
      track.addNote({
        midi: 60, // Middle C
        time: note.time,
        duration: noteDuration,
      });
    });
    const midiData = midi.toArray();
    const blob = new Blob([midiData], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sequence.mid";
  };
  
  // return
  // JSX
  
  return (
    <div className="App">
      <h1>Audio Synthesizer</h1>
      <div className="controls">
        <label>
          BPM:
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            />
        </label>
      </div>
    </div>
  );

}

export default App;