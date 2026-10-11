// generated sound effects + light music loop (WebAudio, no files)
const SND=(()=>{let ac=null,master=null,sfxG=null,musG=null,musOn=false,sfxOn=true,timer=null,nextT=0,stepI=0;
  function init(){if(ac)return;try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}master=ac.createGain();master.gain.value=.9;master.connect(ac.destination);sfxG=ac.createGain();sfxG.gain.value=.55;sfxG.connect(master);musG=ac.createGain();musG.gain.value=.0;musG.connect(master);}
  function resume(){init();if(ac&&ac.state==='suspended')ac.resume();}
  function env(g,t,a,d,v){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0008,t+a+d);}
  function tone(f,t,d,type,v,f2,dest){const o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);env(g,t,.005,d,v);o.connect(g);g.connect(dest||sfxG);o.start(t);o.stop(t+d+.05);}
  let nb=null;function noise(t,d,v,ftype,f,f2,q){if(!nb){nb=ac.createBuffer(1,ac.sampleRate*1,ac.sampleRate);const a=nb.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
    const s=ac.createBufferSource();s.buffer=nb;const fl=ac.createBiquadFilter();fl.type=ftype||'bandpass';fl.frequency.setValueAtTime(f||1000,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);fl.Q.value=q||1;const g=ac.createGain();env(g,t,.005,d,v);s.connect(fl);fl.connect(g);g.connect(sfxG);s.start(t);s.stop(t+d+.05);}
  const P={
    swap:t=>noise(t,.12,.25,'bandpass',600,2400,1.2),
    bad:t=>{tone(220,t,.12,'square',.08,140);tone(180,t+.1,.14,'square',.07,110);},
    pop:(t,ch)=>{const f=520*Math.pow(2,Math.min(ch||0,10)*2/12)*(1+Math.random()*.04);tone(f,t,.16,'triangle',.22,f*1.5);tone(f*2,t,.08,'sine',.08);noise(t,.04,.12,'highpass',3000);},
    line:t=>{tone(160,t,.35,'sawtooth',.08,900);noise(t,.35,.18,'bandpass',800,4000,2);},
    bomb:t=>{tone(120,t,.4,'sine',.5,40);noise(t,.45,.4,'lowpass',1800,200,.7);},
    cyc:t=>{noise(t,.9,.32,'bandpass',300,3000,3);for(let i=0;i<6;i++)tone(600+i*120,t+i*.07,.15,'triangle',.08);},
    crate:t=>{noise(t,.08,.4,'bandpass',900,400,3);tone(190,t,.1,'square',.08,120);},
    mud:t=>{noise(t,.18,.3,'lowpass',700,150,2);tone(90,t,.15,'sine',.15,60);},
    wire:t=>{tone(1800,t,.12,'square',.04,2600);noise(t,.1,.15,'highpass',4000);},
    moo:t=>{const o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(150,t);o.frequency.linearRampToValueAtTime(175,t+.15);o.frequency.linearRampToValueAtTime(120,t+.6);f.type='lowpass';f.frequency.setValueAtTime(500,t);f.frequency.linearRampToValueAtTime(1100,t+.2);f.frequency.linearRampToValueAtTime(400,t+.6);env(g,t,.06,.6,.2);o.connect(f);f.connect(g);g.connect(sfxG);o.start(t);o.stop(t+.75);},
    special:t=>{[0,4,7,12].forEach((s,i)=>tone(660*Math.pow(2,s/12),t+i*.045,.18,'triangle',.12));},
    star:(t,i)=>{tone(880*Math.pow(2,(i||0)*4/12),t,.5,'sine',.25);tone(1760*Math.pow(2,(i||0)*4/12),t,.3,'sine',.08);},
    win:t=>{[0,4,7,12,16,19,24].forEach((s,i)=>tone(523*Math.pow(2,s/12),t+i*.09,.3,'triangle',.18));},
    lose:t=>{[7,4,0,-5].forEach((s,i)=>tone(392*Math.pow(2,s/12),t+i*.16,.35,'triangle',.15));},
    click:t=>tone(900,t,.05,'sine',.12,700),
    task:t=>{[0,7,12,16,19,24].forEach((s,i)=>{tone(587*Math.pow(2,s/12),t+i*.06,.4,'sine',.16);});noise(t,.6,.08,'highpass',5000);},
    whoosh:t=>noise(t,.4,.25,'bandpass',300,1500,1.5),
    bark:t=>{tone(420,t,.08,'sawtooth',.14,260);tone(380,t+.13,.09,'sawtooth',.12,240);}
  };
  function play(n,a){if(!sfxOn)return;resume();if(!ac)return;try{P[n]&&P[n](ac.currentTime+.01,a);}catch(e){}}
  // music: relaxed I–V–vi–IV pluck loop
  const prog=[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],mel=[12,14,16,19,16,14,12,9, 11,14,19,14,11,7,9,11, 12,16,21,16,12,16,19,16, 9,12,17,12,14,12,9,7];
  function schedule(){while(nextT<ac.currentTime+.25){const bar=(stepI>>3)%4,s=stepI%8;const root=196*Math.pow(2,prog[bar][0]/12);
      if(s===0||s===4)tone(root/2,nextT,.5,'triangle',.18,null,musG);
      if(s%2===0)tone(392*Math.pow(2,(mel[stepI%32])/12)/2*1,nextT,.32,'sine',.09,null,musG);
      if(s===2||s===6)prog[bar].forEach(n=>tone(392*Math.pow(2,n/12)/2,nextT,.25,'triangle',.035,null,musG));
      nextT+=.3125/1;stepI++;}}
  function music(on){musOn=on;if(on){resume();if(!ac)return;musG.gain.cancelScheduledValues(ac.currentTime);musG.gain.linearRampToValueAtTime(.35,ac.currentTime+1);if(!timer){nextT=ac.currentTime+.1;timer=setInterval(schedule,90);}}
    else if(ac){musG.gain.linearRampToValueAtTime(0,ac.currentTime+.4);setTimeout(()=>{if(!musOn&&timer){clearInterval(timer);timer=null;}},500);}}
  return {play,music,resume,set sfx(v){sfxOn=v;},get ctx(){return ac;}};})();
