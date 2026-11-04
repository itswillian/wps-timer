import { useEffect, useRef, useState } from 'react'
import {
    dateKey,
    DayStat,
    DEFAULT_SETTINGS,
    durationOf,
    LIMITS,
    Mode,
    NotifState,
    pickSelected,
    Settings,
    SoundName,
    Task,
    THEMES,
    View
} from './pomodoro'
import { playChime, prepareAudio } from './sound'
import { loadSaved, writeSaved } from './storage'

export interface AppState {
    mode: Mode
    remaining: number
    runTotal: number
    running: boolean
    endAt: number | null
    focusCount: number
    runTask: number | null
    days: Record<string, DayStat>
    tasks: Task[]
    selected: number | null
    nextId: number
    newText: string
    newEst: number
    addError: boolean
    animTick: number
    editId: number | null
    editText: string
    editEst: number
    editError: boolean
    settings: Settings
    notif: NotifState
    notifOff: boolean
    view: View
    showSettings: boolean
    toast: string
    toastUndo: boolean
}

const initialState = (): AppState => ({
    mode: 'focus',
    remaining: DEFAULT_SETTINGS.focus * 60,
    runTotal: DEFAULT_SETTINGS.focus * 60,
    running: false,
    endAt: null,
    focusCount: 0,
    runTask: null,
    days: {},
    tasks: [],
    selected: null,
    nextId: 1,
    newText: '',
    newEst: 1,
    addError: false,
    animTick: 0,
    editId: null,
    editText: '',
    editEst: 1,
    editError: false,
    settings: DEFAULT_SETTINGS,
    notif: 'off',
    notifOff: false,
    view: 'timer',
    showSettings: false,
    toast: '',
    toastUndo: false
})

type Patch = Partial<AppState>

// A removed task and the position it had, so "Desfazer" can put it back where it was.
interface Removed {
    t: Task
    i: number
}

const UNDO_MS = 10000
const TOAST_MS = 6000

