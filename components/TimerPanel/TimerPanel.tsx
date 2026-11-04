import React, { CSSProperties } from 'react'
import { MODES, THEMES } from '../../lib/pomodoro'
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
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'rgba(0,0,0,.16)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const digit = (width: string): CSSProperties => ({ display: 'inline-block', width, textAlign: 'center' })

const TimerPanel: React.FC<{ app: WpsTimer }> = ({ app }) => {
    const { state: s, th } = app
    const total = s.runTotal
    const rem = s.remaining
    const mm = Math.floor(rem / 60)
    const ss = rem % 60
    const circ = 2 * Math.PI * 180
    const dash = circ * (1 - rem / total)
    const full = rem >= total
    const N = s.settings.cycle
    const selTask = s.tasks.find((t) => t.id === s.selected)
    const chipHasCount = s.mode === 'focus' && !!selTask && !selTask.complete
    const nextName = s.mode === 'focus' ? 'a pausa curta (este foco não conta)' : 'o foco'

    const cycleText =
        s.mode === 'focus'
            ? 'Foco ' + Math.min(s.focusCount + 1, N) + ' de ' + N
            : s.mode === 'short'
            ? 'Pausa curta · ' + s.focusCount + ' de ' + N + ' focos feitos'
            : 'Pausa longa · descanse mais'

    const centerLabel =
        s.mode === 'focus'
            ? selTask && !selTask.complete
                ? selTask.title
                : 'Sem tarefa em foco'
            : s.mode === 'short'
            ? 'Respire fundo'
            : 'Levante e se alongue'

    const timeLabel =
        mm + (mm === 1 ? ' minuto e ' : ' minutos e ') + ss + (ss === 1 ? ' segundo restante' : ' segundos restantes')

    return (
        <section
            aria-label="Timer"
            className={'col-left ' + (s.view === 'timer' ? '' : 'nv-hide')}
        >
            <div
                role="group"
                aria-label="Modo do timer"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                    gap: 6,
                    padding: 6,
                    borderRadius: 999,
                    background: 'rgba(0,0,0,.14)',
                    width: '100%',
                    maxWidth: 'var(--w,440px)',
                    boxSizing: 'border-box'
                }}
            >
                {MODES.map((id) => (
                    <button
                        key={id}
                        aria-pressed={s.mode === id}
                        onClick={() => app.selectMode(id)}
                        style={{
                            minHeight: 44,
                            padding: '0 8px',
                            borderRadius: 999,
                            fontWeight: 600,
                            fontSize: 15,
                            background: s.mode === id ? '#fff' : 'transparent',
                            color: s.mode === id ? th.bg : '#fff',
                            transition: 'background .2s ease'
                        }}
                    >
                        {THEMES[id].label}
                    </button>
                ))}
            </div>

            <div
                style={
                    {
                        position: 'relative',
                        flex: 'none',
                        width: 'min(var(--w,440px),100%,max(240px,calc(100dvh - 416px)))',
                        aspectRatio: '1/1',
                        containerType: 'inline-size'
                    } as CSSProperties
                }
            >
                <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true" style={{ display: 'block' }}>
                    <circle
                        cx="200"
                        cy="200"
                        r="180"
                        style={{ fill: 'none', stroke: 'rgba(255,255,255,.18)', strokeWidth: 9 }}
                    />
                    <circle
                        cx="200"
                        cy="200"
                        r="180"
                        style={
                            {
                                fill: 'none',
                                stroke: '#fff',
                                strokeWidth: 9,
                                strokeLinecap: 'round',
                                strokeDasharray: circ.toFixed(2),
                                strokeDashoffset: dash.toFixed(2),
                                transform: 'rotate(-90deg)',
                                transformBox: 'fill-box',
                                transformOrigin: 'center',
                                transition: 'stroke-dashoffset .3s linear'
                            } as CSSProperties
                        }
                    />
                </svg>
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2cqw',
                        textAlign: 'center'
                    }}
                >
                    <div
                        role="timer"
                        aria-label={timeLabel}
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            fontFamily: "'Bricolage Grotesque',sans-serif",
                            fontWeight: 600,
                            fontSize: '21cqw',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                            fontVariantNumeric: 'tabular-nums'
                        }}
                    >
                        <span style={digit('.6em')}>{Math.floor(mm / 10)}</span>
                        <span style={digit('.6em')}>{mm % 10}</span>
                        <span style={{ ...digit('.3em'), transform: 'translateY(-.06em)' }}>:</span>
                        <span style={digit('.6em')}>{Math.floor(ss / 10)}</span>
                        <span style={digit('.6em')}>{ss % 10}</span>
                    </div>
                    <span
                        style={{
                            padding: '4px 14px',
                            borderRadius: 999,
                            background: 'rgba(0,0,0,.16)',
                            fontWeight: 600,
                            fontSize: 'max(13px,3.4cqw)'
                        }}
                    >
                        {s.running ? 'Em andamento' : full ? 'Pronto para começar' : 'Pausado'}
                    </span>
                </div>
            </div>

            <div
                aria-live="polite"
                style={{
                    width: '100%',
                    maxWidth: 'var(--w,440px)',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 8px 8px 16px',
                    borderRadius: 16,
                    background: 'rgba(0,0,0,.14)',
                    animation: (s.animTick % 2 ? 'chipA' : 'chipB') + ' .45s cubic-bezier(.2,.8,.2,1)'
                }}
            >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '.06em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,.75)'
                        }}
                    >
                        {s.mode === 'focus' ? 'Tarefa em foco' : 'Hora do descanso'}
                    </span>
                    <span
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {centerLabel}
                    </span>
                </div>
                {chipHasCount && selTask && (
                    <span
                        style={{
                            flex: 'none',
                            padding: '4px 12px',
                            borderRadius: 999,
                            background: 'rgba(255,255,255,.2)',
                            font: "700 15px 'Bricolage Grotesque',sans-serif"
                        }}
                    >
                        {selTask.done + '/' + selTask.est}
                    </span>
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    width: '100%',
                    maxWidth: 'var(--w,440px)'
                }}
            >
                <button aria-label="Reiniciar timer" title="Reiniciar timer" onClick={app.reset} style={ROUND_BUTTON}>
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={ICON}>
                        <path d="M3 12a9 9 0 1 0 3-6.7" />
                        <polyline points="3 4 3 9 8 9" />
                    </svg>
                </button>
                <button
                    className="btn-primary"
                    onClick={app.toggle}
                    style={{
                        flex: '1 1 auto',
                        minWidth: 140,
                        maxWidth: 220,
                        height: 64,
                        padding: '0 20px',
                        borderRadius: 999,
                        background: '#fff',
                        color: th.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        font: "700 21px 'Bricolage Grotesque',sans-serif",
                        transition: 'color .9s ease'
                    }}
                >
                    {s.running ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: 'currentColor' }}>
                            <rect x="6" y="4" width="4.5" height="16" rx="1.2" />
                            <rect x="13.5" y="4" width="4.5" height="16" rx="1.2" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: 'currentColor' }}>
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
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={ICON}>
                        <path d="M5 5v14l10-7z" style={{ fill: 'currentColor' }} />
                        <line x1="19" y1="5" x2="19" y2="19" />
                    </svg>
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10 }} aria-hidden="true">
                    {Array.from({ length: N }, (_, i) => (
                        <span
                            key={i}
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                border: '2px solid #fff',
                                boxSizing: 'border-box',
                                background: i < s.focusCount ? '#fff' : 'transparent'
                            }}
                        />
                    ))}
                </div>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,.92)' }}>{cycleText}</span>
            </div>
        </section>
    )
}

export default TimerPanel
