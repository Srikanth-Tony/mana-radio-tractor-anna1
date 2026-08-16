
(() => {
'use strict';

const world=document.getElementById('world');
const back=document.getElementById('back');
const loader=document.getElementById('sceneLoading');
const toastEl=document.getElementById('toast');
const hornBtn=document.getElementById('horn');
const hornWave=document.getElementById('hornWave');
const dial=document.getElementById('dial');
const freq=document.getElementById('freq');
const signal=document.getElementById('signal');
const signalText=document.getElementById('signalText');
const playBtn=document.getElementById('play');
const nextBtn=document.getElementById('next');
const prevBtn=document.getElementById('prev');
const weatherBtn=document.getElementById('weather');
const iframe=document.getElementById('ytFrame');

const tracks=[{"title": "Telusa Nesthama", "artist": "Hariharan", "year": "2001", "freq": 94.3, "video": "m20OJppeAQ8"}, {"title": "Naa Pranama", "artist": "Udit Narayan", "year": "2006", "freq": 94.7, "video": null}, {"title": "Patala Pallakivai-Male", "artist": "S. P. Balasubrahmanyam", "year": "2000", "freq": 95.1, "video": "deMRmYYGtRg"}, {"title": "Priya Raagale", "artist": "S. P. Balasubrahmanyam", "year": "1994", "freq": 95.5, "video": "tySmfWT5qns"}, {"title": "Why Raju", "artist": "Udit Narayan", "year": "2002", "freq": 95.9, "video": null}, {"title": "Choopultho Guchi", "artist": "Shankar Mahadevan", "year": "2002", "freq": 96.3, "video": null}, {"title": "Tella Tellani Cheera", "artist": "Udit Narayan", "year": "2001", "freq": 96.7, "video": "mlt4IQpopDo"}, {"title": "Aunty Koothura", "artist": "S. P. Balasubrahmanyam", "year": "1998", "freq": 97.1, "video": null}, {"title": "Idemitamma", "artist": "Kumar Sanu", "year": "2004", "freq": 97.5, "video": "Qul2_aoI2Ak"}, {"title": "Lux Papa", "artist": "S. P. Balasubrahmanyam", "year": "2001", "freq": 97.9, "video": null}, {"title": "Rukku Rukku Rukkumani", "artist": "Mano", "year": "1996", "freq": 98.3, "video": null}, {"title": "Osey Ramulamma", "artist": "Vandemataram Srinivas", "year": "1997", "freq": 98.7, "video": null}, {"title": "Chinuku Chinuku Andelatho", "artist": "S.V. Krishna Reddy", "year": "1994", "freq": 99.1, "video": null}, {"title": "Venello Hai", "artist": "Chakri", "year": "2002", "freq": 99.5, "video": null}, {"title": "Gongoora Thota", "artist": "Pushpavanam Kuppu Swamy", "year": "2004", "freq": 99.9, "video": null}, {"title": "Nelluri Nerajana", "artist": "A. R. Rahman / Hariharan", "year": "1999", "freq": 100.3, "video": "e_bpJj3df5M"}, {"title": "Chanda O Chanda", "artist": "S. P. Balasubrahmanyam", "year": "1998", "freq": 100.7, "video": null}, {"title": "Jampanduve", "artist": "Udit Narayan", "year": "2003", "freq": 101.1, "video": "FT58F6jChgY"}, {"title": "Godaralle Ponge", "artist": "S. P. Balasubrahmanyam", "year": "2003", "freq": 101.5, "video": "bw7OqlY_PTQ"}, {"title": "Vanochhenante", "artist": "Udit Narayan", "year": "2003", "freq": 101.9, "video": null}, {"title": "Ramma Chilakamma", "artist": "Udit Narayan", "year": "2000", "freq": 102.3, "video": null}, {"title": "Chinnadamme Cheekulu", "artist": "Mano", "year": "2003", "freq": 102.7, "video": null}, {"title": "Elavachenamma", "artist": "Udit Narayan", "year": "2005", "freq": 103.1, "video": null}, {"title": "Naa Manusukemayindi", "artist": "Udit Narayan", "year": "2002", "freq": 103.5, "video": null}, {"title": "Silakemo", "artist": "Sreeram", "year": "2004", "freq": 103.9, "video": null}, {"title": "Baavavi Nuuvu", "artist": "S. P. Balasubrahmanyam", "year": "1995", "freq": 104.3, "video": null}, {"title": "Nenugaali Gopuram", "artist": "Udit Narayan", "year": "2000", "freq": 104.7, "video": null}, {"title": "Nindu Godari", "artist": "R. P. Patnaik", "year": "2002", "freq": 105.1, "video": null}, {"title": "Malli Kuyave", "artist": "Hariharan", "year": "2003", "freq": 105.5, "video": null}, {"title": "Chilaka Pacha Koka", "artist": "Mani Sharma", "year": "2001", "freq": 105.9, "video": null}, {"title": "Radhe Govinda", "artist": "Udit Narayan", "year": "2002", "freq": 106.3, "video": null}];

let trackIndex=0;
let playing=false;
let muted=false;
let weatherIndex=0;
let lights=false;
let playerReady=false;
let playerTimer=null;
let audioCtx=null,ambientSource=null,windGain=null,rainSource=null,rainGain=null;

function toast(t){
 if(!toastEl)return;
 toastEl.textContent=t;
 toastEl.classList.add('show');
 clearTimeout(window.__toast);
 window.__toast=setTimeout(()=>toastEl.classList.remove('show'),1800);
}

function openWorld(){
 if(!world)return;
 world.classList.remove('hidden');
 document.body.style.overflow='hidden';
 setWeather(0,false);
 if(loader){
   loader.classList.remove('done');
   setTimeout(()=>loader.classList.add('done'),650);
 }
 startAmbient();
}

window.openTractorAnna=openWorld;
document.querySelectorAll('[data-enter]').forEach(card=>{
 card.addEventListener('click',e=>{e.preventDefault();openWorld();});
});
if(back)back.onclick=()=>{
 world.classList.add('hidden');
 document.body.style.overflow='auto';
 stopAllAmbient();
 if(ytPlayer){try{ytPlayer.stopVideo();}catch(e){}}
 playing=false;
 if(playBtn)playBtn.textContent='▶';
};

function getAudio(){
 if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
 if(audioCtx.state==='suspended')audioCtx.resume();
 return audioCtx;
}

/* ---------- HORN ---------- */
function horn(){
 if(hornBtn)hornBtn.classList.add('horn-active');
 if(hornWave){
   hornWave.classList.remove('active');
   void hornWave.offsetWidth;
   hornWave.classList.add('active');
 }
 setTimeout(()=>hornBtn&&hornBtn.classList.remove('horn-active'),280);
 toast('PONNN! · horn echo across the fields');
 try{
   const a=getAudio();
   const master=a.createGain();
   const compressor=a.createDynamicsCompressor();
   master.gain.value=.18;
   compressor.threshold.value=-18;
   compressor.knee.value=18;
   compressor.ratio.value=5;
   compressor.attack.value=.005;
   compressor.release.value=.18;
   master.connect(compressor);
   compressor.connect(a.destination);
   [178,267].forEach((f,n)=>{
     const o=a.createOscillator(),g=a.createGain();
     o.type='sawtooth';
     o.frequency.setValueAtTime(f,a.currentTime);
     o.frequency.exponentialRampToValueAtTime(f*.72,a.currentTime+.52);
     g.gain.setValueAtTime(.001,a.currentTime);
     g.gain.exponentialRampToValueAtTime(.82,a.currentTime+.02+n*.014);
     g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.56);
     o.connect(g);g.connect(master);
     o.start();
     o.stop(a.currentTime+.58);
   });
 }catch(e){}
}
hornBtn&&hornBtn.addEventListener('click',horn);
document.getElementById('hornHotspot')?.addEventListener('click',horn);

/* ---------- PAATALASHALA-STYLE YOUTUBE RADIO ---------- */
let ytPlayer=null, ytApiReady=false, ytPlayerReady=false;
function hosted(){return location.protocol==='http:'||location.protocol==='https:';}
function onYouTubeIframeAPIReady(){ytApiReady=true;initYT();}
window.onYouTubeIframeAPIReady=onYouTubeIframeAPIReady;
function initYT(){
 if(!hosted()||!ytApiReady||ytPlayer||!document.getElementById('ytFrame')) return;
 const t=tracks[trackIndex];
 if(!t||!t.video) return;
 try{
  ytPlayer=new YT.Player('ytFrame',{
   width:'200',height:'200',videoId:t.video,
   playerVars:{autoplay:0,controls:1,disablekb:0,fs:1,modestbranding:1,rel:0,playsinline:1,enablejsapi:1,origin:location.origin},
   events:{
    onReady:function(e){ytPlayerReady=true;e.target.setVolume(muted?0:80);if(playing)e.target.playVideo();},
    onStateChange:function(e){
     if(e.data===YT.PlayerState.PLAYING){playing=true;if(playBtn)playBtn.textContent='Ⅱ';}
     else if(e.data===YT.PlayerState.PAUSED||e.data===YT.PlayerState.ENDED){playing=false;if(playBtn)playBtn.textContent='▶';}
    },
    onError:function(e){playing=false;if(playBtn)playBtn.textContent='▶';toast('YouTube cannot play this track here · '+e.data);}
   }
  });
 }catch(e){ytPlayer=null;}
}
function loadCurrentTrack(){
 const t=tracks[trackIndex];
 if(!t||!t.video){toast((t?t.title:'Track')+' · source not verified yet');return false;}
 if(!hosted()){toast('Audio playback works on the GitHub Pages site');return false;}
 if(!ytPlayer){initYT();return true;}
 try{
  ytPlayer.loadVideoById({videoId:t.video});
  return true;
 }catch(e){return false;}
}
function playRadio(){
 const t=tracks[trackIndex];
 if(!t||!t.video){toast((t?t.title:'Track')+' · source not verified yet');return;}
 if(!hosted()){toast('Open the GitHub Pages site to play');return;}
 playing=true;if(playBtn)playBtn.textContent='Ⅱ';
 if(!ytPlayer){initYT();return;}
 try{ytPlayer.loadVideoById({videoId:t.video});}catch(e){playing=false;if(playBtn)playBtn.textContent='▶';}
}playBtn&&playBtn.addEventListener('click',()=>playing?pauseRadio():playRadio());
 function changeTrack(direction) {
  const total = tracks.length;
  let nextIndex = trackIndex;

  for (let i = 0; i < total; i++) {
    nextIndex = (nextIndex + direction + total) % total;

    if (tracks[nextIndex] && tracks[nextIndex].video) {
      trackIndex = nextIndex;

      // Update song information
      if (typeof renderTrack === "function") {
        renderTrack();
      }

      if (typeof refreshPlaylistActive === "function") {
        refreshPlaylistActive();
      }

      // Play selected song
      playing = true;
      if (playBtn) playBtn.textContent = "Ⅱ";

      if (ytPlayer) {
        try {
          ytPlayer.loadVideoById(tracks[trackIndex].video);
        } catch (error) {
          console.error("Could not load next song:", error);
        }
      } else {
        initYT();
      }

      return;
    }
  }

  toast("No playable song available");
}

// NEXT button
if (nextBtn) {
  nextBtn.addEventListener("click", function () {
    changeTrack(1);
  });
}

// PREVIOUS button
if (prevBtn) {
  prevBtn.addEventListener("click", function () {
    changeTrack(-1);
  });
}
 function findNextPlayable(direction){
  const total = tracks.length;

  for(let step = 1; step <= total; step++){
    const i = (trackIndex + direction * step + total) % total;
    if(tracks[i] && tracks[i].video){
      return i;
    }
  }

  return trackIndex;
}

function changeTrack(direction){
  const nextIndex = findNextPlayable(direction);

  if(nextIndex === trackIndex){
    toast('No playable track available');
    return;
  }

  trackIndex = nextIndex;
  renderTrack();
  refreshPlaylistActive();

  playing = true;
  if(playBtn) playBtn.textContent = 'Ⅱ';

  if(!ytPlayer){
    initYT();
    return;
  }

  try{
    ytPlayer.loadVideoById({
      videoId: tracks[trackIndex].video
    });
  }catch(e){
    playing = false;
    if(playBtn) playBtn.textContent = '▶';
  }
}

nextBtn?.addEventListener('click',()=>changeTrack(1));
prevBtn?.addEventListener('click',()=>changeTrack(-1));
function pauseRadio(){if(ytPlayer&&ytPlayerReady){try{ytPlayer.pauseVideo();}catch(e){}}playing=false;if(playBtn)playBtn.textContent='▶';}
playBtn&&playBtn.addEventListener('click',()=>playing?pauseRadio():playRadio());

/* ---------- 31-song playlist drawer ---------- */
const playlistList=document.getElementById('playlistList');
function renderPlaylist(){
 if(!playlistList)return;
 playlistList.innerHTML='';
 tracks.forEach((t,i)=>{
   const b=document.createElement('button');
   b.className='song-choice '+(t.video?'':'pending');
   b.dataset.index=i;
   b.innerHTML='<span class="num">'+String(i+1).padStart(2,'0')+'</span>'+
              '<span class="name">'+t.title+'<span class="meta">'+t.artist+' · '+t.year+'</span></span>'+
              '<span class="badge">'+(t.video?'PLAY':'SOURCE')+'</span>';
   b.addEventListener('click',()=>{
     trackIndex=i;
     renderTrack();
     document.getElementById('stationDrawer')?.classList.remove('open');
     if(tracks[i].video)playRadio(); else toast(tracks[i].title+' · source not verified yet');
   });
   playlistList.appendChild(b);
 });
}
function refreshPlaylistActive(){
 document.querySelectorAll('.song-choice').forEach((b,i)=>b.classList.toggle('active',i===trackIndex));
}
renderPlaylist();

document.getElementById('stationOpen')?.addEventListener('click',()=>{
 document.getElementById('stationDrawer')?.classList.add('open');
 refreshPlaylistActive();
});
document.getElementById('closeStations')?.addEventListener('click',()=>document.getElementById('stationDrawer')?.classList.remove('open'));

document.getElementById('volume')?.addEventListener('click',()=>{
 muted=!muted;
 if(ytPlayer){try{muted?ytPlayer.mute():(ytPlayer.unMute(),ytPlayer.setVolume(80));}catch(e){}}
 document.getElementById('volume').textContent=muted?'MUTE':'VOL';
 toast(muted?'Music muted':'Music volume on');
});

/* ---------- WEATHER: strictly one mode at a time ---------- */
const modes=[
 {key:'day',label:'DAY',icon:'☀'},
 {key:'sunset',label:'SUNSET',icon:'🌅'},
 {key:'night',label:'NIGHT',icon:'☾'},
 {key:'rain',label:'RAIN',icon:'☂'}
];

function setWeather(index,announce=true){
 weatherIndex=(index+modes.length)%modes.length;
 const m=modes[weatherIndex];
 world.dataset.mode=m.key;
 world.classList.toggle('rain-active',m.key==='rain');
 if(weatherBtn){
   weatherBtn.dataset.mode=m.key;
   weatherBtn.innerHTML=m.icon+' <span>'+m.label+'</span>';
 }
 if(m.key==='rain')startRain();
 else stopRain();
 if(announce)toast(m.label+' · atmosphere changed');
}
weatherBtn?.addEventListener('click',()=>setWeather(weatherIndex+1));

/* ---------- LIGHTS ---------- */
document.getElementById('lightHotspot')?.addEventListener('click',()=>{
 lights=!lights;
 world.classList.toggle('lights-on',lights);
 toast(lights?'Headlights on':'Headlights off');
});

/* ---------- AMBIENCE ---------- */
function startAmbient(){
 try{
  const a=getAudio();
  if(ambientSource)return;
  const b=a.createBuffer(1,a.sampleRate*2,a.sampleRate);
  const d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*.018;
  ambientSource=a.createBufferSource();
  ambientSource.buffer=b;
  ambientSource.loop=true;
  const f=a.createBiquadFilter();
  f.type='lowpass';f.frequency.value=650;
  windGain=a.createGain();
  windGain.gain.value=muted?0:.035;
  ambientSource.connect(f);f.connect(windGain);windGain.connect(a.destination);
  ambientSource.start();
 }catch(e){}
}
function startRain(){
 try{
  const a=getAudio();
  if(rainSource)return;
  const b=a.createBuffer(1,a.sampleRate*2,a.sampleRate);
  const d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  rainSource=a.createBufferSource();
  rainSource.buffer=b;rainSource.loop=true;
  const f=a.createBiquadFilter();
  f.type='bandpass';f.frequency.value=3000;f.Q.value=.42;
  rainGain=a.createGain();
  rainGain.gain.value=muted?0:.035;
  rainSource.connect(f);f.connect(rainGain);rainGain.connect(a.destination);
  rainSource.start();
 }catch(e){}
}
function stopRain(){
 if(rainSource){try{rainSource.stop()}catch(e){}rainSource.disconnect();rainSource=null;}
 rainGain=null;
}
function __unused_stopYouTube(){
 if(iframe)sendYouTube('pauseVideo');
 playing=false;
 if(playBtn)playBtn.textContent='▶';
}
function stopAllAmbient(){
 stopRain();
 stopYouTube();
 if(ambientSource){try{ambientSource.stop()}catch(e){}ambientSource.disconnect();ambientSource=null;}
 if(audioCtx){audioCtx.close();audioCtx=null;}
}
if(loader)setTimeout(()=>loader.classList.add('done'),900);
})();
