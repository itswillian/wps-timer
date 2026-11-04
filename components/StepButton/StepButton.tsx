import React from 'react'

interface StepButtonProps {
    kind: 'minus' | 'plus'
    label: string
    onClick: () => void
    type?: 'button' | 'submit'
}

// Round 44px "−" / "+" button used by every stepper in the app.
const StepButton: React.FC<StepButtonProps> = ({ kind, label, onClick, type = 'button' }) => (
    <button
        type={type}
        aria-label={label}
        onClick={onClick}
        style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '2px solid #7C869A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round' }}
        >
            <line x1="5" y1="12" x2="19" y2="12" />
            {kind === 'plus' && <line x1="12" y1="5" x2="12" y2="19" />}
        </svg>
    </button>
)

export default StepButton
