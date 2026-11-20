import React, { useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';

const BASE = `${import.meta.env.BASE_URL}assets/`;
const EVENTS = [
  { id: 'mehendi', title: 'Mehendi', file: 'mehendi.mp4', note: 'A little colour, a lot of laughter, and memories to cherish.' },
  { id: 'hathbhara-haldi', title: 'Hathbhara & Haldi', file: 'hathbhara-haldi.mp4', note: 'A beautiful beginning, wrapped in love and blessings.' },
  { id: 'sangeet', title: 'Sangeet', file: 'sangeet.mp4', note: 'An evening of music, dance and celebration.' },
  { id: 'wedding', title: 'Wedding', file: 'wedding.mp4', note: 'Two hearts, one journey, a lifetime of togetherness.' },
];
const RSVP_NUMBER = '7908282160';
const RSVP_RAW = '917908282160';

function useProgressiveVideo(videoRef, enabled = true) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    video.preload = 'auto';
    video.load();
    return () => { video.preload = 'metadata'; };
  }, [videoRef, enabled]);
}

function DecorativeCorners() {
  return <span className="corner-ornaments" aria-hidden="true"><i/><i/><i/><i/></span>;
}

function Preloader({ onReady }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const logo = new Image(); logo.src = `${BASE}images/st-monogram.png`;
    const poster = new Image(); poster.src = `${BASE}entry-image.jpg`;
    const fontReady = document.fonts?.ready || Promise.resolve();
    const video = document.createElement('video');
    video.preload = 'auto'; video.muted = true; video.playsInline = true;
    video.src = `${BASE}opening-video.mp4`;
    let videoReady = false;
    const update = () => {
      if (cancelled) return;
      const tasks = [logo.complete, poster.complete, document.fonts?.status === 'loaded', videoReady];
      const value = Math.round(tasks.filter(Boolean).length / tasks.length * 100);
      setProgress(value);
      if (value === 100) setTimeout(() => !cancelled && onReady(), 280);
    };
    const markVideoReady = () => { videoReady = true; update(); };
    video.addEventListener('loadeddata', markVideoReady, { once: true });
    video.addEventListener('error', markVideoReady, { once: true });
    const timer = setTimeout(markVideoReady, 12000);
    Promise.allSettled([fontReady, logo.decode?.().catch(() => {}), poster.decode?.().catch(() => {})]).then(update);
    logo.onload = update; logo.onerror = update; poster.onload = update; poster.onerror = update;
    update(); video.load();
    return () => { cancelled = true; clearTimeout(timer); video.removeAttribute('src'); video.load(); };
  }, [onReady]);
  return <div className="preloader">
    <div className="preloader-mark"><img src={`${BASE}images/st-monogram.png`} alt="ST monogram"/></div>
    <p className="preloader-kicker">A WEDDING CELEBRATION</p>
    <h1>Samkit <em>&</em> Tarushi</h1>
    <p className="preloader-caption">A new chapter begins</p>
    <div className="load-track"><span style={{ width: `${progress}%` }}/></div>
    <small>Preparing your invitation · {progress}%</small>
  </div>;
}

function Envelope({ onOpen }) {
  return <section className="envelope-screen" onClick={onOpen} role="button" tabIndex={0} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpen()} aria-label="Open wedding invitation">
    <div className="envelope-card">
      <div className="envelope-flap"/>
      <div className="envelope-line-art" aria-hidden="true">❀　✧　❀</div>
      <div className="envelope-seal"><img src={`${BASE}images/st-monogram.png`} alt="ST"/></div>
      <div className="envelope-copy"><h1>You're Invited</h1><p>TAP TO OPEN YOUR INVITATION</p><span>Samkit & Tarushi</span></div>
      <div className="envelope-bottom">WITH LOVE & BLESSINGS</div>
    </div>
    <p className="envelope-hint">Tap anywhere to open</p>
  </section>;
}

function VideoPanel({ src, poster, title, className = '', onEnded, id, eager = false }) {
  const ref = useRef(null);
  useProgressiveVideo(ref, eager);
  useEffect(() => {
    const node = ref.current;
    if (!node || eager) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        node.preload = 'auto'; node.load(); observer.disconnect();
      }
    }, { rootMargin: '150% 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [eager, src]);
  return <div className={`video-panel ${className}`} id={id}>
    <video ref={ref} playsInline controls preload={eager ? 'auto' : 'none'} poster={poster} onEnded={onEnded}>
      <source src={src} type="video/mp4"/>
    </video>
    {title && <div className="video-label"><span>{title}</span></div>}
  </div>;
}

function OpeningVideo({ onEnded }) {
  const ref = useRef(null);
  const [playError, setPlayError] = useState(false);
  useProgressiveVideo(ref, true);
  useEffect(() => { ref.current?.play().catch(() => setPlayError(true)); }, []);
  return <section className="opening-stage">
    <div className="opening-video-wrap"><video ref={ref} src={`${BASE}opening-video.mp4`} poster={`${BASE}images/video-poster.svg`} playsInline muted controls={playError} onEnded={onEnded} autoPlay/>
      {playError && <button className="play-overlay" onClick={() => ref.current?.play().then(() => setPlayError(false))}>Play invitation video</button>}
    </div>
    <p className="scroll-cue">SCROLL DOWN <span>⌄</span></p>
  </section>;
}

function PetalFall() {
  return <div className="petal-layer" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ '--i': i }}/>)}</div>;
}