export function useWpsTimer() {
    const [state, setState] = useState<AppState>(initialState)
    const [now, setNow] = useState<number | null>(null)
    const [loaded, setLoaded] = useState(false)

    const ref = useRef<AppState>(state)
    const tickRef = useRef<() => void>(() => {})
    const toastTimer = useRef<ReturnType<typeof setTimeout>>()
    // While an undo toast is up, other messages wait here instead of replacing it.
    const undoFn = useRef<(() => string) | null>(null)
    const pendingMsg = useRef<string | null>(null)
    const opener = useRef<HTMLElement | null>(null)
    const closeButton = useRef<HTMLButtonElement>(null)
    const chipKey = useRef<string | undefined>(undefined)
    // Stable reference so the Picture-in-Picture window can drive the countdown without re-registering its interval.
    const tickNow = useRef(() => tickRef.current()).current

    // Keeps a ref with the latest state so timers and handlers never read a stale copy.
    const update = (p: Patch | ((s: AppState) => Patch)) => {
        const next = { ...ref.current, ...(typeof p === 'function' ? p(ref.current) : p) }
        ref.current = next
        setState(next)
    }

    useEffect(() => {
        const saved = loadSaved()
        const patch: Patch = {}
        if (saved) {
            const d = saved.settings.focus * 60
            patch.settings = saved.settings
            patch.tasks = saved.tasks
            patch.nextId = saved.nextId
            patch.days = saved.days
            patch.notifOff = saved.notifOff
            patch.selected = pickSelected(saved.tasks, saved.selected)
            patch.remaining = d
            patch.runTotal = d
        }
        const off = saved ? saved.notifOff : false
        try {
            if (!('Notification' in window)) patch.notif = 'unsupported'
            else if (Notification.permission === 'denied') patch.notif = 'blocked'
            else if (Notification.permission === 'granted') patch.notif = off ? 'off' : 'on'
        } catch (e) {}
        update(patch)
        setNow(Date.now())
        setLoaded(true)

        const tick = setInterval(() => tickRef.current(), 250)
        const clock = setInterval(() => setNow(Date.now()), 15000)
        return () => {
            clearInterval(tick)
            clearInterval(clock)
            if (toastTimer.current) clearTimeout(toastTimer.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!loaded) return
        writeSaved({
            settings: state.settings,
            tasks: state.tasks,
            selected: state.selected,
            nextId: state.nextId,
            days: state.days,
            notifOff: state.notifOff
        })
    }, [loaded, state.settings, state.tasks, state.selected, state.nextId, state.days, state.notifOff])

    // Retriggers the "task in focus" card animation when the selected task or the mode changes.
    useEffect(() => {
        const key = state.selected + '|' + state.mode
        if (chipKey.current !== undefined && chipKey.current !== key) {
            chipKey.current = key
            update((s) => ({ animTick: s.animTick + 1 }))
        } else if (chipKey.current === undefined) {
            chipKey.current = key
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.selected, state.mode])

    const say = (msg: string, undo?: () => string) => {
        if (!undo && undoFn.current) {
            // Several messages can arrive during one undo window; they are joined so none is lost.
            const queued = pendingMsg.current
            if (!queued) pendingMsg.current = msg
            else if (!queued.includes(msg)) pendingMsg.current = queued.length > 160 ? msg : queued + ' ' + msg
            return
        }
        if (undo && undoFn.current) {
            // A second undoable action inside the window: one "Desfazer" restores both, newest first,
            // so the earlier deletion is never lost.
            const older = undoFn.current
            const newer = undo
            undo = () => {
                newer()
                older()
                return 'Tarefas restauradas.'
            }
            msg = 'Várias tarefas removidas.'
        }
        if (toastTimer.current) clearTimeout(toastTimer.current)
        undoFn.current = undo || null
        // A new undo toast keeps any queued message so it shows once the undo window ends.
        if (!undo) pendingMsg.current = null
        update({ toast: msg, toastUndo: !!undo })
        if (undo) {
            setTimeout(() => {
                const b = document.getElementById('undo-btn')
                if (b) b.focus()
            }, 30)
        }
        toastTimer.current = setTimeout(
            () => {
                undoFn.current = null
                const next = pendingMsg.current
                pendingMsg.current = null
                if (next) say(next)
                else update({ toast: '', toastUndo: false })
            },
            undo ? UNDO_MS : TOAST_MS
        )
    }

    const undoToast = () => {
        const fn = undoFn.current
        undoFn.current = null
        if (toastTimer.current) clearTimeout(toastTimer.current)
        const waiting = pendingMsg.current
        pendingMsg.current = null
        if (fn) {
            const msg = fn()
            say((msg || 'Desfeito.') + (waiting ? ' ' + waiting : ''))
        } else {
            update({ toast: '', toastUndo: false })
        }
    }

    const restoreTasks = (removed: Removed[]) =>
        update((s) => {
            const arr = [...s.tasks]
            removed.forEach(({ t, i }) => arr.splice(Math.min(i, arr.length), 0, t))
            return { tasks: arr, selected: pickSelected(arr, s.selected) }
        })

    // Puts the focus back on the "Editar" button of a task after its edit form closes.
    const focusEdit = (id: number) =>
        setTimeout(() => {
            const b = document.querySelector<HTMLElement>('[data-edit-id="' + id + '"]')
            if (b) b.focus()
        }, 30)

    const advance = (counted: boolean) => {
        const s = ref.current
        const st = s.settings
        let { focusCount, days, tasks } = s
        let next: Mode
        let msg = ''
        if (s.mode === 'focus') {
            if (counted) {
                focusCount += 1
                const key = dateKey(new Date())
                const prev = days[key] || { min: 0, pomos: 0 }
                days = { ...days, [key]: { min: prev.min + Math.round(s.runTotal / 60), pomos: prev.pomos + 1 } }
                const live = (id: number) => tasks.some((t) => t.id === id && !t.complete)
                const target = s.runTask != null && live(s.runTask) ? s.runTask : s.selected
                tasks = tasks.map((t) => (t.id === target ? { ...t, done: t.done + 1 } : t))
            }
            next = focusCount >= st.cycle ? 'long' : 'short'
            if (counted) {
                msg = next === 'long'
                    ? st.cycle + ' focos concluídos. Hora de uma pausa longa.'
                    : 'Foco concluído. Hora de uma pausa curta.'
            }
        } else {
            if (s.mode === 'long' || focusCount >= st.cycle) focusCount = 0
            next = 'focus'
            if (counted) msg = 'Pausa encerrada. Pronto para o próximo foco?'
        }
        const auto = next === 'focus' ? st.autoFocus : st.autoBreak
        const d = durationOf(next, st)
        const sel = pickSelected(tasks, s.selected)
        update({
            mode: next,
            focusCount,
            days,
            tasks,
            selected: sel,
            runTask: auto && next === 'focus' ? sel : null,
            running: auto,
            remaining: d,
            runTotal: d,
            endAt: auto ? Date.now() + d * 1000 : null
        })
        if (counted) {
            playChime(st.sound)
            if (s.notif === 'on') {
                try {
                    new Notification('WPS Timer', { body: msg })
                } catch (e) {}
            }
        }
        if (msg) say(msg)
    }

    tickRef.current = () => {
        const s = ref.current
        if (!s.running || s.endAt == null) return
        const rem = Math.ceil((s.endAt - Date.now()) / 1000)
        if (rem <= 0) advance(true)
        else if (rem !== s.remaining) update({ remaining: rem })
    }

    const selectMode = (m: Mode) => {
        const s = ref.current
        const d = durationOf(m, s.settings)
        update({
            mode: m,
            running: false,
            endAt: null,
            remaining: d,
            runTotal: d,
            focusCount: m === 'focus' && s.focusCount >= s.settings.cycle ? 0 : s.focusCount
        })
    }

    const toggle = () => {
        const s = ref.current
        if (s.running && s.endAt != null) {
            update({ running: false, endAt: null, remaining: Math.max(1, Math.ceil((s.endAt - Date.now()) / 1000)) })
        } else {
            prepareAudio()
            update({
                running: true,
                endAt: Date.now() + s.remaining * 1000,
                runTask: s.mode === 'focus' && s.remaining >= s.runTotal ? s.selected : s.runTask
            })
        }
    }

    const reset = () => {
        const d = durationOf(ref.current.mode, ref.current.settings)
        update({ running: false, endAt: null, remaining: d, runTotal: d })
    }

    const skip = () => advance(false)

    const adjust = (key: 'focus' | 'short' | 'long' | 'cycle', delta: number) => {
        const s = ref.current
        const lim = LIMITS[key]
        const v = Math.min(lim.max, Math.max(lim.min, s.settings[key] + delta * lim.step))
        const patch: Patch = { settings: { ...s.settings, [key]: v } }
        if (key === 'cycle') patch.focusCount = Math.min(s.focusCount, v - 1)
        if (s.mode === key) {
            const nt = v * 60
            if (!s.running && s.remaining >= s.runTotal) {
                patch.remaining = nt
                patch.runTotal = nt
            } else if (s.remaining > nt) {
                patch.remaining = nt
                patch.runTotal = Math.min(s.runTotal, nt)
                if (s.running) patch.endAt = Date.now() + nt * 1000
            }
        }
        update(patch)
    }

    const flip = (key: 'autoBreak' | 'autoFocus') =>
        update((s) => ({ settings: { ...s.settings, [key]: !s.settings[key] } }))

    const pickSound = (name: SoundName) => {
        update((s) => ({ settings: { ...s.settings, sound: name } }))
        playChime(name)
    }

    const setNewText = (v: string) => update({ newText: v, addError: false })
    const stepNewEst = (d: number) => update((s) => ({ newEst: Math.min(12, Math.max(1, s.newEst + d)) }))

    const addTask = () => {
        const s = ref.current
        const title = s.newText.trim()
        if (!title) {
            update({ addError: true })
            return
        }
        const nt = [...s.tasks, { id: s.nextId, title, est: s.newEst, done: 0, complete: false }]
        update({
            tasks: nt,
            selected: pickSelected(nt, s.selected),
            nextId: s.nextId + 1,
            newText: '',
            newEst: 1,
            addError: false
        })
    }

    const startEdit = (t: Task) => update({ editId: t.id, editText: t.title, editEst: t.est, editError: false })
    const cancelEdit = (id: number) => {
        update({ editId: null, editError: false })
        focusEdit(id)
    }
    const setEditText = (v: string) => update({ editText: v, editError: false })
    const stepEditEst = (d: number) => update((s) => ({ editEst: Math.min(12, Math.max(1, s.editEst + d)) }))

    const saveEdit = (id: number) => {
        const s = ref.current
        const title = s.editText.trim()
        if (!title) {
            update({ editError: true })
            return
        }
        update({
            tasks: s.tasks.map((x) => (x.id === id ? { ...x, title, est: s.editEst } : x)),
            editId: null,
            editError: false
        })
        say('Tarefa atualizada.')
        focusEdit(id)
    }

    const removeTask = (t: Task) => {
        const s = ref.current
        const idx = s.tasks.findIndex((x) => x.id === t.id)
        if (idx < 0) return
        const full = s.tasks[idx]
        const nt = s.tasks.filter((x) => x.id !== t.id)
        update({
            tasks: nt,
            editId: s.editId === t.id ? null : s.editId,
            editError: false,
            selected: pickSelected(nt, s.selected)
        })
        say('Tarefa excluída: ' + t.title, () => {
            restoreTasks([{ t: full, i: idx }])
            return 'Tarefa restaurada.'
        })
    }

    const selectTask = (t: Task) => {
        if (t.complete) return
        update((s) => ({
            selected: t.id,
            runTask: s.mode === 'focus' && (s.running || s.remaining < s.runTotal) ? t.id : s.runTask
        }))
    }

    const toggleComplete = (t: Task) => {
        const s = ref.current
        const nt = s.tasks.map((x) => (x.id === t.id ? { ...x, complete: !x.complete } : x))
        update({ tasks: nt, selected: pickSelected(nt, s.selected) })
    }

    const clearDone = () => {
        const s = ref.current
        const removed: Removed[] = []
        s.tasks.forEach((t, i) => {
            if (t.complete) removed.push({ t, i })
        })
        if (!removed.length) return
        const nt = s.tasks.filter((t) => !t.complete)
        update({
            tasks: nt,
            editId: removed.some((r) => r.t.id === s.editId) ? null : s.editId,
            selected: pickSelected(nt, s.selected)
        })
        say(
            removed.length === 1 ? '1 tarefa concluída removida.' : removed.length + ' tarefas concluídas removidas.',
            () => {
                restoreTasks(removed)
                return removed.length === 1 ? 'Tarefa restaurada.' : 'Tarefas restauradas.'
            }
        )
    }

    const toggleNotif = () => {
        const s = ref.current
        if (s.notif === 'on') {
            update({ notif: 'off', notifOff: true })
            return
        }
        try {
            if (!('Notification' in window)) {
                update({ notif: 'unsupported' })
                return
            }
            Promise.resolve(Notification.requestPermission()).then((p) =>
                update(p === 'granted'
                    ? { notif: 'on', notifOff: false }
                    : { notif: p === 'denied' ? 'blocked' : 'off' })
            )
        } catch (e) {
            update({ notif: 'unsupported' })
        }
    }

    const openSettings = () => {
        opener.current = document.activeElement as HTMLElement | null
        update({ showSettings: true })
        setTimeout(() => closeButton.current && closeButton.current.focus(), 50)
    }

    const closeSettings = () => {
        update({ showSettings: false })
        const o = opener.current
        if (o && o.focus) setTimeout(() => o.focus(), 0)
    }

    const setView = (v: View) => update({ view: v })

    const onDialogKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            closeSettings()
            return
        }
        if (e.key !== 'Tab') return
        const f = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input')).filter(
            (x) => !(x as HTMLButtonElement).disabled
        )
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        const dlg = e.currentTarget.querySelector('[role="dialog"]')
        const a = document.activeElement
        const outside = !dlg || !a || !dlg.contains(a) || a === dlg
        if (e.shiftKey && (a === first || outside)) {
            e.preventDefault()
            last.focus()
        } else if (!e.shiftKey && (a === last || outside)) {
            e.preventDefault()
            first.focus()
        }
    }

    const keepFocus = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) e.preventDefault()
    }

    const base = THEMES[state.mode]
    const th = { ...base, bg: state.running ? base.calm : base.bg }

    return {
        state,
        now,
        th,
        closeButton,
        tick: tickNow,
        selectMode,
        toggle,
        reset,
        skip,
        adjust,
        flip,
        pickSound,
        setNewText,
        stepNewEst,
        addTask,
        startEdit,
        cancelEdit,
        setEditText,
        stepEditEst,
        saveEdit,
        removeTask,
        selectTask,
        toggleComplete,
        clearDone,
        undoToast,
        toggleNotif,
        openSettings,
        closeSettings,
        setView,
        onDialogKey,
        keepFocus
    }
}

export type WpsTimer = ReturnType<typeof useWpsTimer>
