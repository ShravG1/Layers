// Voice recording with parallel transcription via the Web Speech API.

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isMediaRecorderSupported() {
  return typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined';
}

export function createRecorder({ onTranscriptChange, onLevel, onError }) {
  let mediaRecorder = null;
  let stream = null;
  let chunks = [];
  let recognition = null;
  let transcript = '';
  let interim = '';
  let audioCtx = null;
  let analyser = null;
  let levelRaf = null;

  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (SR) {
    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';
    recognition.onresult = (ev) => {
      interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) transcript += r[0].transcript + ' ';
        else interim += r[0].transcript;
      }
      onTranscriptChange?.((transcript + ' ' + interim).trim());
    };
    recognition.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') onError?.(e.error);
    };
  }

  async function start() {
    chunks = [];
    transcript = '';
    interim = '';
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      onError?.('mic-denied');
      throw e;
    }

    if (isMediaRecorderSupported()) {
      const mime = pickMime();
      try {
        mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      } catch {
        mediaRecorder = new MediaRecorder(stream);
      }
      mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      mediaRecorder.start();
    }

    if (recognition) {
      try { recognition.start(); } catch { /* already started */ }
    }

    // Audio level for waveform
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = Math.abs(buf[i] - 128) / 128;
          if (v > peak) peak = v;
        }
        onLevel?.(peak);
        levelRaf = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* level meter is optional */ }
  }

  function stop() {
    return new Promise((resolve) => {
      const finish = async () => {
        if (recognition) { try { recognition.stop(); } catch { /* */ } }
        if (levelRaf) cancelAnimationFrame(levelRaf);
        if (audioCtx) { try { await audioCtx.close(); } catch { /* */ } }
        if (stream) stream.getTracks().forEach(t => t.stop());
        let audioDataUrl = null;
        if (chunks.length) {
          const blob = new Blob(chunks, { type: chunks[0].type || 'audio/webm' });
          audioDataUrl = await blobToDataUrl(blob);
        }
        resolve({ transcript: (transcript + ' ' + interim).trim(), audioDataUrl });
      };

      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = finish;
        mediaRecorder.stop();
      } else {
        finish();
      }
    });
  }

  function cancel() {
    if (recognition) { try { recognition.abort(); } catch { /* */ } }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') { try { mediaRecorder.stop(); } catch { /* */ } }
    if (levelRaf) cancelAnimationFrame(levelRaf);
    if (audioCtx) { try { audioCtx.close(); } catch { /* */ } }
    if (stream) stream.getTracks().forEach(t => t.stop());
  }

  return { start, stop, cancel };
}

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return candidates.find(c => MediaRecorder.isTypeSupported?.(c)) || null;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
