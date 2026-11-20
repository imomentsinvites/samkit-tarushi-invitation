import React, { useEffect, useRef, useState } from 'react';
import './styles.css';

const A = `${import.meta.env.BASE_URL}assets/`;
// Four event films only. Sehrabandi, reassembly and marriage timings belong
// inside the single Wedding film rather than becoming separate event pages.
const eventVideos = [
  { file: 'mehendi-dhol.mp4' },
  { file: 'hathbhara-haldi.mp4' },
  { file: 'sangeet.mp4' },
  { file: 'wedding.mp4' },
];

function ScratchCard() {
  const canvasRef = useRef(null), drawing = useRef(false), last = useRef(null), doneRef = useRef(false);
  const [done, setDone] = useState(false), [bursts, setBursts] = useState([]);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, '#f9f7f2'); g.addColorStop(.35, '#c8c9ca'); g.addColorStop(.55, '#f5f3ed'); g.addColorStop(.8, '#aeb1b3'); g.addColorStop(1, '#f4f1e9');
    ctx.fillStyle = g; ctx.fillRect(0, 0, rect.width, rect.height);
    for (let i=0;i<900;i++){ ctx.fillStyle=`rgba(255,255,255,${Math.random()*.45})`; ctx.beginPath(); ctx.arc(Math.random()*rect.width,Math.random()*rect.height,Math.random()*1.2,0,Math.PI*2);ctx.fill(); }
    ctx.fillStyle='rgba(61,66,69,.72)'; ctx.font='600 13px Georgia'; ctx.textAlign='center'; ctx.fillText('GENTLY SCRATCH TO REVEAL',rect.width/2,rect.height/2+4);
  }, []);
  const point = e => { const r=canvasRef.current.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
  const scratch = e => { if(!drawing.current || doneRef.current)return; const p=point(e), c=canvasRef.current.getContext('2d'); c.globalCompositeOperation='destination-out'; c.lineWidth=44; c.lineCap='round';c.lineJoin='round';c.beginPath(); if(last.current){c.moveTo(last.current.x,last.current.y);c.lineTo(p.x,p.y);}else{c.arc(p.x,p.y,22,0,Math.PI*2);}c.stroke();last.current=p; };
  const finish = () => { drawing.current=false;last.current=null; const c=canvasRef.current,ctx=c.getContext('2d'),d=ctx.getImageData(0,0,c.width,c.height).data; let clear=0;for(let i=3;i<d.length;i+=32)if(d[i]<40)clear++; if(clear/(d.length/32)>.58&&!doneRef.current){doneRef.current=true;setDone(true);setBursts(Array.from({length:42},(_,i)=>({id:i,left:Math.random()*100,delay:Math.random()*.4,symbol:i%3?'✦':'✧'})));}};
  return <section className="scratch-section"><p className="eyebrow">A LITTLE SURPRISE</p><h2>Scratch to reveal</h2><div className={`scratch-card ${done?'revealed':''}`}><div className="scratch-message"><span className="script">Save the Date</span><strong>Samkit <i>&</i> Tarushi</strong><small className="scratch-date">31st January – 2nd February 2027</small><small>THE CELEBRATION BEGINS</small></div>{!done&&<canvas ref={canvasRef} onPointerDown={e=>{drawing.current=true;e.currentTarget.setPointerCapture(e.pointerId);scratch(e)}} onPointerMove={scratch} onPointerUp={finish} onPointerCancel={finish}/ >}{done&&bursts.map(b=><span key={b.id} className="spark" style={{left:`${b.left}%`,animationDelay:`${b.delay}s`}}>{b.symbol}</span>)}</div><p className="hint">Use your finger to gently uncover the invitation</p></section>;
}

export default function App(){
  const [entered,setEntered]=useState(false),[loading,setLoading]=useState(false),[progress,setProgress]=useState(0),[musicOn,setMusicOn]=useState(false);
  const audio=useRef(null), opening=useRef(null);
  const start=async()=>{if(entered||loading)return;setLoading(true);const required=['opening-video.mp4'];let completed=0;await Promise.all(required.map(file=>new Promise(resolve=>{const v=document.createElement('video');v.preload='auto';v.src=A+file;let settled=false;const end=()=>{if(!settled){settled=true;completed++;setProgress(Math.round(completed/required.length*100));resolve();}};v.oncanplaythrough=end;v.onerror=end;setTimeout(end,15000);v.load();})));setEntered(true);setLoading(false);setTimeout(()=>{opening.current?.play().catch(()=>{});audio.current?.play().then(()=>setMusicOn(true)).catch(()=>{});},80);};
  const finishOpening=()=>document.getElementById('celebrations')?.scrollIntoView({behavior:'smooth'});
  return <main className="site-shell">
    <audio ref={audio} src={A+'music/wedding-music.mp3'} loop preload="auto" />
    {!entered&&<div className="entry-screen" onClick={start}><img className="entry-art" src={A+'entry-image.jpg'} alt="Samkit and Tarushi wedding invitation"/><div className="entry-shade"/><div className="entry-logo"><img src={A+'wedding-logo.jpeg'} alt="Samkit and Tarushi wedding logo"/><span>Tap Anywhere to Open</span><b>✧</b></div>{loading&&<div className="loading-overlay"><img src={A+'wedding-logo.jpeg'} alt=""/><p>Preparing your invitation… {progress}%</p><div className="progress"><i style={{width:`${progress}%`}}/></div></div>}</div>}
    {entered&&<><header className="topbar"><span>SAMKIT & TARUSHI</span><button onClick={()=>{if(musicOn){audio.current.pause();setMusicOn(false)}else{audio.current.play().then(()=>setMusicOn(true)).catch(()=>{})}}}>{musicOn?'♫ Music On':'♫ Music Off'}</button></header>
      <section className="opening-video"><video ref={opening} src={A+'opening-video.mp4'} poster={A+'entry-image.jpg'} playsInline muted controls={false} onEnded={finishOpening}/></section>
      <ScratchCard/>
      <section id="celebrations" className="events">{eventVideos.map((event)=><article className="event-card" key={event.file}><video controls playsInline preload="none" poster={A+'entry-image.jpg'}><source src={A+'events/'+event.file} type="video/mp4"/></video></article>)}</section>
      <footer><img src={A+'wedding-logo.jpeg'} alt=""/><p>With love, Samkit & Tarushi</p><span>WE CAN'T WAIT TO CELEBRATE WITH YOU</span></footer>
    </>}
  </main>
}
