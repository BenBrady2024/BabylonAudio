const { firefox } = require('playwright');

(async () => {
  // Open Browser
  const browser = await firefox.launch({ headless: false });

  // Open Context
  const context = await browser.newContext();

  // Open Page
  const page = await context.newPage();

  const CONTEXT = await page.evaluate(async () => {
    async function playAndVisualizeAudio(url) {
      // Create Audio Context
      const audioCtx = new AudioContext();

      // Create an analyser node
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048; // Sets the size of the FFT used for frequency-domain analysis
      const bufferLength = analyser.frequencyBinCount; // Half of fftSize
      const dataArray = new Uint8Array(bufferLength); // Array to hold the time-domain data

      // Fetch the audio file from the URL
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      // Decode the audio data
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Create a buffer source node and set the buffer
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      // Connect the source to the analyser, and then to the context's destination (speakers)
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      // Start playing the audio
      source.start();

      // Set up a canvas for visualization
      const canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
      const canvasCtx = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 200;

      // Visualization function
      function draw() {
        requestAnimationFrame(draw);

        // Get the time-domain data from the analyser
        analyser.getByteTimeDomainData(dataArray);

        // Clear the canvas
        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the waveform
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // Normalize the data
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      }

      // Start visualizing
      draw();
    }

    // URL of the audio file to play and visualize
    const audioUrl = 'https://downloads.khinsider.com/game-soundtracks/album/banjo-tooie-complete/68.%2520Level%25204%2520-%2520Jolly%2520Roger%2527s%2520Lagoon.mp3';

    // Play and visualize the audio
    await playAndVisualizeAudio(audioUrl);

    return 'Audio playing and visualization started!';
  });

  // Go to a test webpage if needed
  await page.goto('https://playground.babylonjs.com/#SPLFNK#1');
  console.log("Webpage Loaded");

  // Closing Browsers
  await context.close();
  await browser.close();
})();
