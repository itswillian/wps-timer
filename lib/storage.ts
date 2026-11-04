import {
    DayStat,
    DEFAULT_SETTINGS,
    LIMITS,
    Settings,
    SoundName,
    SOUNDS,
    Task
} from './pomodoro'

const KEY = 'wps-timer:v1'
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/
const KEEP_DAYS = 30

export interface Saved {
    settings: Settings
    tasks: Task[]
    selected: number | null
    nextId: number
    days: Record<string, DayStat>
    notifOff: boolean
}

const num = (v: unknown, min: number, max: number, fallback: number) => {
    const n = typeof v === 'number' && isFinite(v) ? Math.round(v) : fallback
    return Math.min(max, Math.max(min, n))
}

function cleanSettings(raw: any): Settings {
    const r = raw && typeof raw === 'object' ? raw : {}
    const d = DEFAULT_SETTINGS
    return {
        focus: num(r.focus, LIMITS.focus.min, LIMITS.focus.max, d.focus),
        short: num(r.short, LIMITS.short.min, LIMITS.short.max, d.short),
        long: num(r.long, LIMITS.long.min, LIMITS.long.max, d.long),
        cycle: num(r.cycle, LIMITS.cycle.min, LIMITS.cycle.max, d.cycle),
        autoBreak: typeof r.autoBreak === 'boolean' ? r.autoBreak : d.autoBreak,
        autoFocus: typeof r.autoFocus === 'boolean' ? r.autoFocus : d.autoFocus,
        sound: SOUNDS.includes(r.sound as SoundName) ? (r.sound as SoundName) : d.sound
    }
}

function cleanTasks(raw: any): Task[] {
    if (!Array.isArray(raw)) return []
    const seen = new Set<number>()
    const out: Task[] = []
    raw.forEach((t) => {
        if (!t || typeof t.title !== 'string' || !t.title.trim()) return
        const id = num(t.id, 1, Number.MAX_SAFE_INTEGER, 0)
        if (!id || seen.has(id)) return
        seen.add(id)
        out.push({
            id,
            title: t.title.trim().slice(0, 200),
            est: num(t.est, 1, 12, 1),
            done: num(t.done, 0, 999, 0),
            complete: t.complete === true
        })
    })
    return out
}

function cleanDays(raw: any): Record<string, DayStat> {
    const out: Record<string, DayStat> = {}
    if (!raw || typeof raw !== 'object') return out
    Object.keys(raw)
        .filter((k) => DAY_KEY.test(k))
        .sort()
        .slice(-KEEP_DAYS)
        .forEach((k) => {
            out[k] = { min: num(raw[k]?.min, 0, 99999, 0), pomos: num(raw[k]?.pomos, 0, 9999, 0) }
        })
    return out
}

export function loadSaved(): Saved | null {
    try {
        const text = window.localStorage.getItem(KEY)
        if (!text) return null
        const raw = JSON.parse(text)
        if (!raw || typeof raw !== 'object') return null
        const tasks = cleanTasks(raw.tasks)
        const maxId = tasks.reduce((m, t) => Math.max(m, t.id), 0)
        return {
            settings: cleanSettings(raw.settings),
            tasks,
            selected: typeof raw.selected === 'number' ? raw.selected : null,
            nextId: Math.max(num(raw.nextId, 1, Number.MAX_SAFE_INTEGER, 1), maxId + 1),
            days: cleanDays(raw.days),
            notifOff: raw.notifOff === true
        }
    } catch (e) {
        return null
    }
}

export function writeSaved(data: Saved) {
    try {
        const days = cleanDays(data.days)
        window.localStorage.setItem(KEY, JSON.stringify({ ...data, days }))
    } catch (e) {}
}
