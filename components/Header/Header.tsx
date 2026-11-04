import React, { CSSProperties } from 'react'

interface HeaderProps {
    bg: string
    onOpenSettings: () => void
    pip: {
        supported: boolean
        open: boolean
        onToggle: () => void
    }
}

const PILL: CSSProperties = {
    flex: 'none',
    minHeight: 44,
    padding: '0 16px',
    borderRadius: 999,
    background: 'rgba(0,0,0,.16)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontWeight: 600,
    fontSize: 15,
    lineHeight: 1,
    whiteSpace: 'nowrap'
}

const PILL_ICON: CSSProperties = {
    display: 'block',
    flex: 'none',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
}

const Header: React.FC<HeaderProps> = ({ bg, onOpenSettings, pip }) => (
    <header
        style={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            boxSizing: 'border-box',
            padding: '20px clamp(16px,4vw,32px)'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
                <circle
                    cx="16"
                    cy="16"
                    r="12"
                    style={{
                        fill: 'none',
                        stroke: '#fff',
                        strokeWidth: 4,
                        strokeLinecap: 'round',
                        strokeDasharray: '56 100',
                        transform: 'rotate(-90deg)',
                        transformOrigin: '16px 16px'
                    }}
                />
                <circle cx="16" cy="16" r="3" style={{ fill: '#fff' }} />
            </svg>
            <h1
                style={{
                    margin: 0,
                    font: "700 22px 'Bricolage Grotesque',sans-serif",
                    letterSpacing: '-0.01em'
                }}
            >
                WPS Timer
            </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pip.supported && (
                <button
                    className="pip-btn"
                    aria-label="Miniatura flutuante"
                    aria-pressed={pip.open}
                    title="Miniatura flutuante do timer"
                    onClick={pip.onToggle}
                    style={PILL}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={PILL_ICON}>
                        <rect x="3" y="5" width="18" height="14" rx="2.5" />
                        <rect x="11.5" y="11" width="7" height="5" rx="1.2" style={{ fill: 'currentColor', stroke: 'none' }} />
                    </svg>
                    <span className="btn-label" style={{ lineHeight: '20px' }}>
                        Miniatura
                    </span>
                </button>
            )}
            <button aria-label="Configurações" onClick={onOpenSettings} style={PILL}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={PILL_ICON}>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <circle cx="9" cy="7" r="2.4" style={{ fill: bg }} />
                    <line x1="4" y1="17" x2="20" y2="17" />
                    <circle cx="15" cy="17" r="2.4" style={{ fill: bg }} />
                </svg>
                <span className="btn-label" style={{ lineHeight: '20px' }}>
                    Configurações
                </span>
            </button>
        </div>
    </header>
)

export default Header
