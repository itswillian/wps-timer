export type Mode = 'focus' | 'short' | 'long'
export type View = 'timer' | 'tasks' | 'today'
export type SoundName = 'Sino' | 'Madeira' | 'Digital'
export type NotifState = 'on' | 'off' | 'blocked' | 'unsupported'

export interface Task {
    id: number
    title: string
    est: number
    done: number
    complete: boolean
}

export interface Settings {
    focus: number
    short: number
    long: number
    cycle: number
    autoBreak: boolean
    autoFocus: boolean
    sound: SoundName
}

export interface DayStat {
    min: number
    pomos: number
}

export const MODES: Mode[] = ['focus', 'short', 'long']
export const SOUNDS: SoundName[] = ['Sino', 'Madeira', 'Digital']

export const THEMES: Record<Mode, { bg: string; calm: string; label: string }> = {
    focus: { bg: '#BF3A28', calm: '#52262B', label: 'Foco' },
    short: { bg: '#1E6B52', calm: '#173A31', label: 'Pausa curta' },
    long: { bg: '#2F45B5', calm: '#1D2760', label: 'Pausa longa' }
}

export const INK = '#1C2230'

export const DEFAULT_SETTINGS: Settings = {
    focus: 25,
    short: 5,
    long: 15,
    cycle: 4,
    autoBreak: true,
    autoFocus: false,
    sound: 'Sino'
}

export const LIMITS = {
    focus: { step: 5, min: 5, max: 90 },
    short: { step: 1, min: 1, max: 30 },
    long: { step: 5, min: 5, max: 60 },
    cycle: { step: 1, min: 2, max: 8 }
}

export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const durationOf = (mode: Mode, settings: Settings) => settings[mode] * 60

export const pad = (n: number) => String(n).padStart(2, '0')

export const fmtMin = (m: number) =>
    m >= 60 ? Math.floor(m / 60) + ' h ' + pad(m % 60) + ' min' : m + ' min'

export const dateKey = (d: Date) =>
    d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())

export const pickSelected = (tasks: Task[], current: number | null) => {
    const cur = tasks.find((t) => t.id === current && !t.complete)
    if (cur) return cur.id
    const first = tasks.find((t) => !t.complete)
    return first ? first.id : null
}
