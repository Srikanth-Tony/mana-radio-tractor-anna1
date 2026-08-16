(() => {
'use strict';
const world=document.getElementById('ammammaWorld');
const card=document.getElementById('ammammaCard');
const back=document.getElementById('back');
const loader=document.getElementById('sceneLoading');
const radio=document.getElementById('kitchenRadio');
const knobBtn=document.getElementById('knobBtn');
const volumeBtn=document.getElementById('volume');
const volumeFill=document.getElementById('volumeFill');
const volValue=document.getElementById('volValue');
const play=document.getElementById('play');
const prev=document.getElementById('prev');
const next=document.getElementById('next');
const dial=document.getElementById('dial');
const freq=document.getElementById('freq');
const signal=document.getElementById('signal');
const signalText=document.getElementById('signalText');
const toastEl=document.getElementById('toast');
let playing=false, index=0, audioCtx=null, volumeLevel=60, knobAngle=25;

const memories=[
 ['Inti Madhya Paata','1993','Memory station · demo',91.4],
 ['Sunday Kitchen Melody','1991','Coming soon',96.7],
 ['Ammamma Morning Song','1988','Coming soon',101.2]
];

function toast(t){toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(window.__t);window.__t=setTimeout(()=>toastEl.classList.remove('show'),1700)}

/* ---------- visible steam plume (canvas, independent of audio) ---------- */
const steamCanvas=document.getElementById('steamCanvas');
const steamCtx=steamCanvas?steamCanvas.getContext('2d'):null;
let steamParticles=[],steamRAF=0;

function resizeSteam(){
  if(!steamCanvas)return;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  steamCanvas.width=Math.floor(steamCanvas.clientWidth*dpr);
  steamCanvas.height=Math.floor(steamCanvas.clientHeight*dpr);
  steamCtx.setTransform(dpr,0,0,dpr,0,0);
}
function makeSteamParticle(w,h){
  // Start near the lower-left kitchen vessel area and drift right/up.
  return {
    x:w*.18+(Math.random()-.5)*18,
    y:h*.735+Math.random()*12,
    vx:.20+Math.random()*.28,
    vy:-.48-Math.random()*.38,
    life:0,
    max:170+Math.random()*110,
    size:5+Math.random()*9,
    sway:Math.random()*Math.PI*2,
    alpha:.10+Math.random()*.10
  };
}
function drawSteam(){
  if(!steamCtx||!steamCanvas)return;
  const w=steamCanvas.clientWidth,h=steamCanvas.clientHeight;
  steamCtx.clearRect(0,0,w,h);

  while(steamParticles.length<18) steamParticles.push(makeSteamParticle(w,h));

  for(const p of steamParticles){
    p.life++;
    p.sway+=.018;
    p.x += p.vx + Math.sin(p.sway)*.12;
    p.y += p.vy;
    p.size += .008;

    const t=p.life/p.max;
    let a=p.alpha;
    if(t<.12)a*=t/.12;
    if(t>.62)a*=1-(t-.62)/.38;

    // Soft elliptical puff with a bright core and feathered edge.
    const g=steamCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*2.8);
    g.addColorStop(0,`rgba(255,242,218,${a})`);
    g.addColorStop(.35,`rgba(255,238,211,${a*.58})`);
    g.addColorStop(1,'rgba(255,238,211,0)');
    steamCtx.fillStyle=g;
    steamCtx.beginPath();
    steamCtx.ellipse(p.x,p.y,p.size*1.1,p.size*2.2,.18,0,Math.PI*2);
    steamCtx.fill();

    if(p.life>=p.max || p.y<h*.30) Object.assign(p,makeSteamParticle(w,h));
  }
  steamRAF=requestAnimationFrame(drawSteam);
}
function startSteam(){
  if(!steamCanvas||!steamCtx)return;
  resizeSteam();
  if(!steamRAF)drawSteam();
}
function stopSteam(){
  if(steamRAF)cancelAnimationFrame(steamRAF);
  steamRAF=0;
  steamParticles=[];
  if(steamCtx&&steamCanvas)steamCtx.clearRect(0,0,steamCanvas.clientWidth,steamCanvas.clientHeight);
}
window.addEventListener('resize',resizeSteam);
startSteam();

function enter(){
 world.classList.remove('hidden');document.body.style.overflow='hidden';
 loader.classList.remove('done');setTimeout(()=>loader.classList.add('done'),650);
 startSteam();
 startRoomSound();
}
card.addEventListener('click',e=>{e.preventDefault();enter();});
back.addEventListener('click',()=>{world.classList.add('hidden');document.body.style.overflow='auto';stopRoomSound();});

function render(){
 const m=memories[index];
 document.getElementById('song').textContent=m[0];
 document.getElementById('artist').textContent=m[2];
 freq.textContent=m[3].toFixed(1);dial.value=m[3];
 signalText.textContent=index===0?'TUNED':'COMING SOON';
}
render();

play.addEventListener('click',()=>{
 if(index!==0){toast('This memory station is coming soon');return}
 playing=!playing;play.textContent=playing?'Ⅱ':'▶';
 if(roomGain) roomGain.gain.value = playing ? volumeLevel/100*.04 : volumeLevel/100*.012;
 toast(playing?'♪ Ammamma Radio is playing':'Radio paused');
});
next.addEventListener('click',()=>{index=(index+1)%memories.length;render();toast(index===0?'94.3 FM · station locked':'Next station · coming soon')});
prev.addEventListener('click',()=>{index=(index-1+memories.length)%memories.length;render();toast(index===0?'94.3 FM · station locked':'Previous station · coming soon')});

dial.addEventListener('input',()=>{
 const v=+dial.value;freq.textContent=v.toFixed(1);signal.classList.add('searching');signalText.textContent='TUNING';
 clearTimeout(window.__tune);
 window.__tune=setTimeout(()=>{
  signal.classList.remove('searching');
  const nearest=memories.map((m,i)=>({i,d:Math.abs(m[3]-v)})).sort((a,b)=>a.d-b.d)[0];
  if(nearest.d<.28){index=nearest.i;render();toast(index===0?'94.3 FM · station locked':'Station found · coming soon')}
  else signalText.textContent='STATIC';
 },380);
});

function radioTouch(){
 knobAngle += 18;
 const dialEl=document.querySelector('.radio-dial');
 if(dialEl){
   dialEl.style.transform=`rotate(${knobAngle}deg)`;
   dialEl.style.transition='transform .22s ease';
 }
 radio.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale(1.018)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:380});
 toast('Radio knob turned · 91.4 FM');
}
radio.addEventListener('click',radioTouch);
if(knobBtn) knobBtn.addEventListener('click', radioTouch);

if(volumeBtn){
 volumeBtn.addEventListener('click',()=>{
   volumeLevel = volumeLevel===100 ? 0 : volumeLevel+20;
   if(volumeFill) volumeFill.style.width=volumeLevel+'%';
   if(volValue) volValue.textContent=volumeLevel+'%';
   if(roomGain) roomGain.gain.value = volumeLevel/100*.04;
   toast('Volume · '+volumeLevel+'%');
 });
}

function getAudio(){if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
let roomSource=null,roomGain=null;
function startRoomSound(){
 try{
  const a=getAudio();if(roomSource)return;
  const b=a.createBuffer(1,a.sampleRate*2,a.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*.012;
  roomSource=a.createBufferSource();roomSource.buffer=b;roomSource.loop=true;
  const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=420;
  roomGain=a.createGain();roomGain.gain.value=.025;
  roomSource.connect(f);f.connect(roomGain);roomGain.connect(a.destination);roomSource.start();
 }catch(e){}
}
function stopRoomSound(){if(roomSource){try{roomSource.stop()}catch(e){}roomSource.disconnect();roomSource=null}if(audioCtx){audioCtx.close();audioCtx=null}}
})();
