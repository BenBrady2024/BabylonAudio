const { firefox } = require('playwright');

(async () => {
  //Opening Browser
  const browser = await firefox.launch({headless: false});
  
  //Opening Context and Setting up video recording
  const context = await browser.newContext({/*recordVideo: {dir:'videos'}*/});

  //Opening Page
  const page = await context.newPage();


  const CONTEXT = await page.evaluate(()=>{
    //Testing Log
    //return "start of logtest";

    function startrecording(ctx){
      recordingstream=ctx.createMediaStreamDestination();
      recorder=new MediaRecorder(recordingstream.stream);
      recorder.start();
    }
    
    function stoprecording(){
      recorder.addEventListener('dataavailable',function(e){
        document.querySelector('#recording').src=URL.createObjectURL(e.data);
        recorder=false;
        recordingstream=false;
      });
      recorder.stop();
    }
    
    //Creating Audio Context
    const ctx = new AudioContext();

    //Playing Sound
    const osc = ctx.createOscillator(500);
    osc.connect(ctx.destination);
    osc.start();

    //Starting Audio Recording
    startrecording(ctx);
    //const mediaRecorder = new MediaRecorder(stream);
    
    stoprecording();

    //Tried to return Audio Context | Does not work ATM
    return ctx;

    //Testing Log
    //return "End of logtest";
  })
  //startrecording();
  //console.log(logTest);

  //Opening test playground
  await page.goto('https://playground.babylonjs.com/#SPLFNK#1');
  console.log("Webpage Loaded");
  //stoprecording();


  //Closing Browsers
  await context.close();
  await browser.close();
})();