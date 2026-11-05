import { useEffect, useMemo, useRef, useState } from 'react'

/* ====== À PERSONNALISER ====== */
const NAME = 'Milca Mulimbi'
const FROM = 'Joseph' // ← ton prénom
const MESSAGE = [
  'Le temps a passé, nos chemins se sont éloignés, mais le 6 novembre est resté gravé dans ma mémoire.',
  'Aujourd’hui, je veux juste te souhaiter une année douce, lumineuse et pleine de belles choses.',
  'Que ton sourire continue d’éclairer tout autour de toi, comme ce coucher de soleil sur la plage. Je sais que tu n’es pas trop fan des phrases romantiques ni de tout ce blabla sentimental 😂, mais s’il te plaît, fais une petite exception aujourd’hui.',
]
const QUIZ = [
  { q: 'Quelle est ta couleur préférée ?', o: ['Bleu', 'Noir', 'Rouge'], a: 1 },
  { q: 'Quelle est ta nourriture préférée ?', o: ['Du rit avec Pondu madesu 😅', 'Du rit avec le Pondu 😅', 'Du rit avec madesu 😅'], a: 0 },
  { q: 'Quel est le club que tu préfères ?', o: ['FC Barcelona', 'Real Madrid', 'Paris Saint Germain'], a: 0 },
  { q: 'Quelle série ou quel film te fait rêver ?', o: ['The Vampire Diaries', 'Stranger Things', 'The Polygamist', 'Tous !'], a: -1 },
  { q: 'Ton souhait pour cette nouvelle année ?', o: ['Plus de voyages', 'Plus de joie', 'Plus de réussite', 'Tout à la fois'], a: -1 },
]
const PHOTOS = [1, 2, 3, 4, 5, 6].map((n) => `/images/photo${n}.jpeg`)
const ANIMALS = ['🐘', '🦁', '🐻', '🐯', '🦒', '🐼']
const ICONS = ['🎈', '🎂', '🎁', '✨', '💜', '🌸', '🎉', '🦋', '🎶', '🌅']
/* ============================== */

const MELODY = [[392,.75],[392,.25],[440,1],[392,1],[523.25,1],[493.88,2],[392,.75],[392,.25],[440,1],[392,1],[587.33,1],[523.25,2],[392,.75],[392,.25],[783.99,1],[659.25,1],[523.25,1],[493.88,1],[440,1],[698.46,.75],[698.46,.25],[659.25,1],[523.25,1],[587.33,1],[523.25,2]]

function useMusic() {
  const audio = useRef(null)
  const synth = useRef({ ctx: null, timer: null })
  const [on, setOn] = useState(false)
  const startSynth = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    synth.current.ctx = ctx
    const loop = () => {
      let t = ctx.currentTime + 0.1
      MELODY.forEach(([f, b]) => {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'triangle'; o.frequency.value = f
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.03)
        g.gain.exponentialRampToValueAtTime(0.0001, t + b * 0.55 - 0.02)
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + b * 0.55)
        t += b * 0.55
      })
      synth.current.timer = setTimeout(loop, (t - ctx.currentTime) * 1000 + 800)
    }
    loop()
  }
  const play = async () => {
    setOn(true)
    try {
      audio.current = new Audio('/music.mp3'); audio.current.loop = true; audio.current.volume = 0.7
      await audio.current.play() // utilise public/music.mp3 si présent
    } catch { audio.current = null; startSynth() } // sinon : mélodie « Joyeux anniversaire » générée
  }
  const stop = () => {
    setOn(false); audio.current?.pause(); clearTimeout(synth.current.timer)
    synth.current.ctx?.close(); synth.current.ctx = null
  }
  return { on, play, stop }
}

function Floaters({ n = 18 }) {
  const items = useMemo(() => Array.from({ length: n }, (_, i) => ({
    e: ICONS[i % ICONS.length], l: Math.random() * 100, d: 8 + Math.random() * 10,
    s: 1 + Math.random() * 1.6, dl: -Math.random() * 14,
  })), [n])
  return <div className="floaters" aria-hidden>{items.map((x, i) =>
    <span key={i} style={{ left: x.l + '%', fontSize: x.s + 'rem', animationDuration: x.d + 's', animationDelay: x.dl + 's' }}>{x.e}</span>)}</div>
}

function Letters({ text, base = 0 }) {
  return <>{[...text].map((c, i) =>
    <span key={i} className="ltr" style={{ animationDelay: base + i * 0.07 + 's' }}>{c === ' ' ? '\u00A0' : c}</span>)}</>
}

function Confetti() {
  const bits = useMemo(() => Array.from({ length: 70 }, () => ({
    l: Math.random() * 100, c: ['#ff5fa2', '#ffd27a', '#b388ff', '#7ee8fa'][Math.floor(Math.random() * 4)],
    d: 3 + Math.random() * 4, dl: Math.random() * 3,
  })), [])
  return <div className="confetti" aria-hidden>{bits.map((b, i) =>
    <i key={i} style={{ left: b.l + '%', background: b.c, animationDuration: b.d + 's', animationDelay: b.dl + 's' }} />)}</div>
}