function ScratchReveal() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const doneRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [imageError, setImageError] = useState(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect(); const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, rect.width * ratio); canvas.height = Math.max(1, rect.height * ratio);
    const ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#fffaf2'); gradient.addColorStop(.45, '#e9d9b9'); gradient.addColorStop(.7, '#fffdf8'); gradient.addColorStop(1, '#d9c49d');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, rect.width, rect.height);
    for (let i = 0; i < 380; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * .42})`; ctx.beginPath(); ctx.arc(Math.random() * rect.width, Math.random() * rect.height, Math.random() * 1.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#8a2940'; ctx.textAlign = 'center'; ctx.font = 'italic 17px Georgia'; ctx.fillText('A little surprise awaits', rect.width / 2, rect.height / 2 - 7);
    ctx.font = '10px Marcellus, Georgia'; ctx.letterSpacing = '2px'; ctx.fillText('RUB TO REVEAL', rect.width / 2, rect.height / 2 + 20);
  }, []);
  useEffect(() => { paint(); const resize = () => !doneRef.current && paint(); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize); }, [paint]);
  const point = e => { const r = canvasRef.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const scratch = e => {
    if (!drawing.current || doneRef.current) return;
    const p = point(e); const ctx = canvasRef.current.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 42; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); if (last.current) { ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); } else { ctx.arc(p.x, p.y, 21, 0, Math.PI * 2); }
    ctx.stroke(); last.current = p;
  };
  const finish = () => {
    drawing.current = false; last.current = null; const canvas = canvasRef.current; if (!canvas || doneRef.current) return;
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data; let clear = 0;
    for (let i = 3; i < data.length; i += 32) if (data[i] < 40) clear++;
    if (clear / (data.length / 32) > .42) { doneRef.current = true; setRevealed(true); setBurstKey(v => v + 1); }
  };
  const revealAgain = () => { doneRef.current = false; setRevealed(false); setTimeout(paint, 50); };
  return <section className="scratch-section paper-section">
    <PetalFall/>
    <p className="eyebrow">A GLIMPSE OF US</p><h2>Something to cherish</h2>
    <div className={`scratch-frame ${revealed ? 'is-revealed' : ''}`}>
      <div className="couple-photo">
        {!imageError && <img src={`${BASE}images/couple-reveal.jpg`} alt="Samkit and Tarushi" onError={() => setImageError(true)}/>}
        {imageError && <div className="photo-placeholder"><span>ST</span><small>Your couple photograph will appear here</small></div>}
      </div>
      {!revealed && <canvas ref={canvasRef} onPointerDown={e => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); scratch(e); }} onPointerMove={scratch} onPointerUp={finish} onPointerCancel={finish}/>}
      {revealed && <div key={burstKey} className="celebration-burst" aria-hidden="true">{Array.from({ length: 54 }, (_, i) => <i key={i} style={{ '--angle': `${i * 6.66}deg`, '--distance': `${70 + (i % 5) * 19}px`, '--delay': `${(i % 9) * .025}s` }}>{i % 4 === 0 ? '✦' : i % 4 === 1 ? '❀' : i % 4 === 2 ? '✧' : '•'}</i>)}</div>}
    </div>
    {revealed ? <button className="reveal-again" onClick={revealAgain}>↻ &nbsp; REVEAL AGAIN</button> : <p className="scratch-hint">Rub to reveal our favourite moment</p>}
  </section>;
}

function Countdown() {
  const target = new Date('2027-01-31T00:00:00+05:30').getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const diff = Math.max(0, target - now);
  const values = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60];
  return <section className="countdown-section paper-section"><p className="eyebrow">COUNTDOWN TO CELEBRATIONS</p><h2>Save The Date</h2><div className="date-plaque">31st January – 2nd February 2027</div><div className="countdown-grid">{values.map((v, i) => <div key={i}><strong>{String(v).padStart(2, '0')}</strong><span>{['DAYS', 'HOURS', 'MINUTES', 'SECONDS'][i]}</span></div>)}</div></section>;
}

function ParentsSection() {
  return <section className="parents-section">
    <div className="section-heading"><p className="eyebrow">WITH THE BLESSINGS OF OUR FAMILIES</p><h2>Our Parents</h2></div>
    <VideoPanel src={`${BASE}parents-details.mp4`} poster={`${BASE}images/video-poster.svg`} title="With love & blessings"/>
    <p className="parents-note">Their love, blessings and guidance make this celebration complete.</p>
  </section>;
}

function RSVP() {
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [guests, setGuests] = useState('2'); const [attendance, setAttendance] = useState('Joyfully accepting'); const [message, setMessage] = useState('');
  const submit = e => { e.preventDefault(); const body = [`Wedding RSVP — Samkit & Tarushi`, `Name: ${name}`, `Phone: ${phone}`, `Guests: ${guests}`, `Attendance: ${attendance}`, `Message: ${message || '—'}`].join('\n'); window.open(`https://wa.me/${RSVP_RAW}?text=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer'); };
  return <section className="rsvp-section paper-section" id="rsvp"><p className="eyebrow">KINDLY RESPOND</p><h2>RSVP</h2><p className="rsvp-intro">We would be delighted to celebrate with you.</p>
    <form onSubmit={submit} className="rsvp-form">
      <label>Your name<input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required/></label>
      <label>Phone number<input type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your contact number" required/></label>
      <label>Number of guests<select value={guests} onChange={e => setGuests(e.target.value)}>{Array.from({ length: 10 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label>
      <label>Will you be joining us?<select value={attendance} onChange={e => setAttendance(e.target.value)}><option>Joyfully accepting</option><option>Regretfully declining</option><option>Yet to confirm</option></select></label>
      <label>A little message (optional)<textarea rows="3" value={message} onChange={e => setMessage(e.target.value)} placeholder="Send your wishes..."/></label>
      <button className="rsvp-submit" type="submit">SEND RSVP ON WHATSAPP</button>
    </form>
    <p className="rsvp-contact">For assistance · <a href={`tel:${RSVP_NUMBER}`}>{RSVP_NUMBER}</a></p>
  </section>;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);
  const openingRef = useRef(null);
  const onReady = useCallback(() => setReady(true), []);
  const openInvitation = () => { if (opened) return; setOpened(true); setTimeout(() => openingRef.current?.play().catch(() => {}), 100); };
  const toggleMusic = async () => { const audio = audioRef.current; if (!audio) return; if (musicOn) { audio.pause(); setMusicOn(false); } else { try { await audio.play(); setMusicOn(true); } catch { setMusicOn(false); } } };
  return <main className="site-shell">
    <audio ref={audioRef} src={`${BASE}music/wedding-music.mp3`} loop preload="none"/>
    {!ready && <Preloader onReady={onReady}/>}
    {ready && !opened && <Envelope onOpen={openInvitation}/>}
    {opened && <>
      <header className="site-topbar"><span>ST</span><strong>SAMKIT <i>&</i> TARUSHI</strong><button onClick={toggleMusic} aria-label="Toggle music">{musicOn ? '♫ MUSIC ON' : '♫ MUSIC'}</button></header>
      <OpeningVideo onEnded={() => document.getElementById('parents')?.scrollIntoView({ behavior: 'smooth' })}/>
      <section className="hero-landscape"><div className="landscape-art"><span className="mountain mountain-one"/><span className="mountain mountain-two"/><span className="garden-gate">SAMKIT & TARUSHI</span></div><div className="hero-monogram"><img src={`${BASE}images/st-monogram.png`} alt="ST"/><p>Samkit <i>&</i> Tarushi</p><small>31 JANUARY – 2 FEBRUARY 2027</small></div><a className="scroll-down" href="#parents">SCROLL DOWN <span>⌄</span></a></section>
      <div id="parents"><ParentsSection/></div>
      <Countdown/>
      <ScratchReveal/>
      <section className="events-section" id="events"><div className="section-heading"><p className="eyebrow">THE CELEBRATIONS</p><h2>Join Us For The Festivities</h2><span className="heading-flourish">✧　❀　✧</span></div>
        {EVENTS.map((event, index) => <article className="event-block" key={event.id}>
          <div className="event-title"><span>0{index + 1}</span><div><h3>{event.title}</h3><p>{event.note}</p></div></div>
          <VideoPanel src={`${BASE}events/${event.file}`} poster={`${BASE}images/video-poster.svg`} className="event-video"/>
        </article>)}
      </section>
      <section className="venue-section"><p className="eyebrow">CELEBRATE WITH US</p><h2>We Can't Wait To See You</h2><p>Four beautiful celebrations. One unforgettable journey.</p></section>
      <RSVP/>
      <footer className="site-footer"><img src={`${BASE}images/st-monogram.png`} alt="ST monogram"/><p>With love & blessings</p><h2>Samkit <i>&</i> Tarushi</h2><small>31 JANUARY – 2 FEBRUARY 2027</small><a href={`tel:${RSVP_NUMBER}`}>RSVP · {RSVP_NUMBER}</a></footer>
    </>}
  </main>;
}
