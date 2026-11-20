import React, { useEffect, useMemo, useRef, useState } from 'react';
import './styles.css';

const A = `${import.meta.env.BASE_URL}assets/`;
const eventVideos = [
  { name: 'Mehndi & Dhol', file: 'mehndi.mp4', date: '31 January', time: '6:30 PM onwards', venue: 'Green Lounge, Pitampura' },
  { name: 'Hathbhara & Haldi', file: 'haldi.mp4', date: '1 February', time: '11:00 AM', venue: 'Wyndham Garden, Poolside' },
  { name: 'Sangeet', file: 'sangeet.mp4', date: '1 February', time: '7:30 PM', venue: 'Wyndham Garden, Grand Jubilation' },
  { name: 'Sehrabandi', file: 'sehrabandi.mp4', date: 'Date to be confirmed', time: '5:00 PM', venue: 'Wyndham Garden' },
  { name: 'Reassembly', file: 'reassembly.mp4', date: 'Date to be confirmed', time: '7:00 PM', venue: 'Antilia by Zion' },
  { name: 'Marriage', file: 'wedding.mp4', date: 'Date to be confirmed', time: '8:00 PM', venue: 'Antilia by Zion' },
];

function ScratchCard() {
  const canvasRef = useRef(null), drawing = useRef(false), last = useRef(null), doneRef = useRef(false);
  const [done, setDone] = useState(false), [bursts, setBursts] = useState([]);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, '#f9f7f2'); g.addColorStop(.35, '#c8c9ca'); g.addColorStop(.55, '#f5f3ed'); g.addColorStop(.8, '#aeb1b3'); g.addColorStop(1, '#f4f1e9');
    ctx.fillStyle = g; ctx.fillRect(0, 0, rect.width, rect.height);
    for (let i=0;i<900;i++){ ctx.fillStyle=`rgba(255,255,255,${Math.random()*.45})`; ctx.beginPath(); ctx.arc(Math.random()*rect.width,Math.random()*rect.height,Math.random()*1.2,0,Math.PI*2);ctx.fill(); }
    ctx.fillStyle='rgba(61,66,69,.72)'; ctx.font='600 13px Georgia'; ctx.textAlign='center'; ctx.fillText('GENTLY SCRATCH TO REVEAL',rect.width/2,rect.height/2+4);
  }, []);
  const point = e => { const r=canvasRef.current.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
  const scratch = e => { if(!drawing.current || doneRef.current)return; const p=point(e), c=canvasRef.current.getContext('2d'); c.globalCompositeOperation='destination-out'; c.lineWidth=42; c.lineCap='round';c.lineJoin='round';c.beginPath(); if(last.current){c.moveTo(last.current.x,last.current.y);c.lineTo(p.x,p.y);}else{c.arc(p.x,p.y,21,0,Math.PI*2);}c.stroke();last.current=p; };
  const finish = () => { drawing.current=false;last.current=null; const c=canvasRef.current,ctx=c.getContext('2d'),d=ctx.getImageData(0,0,c.width,c.height).data; let clear=0;for(let i=3;i<d.length;i+=32)if(d[i]<40)clear++; if(clear/(d.length/32)>.58&&!doneRef.current){doneRef.current=true;setDone(true);setBursts(Array.from({length:34},(_,i)=>({id:i,left:Math.random()*100,delay:Math.random()*.35,symbol:i%3?'✦':'✧'})));}};
  return <section className="scratch-section"><p className="eyebrow">A LITTLE SURPRISE</p><h2>Scratch to reveal</h2><div className={`scratch-card ${done?'revealed':''}`}><div className="scratch-message"><span className="script">Save the Date</span><strong>Samkit <i>&</i> Tarushi</strong><small>THE CELEBRATION BEGINS</small></div>{!done&&<canvas ref={canvasRef} onPointerDown={e=>{drawing.current=true;e.currentTarget.setPointerCapture(e.pointerId);scratch(e)}} onPointerMove={scratch} onPointerUp={finish} onPointerCancel={finish}/ >}{done&&bursts.map(b=><span key={b.id} className="spark" style={{left:`${b.left}%`,animationDelay:`${b.delay}s`}}>{b.symbol}</span>)}</div><p className="hint">Use your finger to gently uncover the invitation</p></section>;
}

