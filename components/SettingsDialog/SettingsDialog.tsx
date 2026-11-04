import React, { CSSProperties } from 'react'
import { INK, SOUNDS } from '../../lib/pomodoro'
import type { WpsTimer } from '../../lib/useWpsTimer'
import StepButton from '../StepButton/StepButton'

const SECTION_TITLE: CSSProperties = { margin: 0, font: "700 16px 'Bricolage Grotesque',sans-serif" }

const NOTIF_TEXT = {
    on: 'Ativadas. Avisamos quando o tempo acabar, com a aba aberta em segundo plano.',
    off: 'Desativadas. O navegador só pede permissão depois que você ativar.',
    blocked: 'Bloqueadas pelo navegador. Libere as notificações nas permissões do site.',
    unsupported: 'Este navegador não permite notificações.'
}

const STEP_ROWS = [
    { key: 'focus', label: 'Foco', unit: ' min' },
    { key: 'short', label: 'Pausa curta', unit: ' min' },
    { key: 'long', label: 'Pausa longa', unit: ' min' },
    { key: 'cycle', label: 'Focos até a pausa longa', unit: ' focos' }
] as const

const TOGGLE_ROWS = [
    { key: 'autoBreak', label: 'Iniciar pausas automaticamente' },
    { key: 'autoFocus', label: 'Iniciar focos automaticamente' }
] as const

const SettingsDialog: React.FC<{ app: WpsTimer }> = ({ app }) => {
    const { state: s, th } = app
    if (!s.showSettings) return null
    const st = s.settings
    const unavailable = s.notif === 'blocked' || s.notif === 'unsupported'

    return (
        <div
            onKeyDown={app.onDialogKey}
            onMouseDown={app.keepFocus}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                boxSizing: 'border-box',
                background: 'rgba(18,22,34,.6)'
            }}
        >
            <div
                className="panel dlg"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cfg-title"
                tabIndex={-1}
                style={{
                    outline: 'none',
                    background: '#FCFAF8',
                    color: INK,
                    borderRadius: 28,
                    padding: 28,
                    boxShadow: '0 24px 70px rgba(10,6,20,.45)',
                    width: '100%',
                    maxWidth: 480,
                    maxHeight: '100%',
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 22
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <h2 id="cfg-title" style={{ margin: 0, font: "700 24px 'Bricolage Grotesque',sans-serif" }}>
                        Configurações
                    </h2>
                    <button
                        ref={app.closeButton}
                        aria-label="Fechar configurações"
                        autoFocus
                        onClick={app.closeSettings}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: '#EEF1F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round' }}
                        >
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                        </svg>
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h3 style={SECTION_TITLE}>Duração</h3>
                    {STEP_ROWS.map((r) => (
                        <div
                            key={r.key}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
                        >
                            <span style={{ fontWeight: 500, fontSize: 16 }}>{r.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <StepButton
                                    kind="minus"
                                    label={'Diminuir ' + r.label.toLowerCase()}
                                    onClick={() => app.adjust(r.key, -1)}
                                />
                                <span
                                    style={{
                                        minWidth: 72,
                                        textAlign: 'center',
                                        font: "700 18px 'Bricolage Grotesque',sans-serif"
                                    }}
                                >
                                    {st[r.key] + r.unit}
                                </span>
                                <StepButton
                                    kind="plus"
                                    label={'Aumentar ' + r.label.toLowerCase()}
                                    onClick={() => app.adjust(r.key, 1)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h3 style={SECTION_TITLE}>Início automático</h3>
                    {TOGGLE_ROWS.map((g) => (
                        <div
                            key={g.key}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
                        >
                            <span style={{ fontWeight: 500, fontSize: 16, lineHeight: 1.3 }}>{g.label}</span>
                            <button
                                role="switch"
                                aria-checked={st[g.key]}
                                aria-label={g.label}
                                onClick={() => app.flip(g.key)}
                                style={{
                                    flex: 'none',
                                    width: 56,
                                    height: 44,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <span
                                    style={{
                                        width: 52,
                                        height: 30,
                                        borderRadius: 999,
                                        background: st[g.key] ? th.bg : '#7C869A',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 3,
                                        boxSizing: 'border-box',
                                        justifyContent: st[g.key] ? 'flex-end' : 'flex-start',
                                        transition: 'background .2s ease'
                                    }}
                                >
                                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff' }} />
                                </span>
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h3 style={SECTION_TITLE}>Som do alarme</h3>
                    <div
                        role="group"
                        aria-label="Som do alarme"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}
                    >
                        {SOUNDS.map((name) => {
                            const on = st.sound === name
                            return (
                                <button
                                    key={name}
                                    aria-pressed={on}
                                    onClick={() => app.pickSound(name)}
                                    style={{
                                        minHeight: 44,
                                        borderRadius: 12,
                                        border: '2px solid ' + (on ? th.bg : '#7C869A'),
                                        background: on ? th.bg : '#fff',
                                        color: on ? '#fff' : INK,
                                        fontWeight: 600,
                                        fontSize: 15
                                    }}
                                >
                                    {name}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <h3 style={SECTION_TITLE}>Notificações</h3>
                        <span style={{ fontSize: 14, color: '#5B6475', lineHeight: 1.4 }}>{NOTIF_TEXT[s.notif]}</span>
                    </div>
                    <button
                        aria-label={
                            s.notif === 'on'
                                ? 'Desativar notificações'
                                : s.notif === 'blocked'
                                ? 'Indisponível: notificações bloqueadas no navegador'
                                : s.notif === 'unsupported'
                                ? 'Indisponível: notificações não disponíveis neste navegador'
                                : 'Ativar notificações'
                        }
                        disabled={unavailable}
                        onClick={app.toggleNotif}
                        style={{
                            flex: 'none',
                            opacity: unavailable ? 0.5 : 1,
                            minHeight: 44,
                            padding: '0 18px',
                            borderRadius: 999,
                            border: '2px solid ' + INK,
                            fontWeight: 600,
                            fontSize: 15
                        }}
                    >
                        {s.notif === 'on' ? 'Desativar' : unavailable ? 'Indisponível' : 'Ativar'}
                    </button>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        paddingTop: 16,
                        borderTop: '1px solid #E3E7EF'
                    }}
                >
                    <span style={{ fontSize: 14, color: '#5B6475' }}>© 2026 Willian Pacheco Silva</span>
                    <a
                        href="https://itswillian.github.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            minHeight: 44,
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: INK,
                            fontWeight: 600,
                            fontSize: 15,
                            textDecoration: 'underline',
                            textUnderlineOffset: 3
                        }}
                    >
                        Ver meu portfólio
                    </a>
                </div>

                <button
                    onClick={app.closeSettings}
                    style={{
                        height: 52,
                        borderRadius: 999,
                        background: th.bg,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 17
                    }}
                >
                    Fechar
                </button>
            </div>
        </div>
    )
}

export default SettingsDialog
