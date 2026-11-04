import React from 'react'
import { INK } from '../../lib/pomodoro'

interface ToastProps {
    message: string
    undo: boolean
    onUndo: () => void
}

const Toast: React.FC<ToastProps> = ({ message, undo, onUndo }) => (
    <div
        className="toast-wrap"
        role="status"
        aria-live="polite"
        style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 24,
            zIndex: 60,
            display: 'flex',
            justifyContent: 'center',
            padding: '0 16px',
            boxSizing: 'border-box',
            pointerEvents: 'none'
        }}
    >
        {message !== '' && (
            <div
                style={{
                    pointerEvents: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px 16px',
                    background: INK,
                    color: '#fff',
                    padding: 8,
                    borderRadius: 16,
                    boxShadow: '0 12px 32px rgba(0,0,0,.35)',
                    fontWeight: 500,
                    fontSize: 15,
                    lineHeight: 1.4,
                    maxWidth: 460,
                    minHeight: 44,
                    boxSizing: 'border-box'
                }}
            >
                <span style={{ padding: '6px 12px', textAlign: 'center', minWidth: 0, overflowWrap: 'anywhere' }}>{message}</span>
                {undo && (
                    <button
                        id="undo-btn"
                        onClick={onUndo}
                        style={{
                            flex: 'none',
                            minHeight: 44,
                            padding: '0 16px',
                            borderRadius: 12,
                            background: 'rgba(255,255,255,.12)',
                            color: '#FFC857',
                            fontWeight: 700,
                            fontSize: 15
                        }}
                    >
                        Desfazer
                    </button>
                )}
            </div>
        )}
    </div>
)

export default Toast
