const { firefox } = require('playwright');

(async () => {
  // Open Browser
  const browser = await firefox.launch({ headless: false });

  // Open Context
  const context = await browser.newContext();

  // Open Page
  const page = await context.newPage();

  // Open the test page
  await page.goto('https://playground.babylonjs.com/');
  console.log("Webpage Loaded");

  // Simulate a user interaction by clicking on the page
  await page.click('body');  // This simulates a user click to unlock audio

  // Evaluate in the browser context
  await page.evaluate(async () => {
    // Function to play and visualize audio
    async function playAndVisualizeAudio(url) {
      // Create Audio Context
      const audioCtx = new AudioContext();

      // Create an analyser node
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Fetch and decode audio data
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch resource: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Create a buffer source node
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      // Connect the source to the analyser and speakers
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

        analyser.getByteTimeDomainData(dataArray);

        // Clear canvas
        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw waveform
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
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

      // Start visualization
      draw();
    }

    // Call the function to play and visualize the audio
    const audioUrl = 'https://raw.githubusercontent.com/BenBrady2024/mp3test/main/DK64Test.mp3'; // Use the raw URL for your MP3 file
    await playAndVisualizeAudio(audioUrl);
  });

  // Close Browser
  // await context.close();
  // await browser.close();
})();
