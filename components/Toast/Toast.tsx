import React from 'react'
import { INK } from '../../lib/pomodoro'

const Toast: React.FC<{ message: string }> = ({ message }) => (
    <div
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
                    background: INK,
                    color: '#fff',
                    padding: '14px 20px',
                    borderRadius: 14,
                    fontWeight: 500,
                    fontSize: 15,
                    lineHeight: 1.4,
                    maxWidth: 420
                }}
            >
                {message}
            </div>
        )}
    </div>
)

export default Toast