function Quiz() {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const done = i >= QUIZ.length
  if (done) return (
    <div className="quiz final"><Confetti />
      <div className="big bounce">🎁</div>
      <h3>Bravo {NAME} !</h3>
      <p>{score} / {QUIZ.length} bonnes réponses — mais pour moi, tu as déjà tout gagné aujourd’hui.</p>
      <p className="sign">Avec toute ma sincérité, {FROM} 💜</p>
    </div>)
  const cur = QUIZ[i]
  const answer = (k) => {
    if (pick !== null) return
    setPick(k); if (cur.a === -1 || k === cur.a) setScore((s) => s + 1)
  }
  const next = () => { setPick(null); setI(i + 1) }
  const ok = pick !== null && (cur.a === -1 || pick === cur.a)
  return (
    <div className="quiz">
      <div className="bar"><div style={{ width: (i / QUIZ.length) * 100 + '%' }} /></div>
      <h3 key={i} className="pop">{cur.q}</h3>
      <div className="opts">{cur.o.map((o, k) => (
        <button key={k} onClick={() => answer(k)} disabled={pick !== null && k !== pick}
          className={pick === k ? (ok ? 'good' : 'bad') : ''}>{o}</button>))}
      </div>
      {pick !== null && <div className="fb pop">
        <span className="big wiggle">{ok ? '🥳' : '😅'}</span>
        <p>{cur.a === -1 ? 'Excellent choix !' : ok ? 'Bonne réponse !' : `Presque ! C’était « ${cur.o[cur.a]} ».`}</p>
        <button className="cta" onClick={next}>{i + 1 === QUIZ.length ? 'Voir mon cadeau' : 'Question suivante'}</button>
      </div>}
    </div>)
}

function Cake({ onDone }) {
  const [out, setOut] = useState(false)
  const done = useRef(false)
  const blow = () => {
    if (done.current) return
    done.current = true; setOut(true); setTimeout(onDone, 2600)
  }
  useEffect(() => {
    let stopped = false, stream, ctx, raf
    navigator.mediaDevices?.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false } }).then((st) => {
      if (stopped) return st.getTracks().forEach((t) => t.stop())
      stream = st; ctx = new (window.AudioContext || window.webkitAudioContext)()
      const an = ctx.createAnalyser(); an.fftSize = 512
      ctx.createMediaStreamSource(st).connect(an)
      const buf = new Uint8Array(an.fftSize); let n = 0
      const tick = () => {
        an.getByteTimeDomainData(buf)
        let sum = 0; for (const v of buf) { const x = (v - 128) / 128; sum += x * x }
        n = Math.sqrt(sum / buf.length) > 0.2 ? n + 1 : 0
        if (n > 8) return blow()
        raf = requestAnimationFrame(tick)
      }
      tick()
    }).catch(() => {})
    return () => { stopped = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); ctx?.close() }
  }, [])
  return (
    <div className={'cakepage' + (out ? ' out' : '')}>
      <Floaters n={10} />
      <h2 className="cakehint">{out ? 'Bravo, fais un vœu ! ✨' : 'Fais un vœu, puis souffle les bougies 🎤'}</h2>
      <div className="cake" onClick={blow}>
        <div className="candles">{[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="candle" style={{ '--i': i }}><i className="flame" /><i className="smoke" /></div>))}
        </div>
        <div className="tier t3"><b /></div><div className="tier t2"><b /></div><div className="tier t1"><b /></div>
        <div className="plate" />
      </div>
      {!out && <button className="cta" onClick={blow}>Souffler les bougies 💨</button>}
    </div>)
}

function Gallery() {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.15 })
    io.observe(ref.current); return () => io.disconnect()
  }, [])
  return (
    <section ref={ref} className={'gallery' + (seen ? ' in' : '')}>
      {PHOTOS.map((src, i) => (
        <div className="slot" key={i} style={{ '--pd': i * 0.7 + 's' }}>
          <span className="animal">{ANIMALS[i]}</span>
          <figure style={{ '--r': (i % 2 ? 3 : -3) + 'deg', '--d': i * 0.5 + 's', '--fd': i * 0.7 + 1.8 + 's' }}>
            <img src={src} alt="" loading="lazy" />
          </figure>
        </div>))}
    </section>)
}

export default function App() {
  const [stage, setStage] = useState('gate')
  const music = useMusic()
  useEffect(() => { document.body.style.overflow = stage === 'main' ? 'auto' : 'hidden' }, [stage])
  if (stage === 'cake') return <Cake onDone={() => setStage('main')} />
  if (stage === 'gate') return (
    <div className="gate"><Floaters n={12} />
      <div className="big bounce">🎁</div>
      <h1>Une surprise t’attend</h1>
      <button className="cta glow" onClick={() => { setStage('cake'); music.play() }}>Ouvrir la surprise</button>
    </div>)
  return (
    <main>
      <Floaters />
      <button className="mute" onClick={music.on ? music.stop : music.play} aria-label="Musique">{music.on ? '🔊' : '🔇'}</button>
      <section className="hero">
        <div className="big spin">🎂</div>
        <h1><span className="line"><Letters text="Joyeux" /></span>
          <span className="line"><Letters text="Anniversaire" base={0.6} /></span>
          <span className="line name"><Letters text={NAME} base={1.9} /></span></h1>
        <p className="date">6 novembre 2026</p>
        <div className="scroll">⌄</div>
      </section>
      <Gallery />
      <section className="msg">
        {MESSAGE.map((t, i) => <p key={i}>{t}</p>)}
      </section>
      <section className="quizwrap"><h2>Un petit quiz pour toi 🎯</h2><Quiz /></section>
      <footer>Fait avec ♥ pour toi</footer>
    </main>)
}
