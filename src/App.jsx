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

let sharedAudioCtx = null
function getAudioContext() {
  const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!Ctx) return null
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    try { sharedAudioCtx = new Ctx() } catch { return null }
  }
  return sharedAudioCtx
}
function unlockAudio() {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

const MIC_MESSAGES = {
  requesting: 'Autorise le micro pour souffler les bougies…',
  denied: 'Accès au micro refusé — utilise le bouton ci-dessous 💨',
  busy: 'Micro déjà utilisé par une autre app — utilise le bouton ci-dessous.',
  notfound: 'Aucun microphone détecté — utilise le bouton ci-dessous.',
  insecure: 'Le micro nécessite HTTPS — utilise le bouton ci-dessous.',
  unsupported: 'Micro non disponible sur ce navigateur — utilise le bouton ci-dessous.',
  error: 'Le micro n’a pas pu démarrer — utilise le bouton ci-dessous.',
  ended: 'Le micro s’est arrêté — utilise le bouton ci-dessous.',
  paused: 'Touche l’écran pour réactiver le micro.',
}

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
  const [micState, setMicState] = useState('idle')
  const done = useRef(false)
  const outro = useRef(null)
  const stopMic = useRef(null)
  const blowRef = useRef(null)
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone })

  const blow = () => {
    if (done.current) return
    done.current = true
    stopMic.current?.()
    setOut(true)
    outro.current = setTimeout(() => onDoneRef.current?.(), 2600)
  }
  blowRef.current = blow

  useEffect(() => {
    let destroyed = false
    let blocked = false
    let starting = false
    let stream = null
    let ctx = null
    let source = null
    let analyser = null
    let sink = null
    let raf = null
    let lastFrame = 0
    let calibrating = true
    let calStart = 0
    let calSamples = []
    let noiseFloor = 0.01
    let above = false
    let aboveStart = 0
    let aboveFrames = 0
    let timeF = null
    let timeB = null
    let freqB = null
    let useFloat = false
    let loBin = 1
    let hiBin = 1

    const status = (s) => { if (!destroyed) setMicState(s) }
    const clearLoop = () => { if (raf) cancelAnimationFrame(raf); raf = null }

    const teardown = () => {
      clearLoop()
      try { source?.disconnect() } catch {}
      try { analyser?.disconnect() } catch {}
      try { sink?.disconnect() } catch {}
      if (stream) {
        stream.getTracks().forEach((t) => { t.onended = null; try { t.stop() } catch {} })
      }
      stream = null; source = null; analyser = null; sink = null
      timeF = null; timeB = null; freqB = null
      if (ctx && ctx === sharedAudioCtx && ctx.state === 'running') ctx.suspend().catch(() => {})
    }

    const shutdown = () => {
      if (destroyed) return
      destroyed = true
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('pointerdown', onGesture, true)
      document.removeEventListener('touchstart', onGesture, true)
      window.removeEventListener('pageshow', onPageShow)
      teardown()
    }
    stopMic.current = shutdown

    function startLoop() {
      if (destroyed || raf || !analyser) return
      raf = requestAnimationFrame(tick)
    }

    function tick(ts) {
      raf = null
      if (destroyed) return
      if (ts - lastFrame < 33) { raf = requestAnimationFrame(tick); return }
      lastFrame = ts
      if (!analyser) return
      if (!ctx || ctx.state !== 'running') {
        if (ctx) ctx.resume().then(() => {
          if (destroyed) return
          status('listening')
          if (!raf) startLoop()
        }).catch(() => status('paused'))
        return
      }
      process(ts)
      if (!destroyed) raf = requestAnimationFrame(tick)
    }

    function sampleAt(i) {
      return useFloat ? timeF[i] : (timeB[i] - 128) / 128
    }

    function maxPeriodicity() {
      const n = analyser.fftSize
      const minLag = Math.max(1, Math.floor(ctx.sampleRate / 1200))
      const maxLag = Math.min(Math.floor(ctx.sampleRate / 80), Math.floor(n / 2))
      let best = 0
      for (let lag = minLag; lag <= maxLag; lag += 2) {
        let dot = 0, e1 = 0, e2 = 0
        for (let i = 1; i + lag < n; i += 2) {
          const a = sampleAt(i) - sampleAt(i - 1)
          const b = sampleAt(i + lag) - sampleAt(i + lag - 1)
          dot += a * b; e1 += a * a; e2 += b * b
        }
        const corr = dot / (Math.sqrt(e1 * e2) + 1e-9)
        if (corr > best) best = corr
        if (best > 0.5) break
      }
      return best
    }

    function process(ts) {
      const n = analyser.fftSize
      if (useFloat) analyser.getFloatTimeDomainData(timeF)
      else analyser.getByteTimeDomainData(timeB)
      let sum = 0
      for (let i = 0; i < n; i++) {
        const x = sampleAt(i)
        sum += x * x
      }
      const rms = Math.sqrt(sum / n)

      if (calibrating) {
        calSamples.push(rms)
        if (ts - calStart >= 550 && calSamples.length >= 10) {
          const sorted = calSamples.slice().sort((a, b) => a - b)
          noiseFloor = Math.max(0.004, Math.min(sorted[Math.floor(sorted.length / 2)], 0.15))
          calibrating = false
        }
        return
      }

      const threshold = Math.max(0.009, noiseFloor * 1.35 + 0.006)
      if (rms <= threshold) {
        above = false; aboveFrames = 0
        noiseFloor = Math.min(0.2, noiseFloor * 0.96 + rms * 0.04)
        return
      }

      analyser.getByteFrequencyData(freqB)
      let magSum = 0, logSum = 0, peak = 0
      const count = Math.max(1, hiBin - loBin + 1)
      for (let i = loBin; i <= hiBin; i++) {
        const m = freqB[i] / 255
        magSum += m
        logSum += Math.log(m + 0.001)
        if (m > peak) peak = m
      }
      const mean = magSum / count
      const flatness = mean > 0 ? Math.exp(logSum / count) / mean : 0
      const peakRatio = mean > 0 ? peak / mean : 99
      const breathLike = flatness > 0.1 && peakRatio < 16 && maxPeriodicity() < 0.45

      if (breathLike) {
        if (!above) { above = true; aboveStart = ts; aboveFrames = 0 }
        aboveFrames++
        if (ts - aboveStart >= 200 && aboveFrames >= 5) {
          blowRef.current?.()
          return
        }
      } else {
        above = false; aboveFrames = 0
        noiseFloor = Math.min(0.2, noiseFloor * 0.992 + rms * 0.008)
      }
    }

    async function startMic() {
      if (destroyed || done.current || starting || blocked) return
      starting = true
      status('requesting')
      try {
        if (window.isSecureContext === false) { blocked = true; status('insecure'); return }
        if (!navigator.mediaDevices?.getUserMedia) { blocked = true; status('unsupported'); return }

        let st
        try {
          st = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: false,
              autoGainControl: false,
              channelCount: 1,
            },
          })
        } catch (err) {
          if (destroyed) return
          const name = err && err.name
          if (name === 'NotAllowedError' || name === 'SecurityError') { blocked = true; status('denied') }
          else if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') { blocked = true; status('notfound') }
          else if (name === 'NotReadableError' || name === 'AbortError' || name === 'TrackStartError') { status('busy') }
          else { status('error') }
          return
        }

        if (destroyed || done.current) { st.getTracks().forEach((t) => t.stop()); return }
        stream = st
        const track = st.getAudioTracks?.()[0] || st.getTracks()[0]
        if (!track) { blocked = true; teardown(); status('notfound'); return }
        track.onended = () => {
          if (destroyed || done.current) return
          teardown(); status('ended')
        }

        ctx = getAudioContext()
        if (!ctx) { blocked = true; teardown(); status('unsupported'); return }
        try { if (ctx.state === 'suspended') await ctx.resume() } catch {}

        source = ctx.createMediaStreamSource(st)
        analyser = ctx.createAnalyser()
        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.2
        sink = ctx.createGain()
        sink.gain.value = 0
        source.connect(analyser)
        analyser.connect(sink)
        sink.connect(ctx.destination)

        const binHz = ctx.sampleRate / analyser.fftSize
        loBin = Math.max(1, Math.floor(120 / binHz))
        hiBin = Math.min(analyser.frequencyBinCount - 1, Math.ceil(4000 / binHz))
        useFloat = typeof analyser.getFloatTimeDomainData === 'function'
        if (useFloat) timeF = new Float32Array(analyser.fftSize)
        else timeB = new Uint8Array(analyser.fftSize)
        freqB = new Uint8Array(analyser.frequencyBinCount)

        calibrating = true; calStart = performance.now(); calSamples = []
        above = false; aboveFrames = 0
        status(ctx.state === 'running' ? 'listening' : 'paused')
        startLoop()
      } catch {
        if (!destroyed) status('error')
      } finally {
        starting = false
      }
    }

    function onVisibility() {
      if (destroyed || done.current) return
      if (document.hidden) { teardown(); return }
      const track = stream?.getAudioTracks?.()[0] || stream?.getTracks?.()[0]
      if (!stream || !track || track.readyState === 'ended') {
        teardown()
        if (!blocked) startMic()
        return
      }
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
      status('listening')
      startLoop()
    }

    function onGesture() {
      if (destroyed || done.current) return
      const c = ctx || getAudioContext()
      if (c && c.state === 'suspended') c.resume().catch(() => {})
      if (analyser) startLoop()
      else if (!blocked) startMic()
    }

    function onPageShow() {
      if (!destroyed && !document.hidden) onVisibility()
    }

    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('pointerdown', onGesture, true)
    document.addEventListener('touchstart', onGesture, true)
    window.addEventListener('pageshow', onPageShow)
    startMic()

    return () => {
      clearTimeout(outro.current)
      shutdown()
      stopMic.current = null
    }
  }, [])

  const micNote = !out && MIC_MESSAGES[micState]
  return (
    <div className={'cakepage' + (out ? ' out' : '')}>
      <Floaters n={10} />
      <h2 className="cakehint">{out ? 'Bravo, fais un vœu ! ✨' : 'Fais un vœu, puis souffle les bougies 🎤'}</h2>
      {micNote && <p className="micnote" role="status" aria-live="polite">{micNote}</p>}
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
            <figcaption className="polaroid-caption"><span aria-hidden="true">⭐</span> Joyeux anniversaire ! <span aria-hidden="true">⭐</span></figcaption>
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
      <button className="cta glow" onClick={() => { unlockAudio(); setStage('cake'); music.play() }}>Ouvrir la surprise</button>
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


