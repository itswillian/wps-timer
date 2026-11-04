import React, { CSSProperties } from 'react'
import type { View } from '../../lib/pomodoro'

interface NavBarProps {
    view: View
    bg: string
    onChange: (v: View) => void
}

const ICON: CSSProperties = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
}

const ITEMS: { id: View; label: string }[] = [
    { id: 'timer', label: 'Timer' },
    { id: 'tasks', label: 'Tarefas' },
    { id: 'today', label: 'Hoje' }
]

// Bottom navigation, only displayed below 1000px (see .navbar in globals.css).
const NavBar: React.FC<NavBarProps> = ({ view, bg, onChange }) => (
    <nav className="navbar" aria-label="Seções do app" style={{ flex: 'none' }}>
        {ITEMS.map(({ id, label }) => (
            <button
                key={id}
                aria-pressed={view === id}
                onClick={() => onChange(id)}
                style={{
                    minHeight: 52,
                    borderRadius: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    fontSize: 13,
                    fontWeight: 600,
                    background: view === id ? '#fff' : 'transparent',
                    color: view === id ? bg : '#fff',
                    transition: 'background .2s ease'
                }}
            >
                {id === 'timer' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={ICON}>
                        <circle cx="12" cy="13" r="8" />
                        <polyline points="12 9 12 13 15 15" />
                        <line x1="9" y1="2.5" x2="15" y2="2.5" />
                    </svg>
                )}
                {id === 'tasks' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={ICON}>
                        <polyline points="4 6.5 6 8.5 9.5 4.5" />
                        <line x1="13" y1="6.5" x2="20" y2="6.5" />
                        <polyline points="4 15.5 6 17.5 9.5 13.5" />
                        <line x1="13" y1="15.5" x2="20" y2="15.5" />
                    </svg>
                )}
                {id === 'today' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={ICON}>
                        <line x1="6" y1="20" x2="6" y2="13" />
                        <line x1="12" y1="20" x2="12" y2="5" />
                        <line x1="18" y1="20" x2="18" y2="9" />
                    </svg>
                )}
                {label}
            </button>
        ))}
    </nav>
)

export default NavBar
