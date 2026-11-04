import React, { CSSProperties, useEffect } from 'react'
import { THEMES } from '../../lib/pomodoro'
import type { WpsTimer } from '../../lib/useWpsTimer'

const ICON: CSSProperties = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
}

const ROUND_BUTTON: CSSProperties = {
    flex: 'none',
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'rgba(0,0,0,.22)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

interface MiniTimerProps {
    app: WpsTimer
    win: Window
}

// Content of the floating Picture-in-Picture window: time, mode, task in focus and the three controls.
const MiniTimer: React.FC<MiniTimerProps> = ({ app, win }) => {
    const { state: s, th } = app
    const mm = Math.floor(s.remaining / 60)
    const ss = s.remaining % 60
    const full = s.remaining >= s.runTotal
    const selTask = s.tasks.find((t) => t.id === s.selected)
    const label =
        s.mode === 'focus'
            ? selTask && !selTask.complete
                ? selTask.title
                : 'Sem tarefa em foco'
            : s.mode === 'short'
            ? 'Respire fundo'
            : 'Levante e se alongue'
    const nextName = s.mode === 'focus' ? 'a pausa curta (este foco não conta)' : 'o foco'
    const progress = Math.min(100, Math.max(0, (1 - s.remaining / s.runTotal) * 100))

    // The main tab can be throttled by the browser while it is in the background; this window never is.
    // Driving the countdown from here keeps the display and the end-of-cycle alert on time.
    useEffect(() => {
        const id = win.setInterval(app.tick, 250)
        return () => win.clearInterval(id)
    }, [win, app.tick])

    useEffect(() => {
        const body = win.document.body
        body.style.margin = '0'
        body.style.background = th.bg
        body.style.transition = 'background .9s ease'
    }, [win, th.bg])

    return (
        <div
            style={{
                boxSizing: 'border-box',
                height: '100vh',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: th.bg,
                color: '#fff',
                fontFamily: "'Instrument Sans',system-ui,sans-serif",
                fontSize: 16,
                transition: 'background .9s ease'
            }}
        >
            <span
                style={{
                    padding: '3px 12px',
                    borderRadius: 999,
                    background: 'rgba(0,0,0,.22)',
                    fontWeight: 600,
                    fontSize: 13
                }}
            >
                {THEMES[s.mode].label + ' · ' + (s.running ? 'Em andamento' : full ? 'Pronto' : 'Pausado')}
            </span>

            <div
                role="timer"
                aria-label={mm + ' minutos e ' + ss + ' segundos restantes'}
                style={{
                    fontFamily: "'Bricolage Grotesque',sans-serif",
                    fontWeight: 700,
                    fontSize: 64,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums'
                }}
            >
                {String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0')}
            </div>

            <div
                aria-hidden="true"
                style={{ width: '100%', height: 6, borderRadius: 999, background: 'rgba(255,255,255,.2)', overflow: 'hidden' }}
            >
                <div
                    style={{
                        width: progress + '%',
                        height: '100%',
                        borderRadius: 999,
                        background: '#fff',
                        transition: 'width .3s linear'
                    }}
                />
            </div>

            <span
                style={{
                    maxWidth: '100%',
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: 'rgba(255,255,255,.92)'
                }}
            >
                {label}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%' }}>
                <button aria-label="Reiniciar timer" title="Reiniciar timer" onClick={app.reset} style={ROUND_BUTTON}>
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={ICON}>
                        <path d="M3 12a9 9 0 1 0 3-6.7" />
                        <polyline points="3 4 3 9 8 9" />
                    </svg>
                </button>
                <button
                    onClick={app.toggle}
                    style={{
                        flex: '1 1 auto',
                        minWidth: 120,
                        maxWidth: 180,
                        height: 48,
                        padding: '0 16px',
                        borderRadius: 999,
                        background: '#fff',
                        color: th.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        font: "700 18px 'Bricolage Grotesque',sans-serif",
                        transition: 'color .9s ease'
                    }}
                >
                    {s.running ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: 'currentColor' }}>
                            <rect x="6" y="4" width="4.5" height="16" rx="1.2" />
                            <rect x="13.5" y="4" width="4.5" height="16" rx="1.2" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: 'currentColor' }}>
                            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
                        </svg>
                    )}
                    {s.running ? 'Pausar' : full ? 'Iniciar' : 'Continuar'}
                </button>
                <button
                    aria-label={'Pular para ' + nextName}
                    title={'Pular para ' + nextName}
                    onClick={app.skip}
                    style={ROUND_BUTTON}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={ICON}>
                        <path d="M5 5v14l10-7z" style={{ fill: 'currentColor' }} />
                        <line x1="19" y1="5" x2="19" y2="19" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default MiniTimer
