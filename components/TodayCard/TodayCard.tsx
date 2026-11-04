import React from 'react'
import { dateKey, fmtMin, INK, WEEKDAYS } from '../../lib/pomodoro'
import type { WpsTimer } from '../../lib/useWpsTimer'

const DAY_MS = 24 * 60 * 60 * 1000
const NBSP = ' '

const TodayCard: React.FC<{ app: WpsTimer }> = ({ app }) => {
    const { state: s, th, now } = app

    // Last 7 days, oldest first; the last bar is today. Before the first client render only placeholders are shown.
    const days = Array.from({ length: 7 }, (_, i) => {
        if (now == null) return { label: NBSP, min: 0, pomos: 0 }
        const d = new Date(now - (6 - i) * DAY_MS)
        const stat = s.days[dateKey(d)] || { min: 0, pomos: 0 }
        return { label: i === 6 ? 'Hoje' : WEEKDAYS[d.getDay()], min: stat.min, pomos: stat.pomos }
    })
    const today = days[6]
    const max = Math.max(150, ...days.map((d) => d.min))
    const chartLabel =
        'Minutos de foco nos últimos 7 dias: ' + days.map((d) => d.label + ' ' + d.min).join(', ') + '.'

    return (
        <section
            className={'panel card-today ' + (s.view === 'tasks' ? 'nv-hide' : '')}
            aria-labelledby="today-title"
            style={{
                background: '#FCFAF8',
                color: INK,
                borderRadius: 24,
                padding: 20,
                boxShadow: '0 14px 36px rgba(20,10,8,.20),0 2px 4px rgba(20,10,8,.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                flexWrap: 'wrap'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 'none' }}>
                <h2 id="today-title" style={{ margin: 0, font: "700 22px 'Bricolage Grotesque',sans-serif" }}>
                    Hoje
                </h2>
                <span style={{ font: "700 36px/1.1 'Bricolage Grotesque',sans-serif", letterSpacing: '-0.02em' }}>
                    {fmtMin(today.min)}
                </span>
                <span style={{ fontSize: 14, color: '#5B6475' }}>
                    {today.pomos + (today.pomos === 1 ? ' pomodoro concluído' : ' pomodoros concluídos')}
                </span>
            </div>
            <div
                role="img"
                className="chart-bars"
                aria-label={chartLabel}
                style={{
                    // 210px basis (150px in the mockup): below that the seven day labels overlap on narrow phones,
                    // so the chart wraps to its own row instead of being squeezed beside the total.
                    flex: '1 1 210px',
                    minWidth: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7,minmax(0,1fr))',
                    gap: 6,
                    alignItems: 'end',
                    alignSelf: 'stretch',
                    minHeight: 92
                }}
            >
                {days.map((b, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 6,
                            height: '100%'
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                minHeight: 0,
                                width: '100%',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center'
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    maxWidth: 28,
                                    height: Math.round((b.min / max) * 100) + '%',
                                    minHeight: 4,
                                    borderRadius: 8,
                                    background: i === 6 ? th.bg : '#AEB6C6',
                                    transition: 'height .3s ease'
                                }}
                            />
                        </div>
                        <span style={{ fontSize: 12, color: '#5B6475', fontWeight: i === 6 ? 700 : 400 }}>{b.label}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default TodayCard
