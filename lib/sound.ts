import type { SoundName } from './pomodoro'

type AudioCtor = typeof AudioContext

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
    try {
        const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor }
        const Ctor = w.AudioContext || w.webkitAudioContext
        if (!Ctor) return null
        if (!ctx) ctx = new Ctor()
        if (ctx.state === 'suspended' && ctx.resume) ctx.resume()
        return ctx
    } catch (e) {
        return null
    }
}

// Browsers only allow audio after a user gesture, so the context is unlocked when the timer starts.
export function prepareAudio() {
    getContext()
}

const SEQUENCES: Record<SoundName, number[][]> = {
    Sino: [[880, 0], [1318, 0.2]],
    Madeira: [[330, 0], [330, 0.18]],
    Digital: [[1046, 0], [1046, 0.14], [1046, 0.28]]
}

export function playChime(name: SoundName) {
    const audio = getContext()
    if (!audio) return
    try {
        const wave: OscillatorType = name === 'Digital' ? 'square' : name === 'Madeira' ? 'triangle' : 'sine'
        SEQUENCES[name].forEach(([freq, delay]) => {
            const osc = audio.createOscillator()
            const gain = audio.createGain()
            const at = audio.currentTime + delay
            osc.type = wave
            osc.frequency.value = freq
            gain.gain.setValueAtTime(0.0001, at)
            gain.gain.exponentialRampToValueAtTime(0.18, at + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.4)
            osc.connect(gain)
            gain.connect(audio.destination)
            osc.start(at)
            osc.stop(at + 0.45)
        })
    } catch (e) {}
}
