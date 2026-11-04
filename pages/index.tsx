import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react'
import Header from '../components/Header/Header'
import NavBar from '../components/NavBar/NavBar'
import SettingsDialog from '../components/SettingsDialog/SettingsDialog'
import TasksCard from '../components/TasksCard/TasksCard'
import TimerPanel from '../components/TimerPanel/TimerPanel'
import TodayCard from '../components/TodayCard/TodayCard'
import Toast from '../components/Toast/Toast'
import { pad, THEMES } from '../lib/pomodoro'
import { useWpsTimer } from '../lib/useWpsTimer'

const Home: NextPage = () => {
    const app = useWpsTimer()
    const { state: s, th } = app
    // The app name always comes first. Idle: "WPS Timer · Pomodoro". Running or paused: time left and current mode.
    const idle = !s.running && s.remaining >= s.runTotal
    const time = `${pad(Math.floor(s.remaining / 60))}:${pad(s.remaining % 60)}`
    const title = idle ? 'WPS Timer · Pomodoro' : `WPS Timer · ${time} ${THEMES[s.mode].label}`

    // Keeps the area behind the page (overscroll, safe areas) in the same color as the theme.
    useEffect(() => {
        document.body.style.background = th.bg
    }, [th.bg])

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta
                    name="description"
                    content="Timer Pomodoro com tarefas, estatísticas do dia e alertas sonoros e por notificação."
                />
            </Head>
            <div
                className="shell"
                style={{
                    boxSizing: 'border-box',
                    background: th.bg,
                    color: '#fff',
                    fontFamily: "'Instrument Sans',system-ui,sans-serif",
                    fontSize: 16,
                    transition: 'background .9s ease'
                }}
            >
                <Header bg={th.bg} onOpenSettings={app.openSettings} />
                <main className="main">
                    <TimerPanel app={app} />
                    <div className={'col-right ' + (s.view === 'timer' ? 'nv-hide' : '')}>
                        <TasksCard app={app} />
                        <TodayCard app={app} />
                    </div>
                </main>
                <NavBar view={s.view} bg={th.bg} onChange={app.setView} />
                <SettingsDialog app={app} />
                <Toast message={s.toast} />
            </div>
        </>
    )
}

export default Home