export default function App(){
  const [entered,setEntered]=useState(false),[loading,setLoading]=useState(false),[progress,setProgress]=useState(0),[musicOn,setMusicOn]=useState(false),[openingEnded,setOpeningEnded]=useState(false);
  const audio=useRef(null), opening=useRef(null);
  const allFiles=useMemo(()=>['opening-video.mp4'],[]);
  const start=async()=>{if(entered)return;setLoading(true);const results=await Promise.all(allFiles.map(file=>new Promise(resolve=>{const v=document.createElement('video');v.preload='auto';v.src=A+file;let settled=false;const end=ok=>{if(!settled){settled=true;resolve(ok)}};v.oncanplaythrough=()=>end(true);v.onerror=()=>end(false);setTimeout(()=>end(false),12000);v.load();})));setProgress(100);setEntered(true);setLoading(false);setTimeout(()=>{opening.current?.play().catch(()=>{});audio.current?.play().then(()=>setMusicOn(true)).catch(()=>{});},80);};
  const finishOpening=()=>{setOpeningEnded(true);document.getElementById('celebrations')?.scrollIntoView({behavior:'smooth'});};
  return <main className="site-shell">
    <audio ref={audio} src={A+'music/wedding-music.mp3'} loop preload="auto" />
    {!entered&&<div className="entry-screen" onClick={start}><img className="entry-art" src={A+'entry-image.jpg'} alt="Samkit and Tarushi wedding invitation"/><div className="entry-shade"/><div className="entry-logo"><img src={A+'wedding-logo.jpeg'} alt="Samkit and Tarushi wedding logo"/><span>Tap Anywhere to Open</span><b>✧</b></div>{loading&&<div className="loading-overlay"><img src={A+'wedding-logo.jpeg'} alt=""/><p>Preparing your invitation…</p><div className="progress"><i style={{width:`${progress}%`}}/></div></div>}</div>}
    {entered&&<><header className="topbar"><span>SAMKIT & TARUSHI</span><button onClick={()=>{if(musicOn){audio.current.pause();setMusicOn(false)}else{audio.current.play().then(()=>setMusicOn(true)).catch(()=>{})}}}>{musicOn?'♫ Music On':'♫ Music Off'}</button></header>
      <section className="opening-video"><video ref={opening} src={A+'opening-video.mp4'} poster={A+'entry-image.jpg'} playsInline muted controls={false} onEnded={finishOpening}/><div className="video-caption"><span className="script">Together with their families</span><h1>Samkit <i>&</i> Tarushi</h1><p>REQUEST THE PLEASURE OF YOUR COMPANY</p><button onClick={finishOpening}>Continue ↓</button></div></section>
      <section className="welcome"><p className="eyebrow">WITH THE BLESSINGS OF OUR FAMILIES</p><h2>Two hearts. One beautiful beginning.</h2><div className="family-grid"><div><small>GROOM'S PARENTS</small><p>Mrs Saloni Jain<br/>& Saurabh Jain</p><small>GRANDPARENTS</small><p>Mrs Sangita Jain<br/>& Suresh Chand Jain</p></div><div><small>BRIDE'S PARENTS</small><p>Mrs Shamita Jain<br/>& Sameer Jain</p></div></div></section>
      <ScratchCard/>
      <section id="celebrations" className="events"><p className="eyebrow">JOIN US FOR THE CELEBRATIONS</p><h2>The Wedding Festivities</h2>{eventVideos.map((event,i)=><article className="event-card" key={event.file}><div className="event-heading"><span>0{i+1}</span><div><h3>{event.name}</h3><p>{event.date} · {event.time}</p><small>{event.venue}</small></div></div><video controls playsInline preload="none" poster={A+'entry-image.jpg'}><source src={A+'events/'+event.file} type="video/mp4"/></video><p className="video-note">Event film will appear here</p></article>)}</section>
      <footer><img src={A+'wedding-logo.jpeg'} alt=""/><p>With love, Samkit & Tarushi</p><span>WE CAN'T WAIT TO CELEBRATE WITH YOU</span></footer>
    </>}
  </main>
}
