import React, { CSSProperties } from 'react'
import { INK, Task } from '../../lib/pomodoro'
import type { WpsTimer } from '../../lib/useWpsTimer'
import StepButton from '../StepButton/StepButton'

const HEADING: CSSProperties = { margin: 0, font: "700 22px 'Bricolage Grotesque',sans-serif" }
const STEP_VALUE: CSSProperties = {
    minWidth: 28,
    textAlign: 'center',
    font: "700 18px 'Bricolage Grotesque',sans-serif"
}
const STEP_LABEL: CSSProperties = { fontSize: 15, fontWeight: 500, marginRight: 6 }

const TasksCard: React.FC<{ app: WpsTimer }> = ({ app }) => {
    const { state: s, th, now } = app
    const open = s.tasks.filter((t) => !t.complete)
    const left = open.reduce((a, t) => a + Math.max(t.est - t.done, 0), 0)
    const mins = left > 0 ? left * s.settings.focus + (left - 1) * s.settings.short : 0
    const endTxt =
        now == null
            ? ''
            : ' Término estimado: ' +
              new Date(now + mins * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) +
              '.'
    const estimateText =
        left > 0
            ? left + (left === 1 ? ' pomodoro restante.' : ' pomodoros restantes.') + endTxt
            : 'Nenhum pomodoro pendente.'

    const renderEditing = (t: Task) => (
        <li key={t.id} style={{ listStyle: 'none' }}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    app.saveEdit(t.id)
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        e.stopPropagation()
                        app.cancelEdit()
                    }
                }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: 10,
                    borderRadius: 14,
                    border: '2px solid ' + th.bg,
                    background: '#fff'
                }}
            >
                <input
                    type="text"
                    autoFocus
                    autoComplete="off"
                    aria-label="Editar nome da tarefa"
                    value={s.editText}
                    onChange={(e) => app.setEditText(e.target.value)}
                    style={{
                        height: 44,
                        boxSizing: 'border-box',
                        padding: '0 14px',
                        borderRadius: 12,
                        border: '2px solid #7C869A',
                        fontSize: 16,
                        color: INK,
                        background: '#fff',
                        width: '100%',
                        minWidth: 0
                    }}
                />
                {s.editError && (
                    <span role="alert" style={{ fontSize: 14, fontWeight: 500, color: '#B3261E' }}>
                        O nome não pode ficar vazio.
                    </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <span style={STEP_LABEL}>Pomodoros</span>
                    <StepButton kind="minus" label="Diminuir pomodoros estimados" onClick={() => app.stepEditEst(-1)} />
                    <span style={STEP_VALUE}>{s.editEst}</span>
                    <StepButton kind="plus" label="Aumentar pomodoros estimados" onClick={() => app.stepEditEst(1)} />
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        flexWrap: 'wrap'
                    }}
                >
                    <button
                        type="button"
                        onClick={() => app.removeTask(t)}
                        aria-label={'Excluir tarefa: ' + t.title}
                        style={{
                            minHeight: 44,
                            padding: '0 12px',
                            fontSize: 15,
                            fontWeight: 600,
                            color: '#B3261E',
                            textDecoration: 'underline'
                        }}
                    >
                        Excluir
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            type="button"
                            onClick={app.cancelEdit}
                            style={{
                                minHeight: 44,
                                padding: '0 16px',
                                borderRadius: 999,
                                border: '2px solid #7C869A',
                                fontWeight: 600,
                                fontSize: 15
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{
                                minHeight: 44,
                                padding: '0 20px',
                                borderRadius: 999,
                                background: th.bg,
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: 15
                            }}
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </form>
        </li>
    )

    const renderTask = (t: Task) => {
        const sel = t.id === s.selected && !t.complete
        return (
            <li
                key={t.id}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    padding: '0 4px 0 2px',
                    borderRadius: 14,
                    border: '2px solid ' + (sel ? th.bg : 'transparent'),
                    background: sel ? 'color-mix(in srgb, ' + th.bg + ' 8%, white)' : '#F5F7FB'
                }}
            >
                <button
                    aria-label={'Concluir tarefa: ' + t.title}
                    aria-pressed={t.complete}
                    onClick={() => app.toggleComplete(t)}
                    style={{ width: 44, height: 44, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <span
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            boxSizing: 'border-box',
                            border: '2px solid ' + (t.complete ? th.bg : '#7C869A'),
                            background: t.complete ? th.bg : 'transparent',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {t.complete && (
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                style={{
                                    fill: 'none',
                                    stroke: 'currentColor',
                                    strokeWidth: 3.2,
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round'
                                }}
                            >
                                <polyline points="5 12.5 10 17.5 19 7" />
                            </svg>
                        )}
                    </span>
                </button>
                <button
                    aria-pressed={sel}
                    onClick={() => app.selectTask(t)}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 44,
                        padding: '6px 4px',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 2
                    }}
                >
                    <span
                        style={{
                            fontWeight: 600,
                            fontSize: 16,
                            lineHeight: 1.3,
                            textDecoration: t.complete ? 'line-through' : 'none',
                            color: t.complete ? '#5B6475' : INK,
                            overflowWrap: 'anywhere'
                        }}
                    >
                        {t.title}
                    </span>
                </button>
                <span
                    style={{
                        flex: 'none',
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: '#EEF1F6',
                        font: "700 15px 'Bricolage Grotesque',sans-serif",
                        color: INK
                    }}
                >
                    {t.done + '/' + t.est}
                </span>
                <button
                    aria-label={'Editar tarefa: ' + t.title}
                    onClick={() => app.startEdit(t)}
                    style={{
                        width: 44,
                        height: 44,
                        flex: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#5B6475'
                    }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        style={{
                            fill: 'none',
                            stroke: 'currentColor',
                            strokeWidth: 2.2,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round'
                        }}
                    >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                </button>
            </li>
        )
    }

    return (
        <section
            className={'panel card-tasks ' + (s.view === 'today' ? 'nv-hide' : '')}
            aria-labelledby="tasks-title"
            style={{
                background: '#fff',
                color: INK,
                borderRadius: 20,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
            }}
        >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <h2 id="tasks-title" style={HEADING}>
                    Tarefas
                </h2>
                <span style={{ fontSize: 14, color: '#5B6475' }}>
                    {open.length + (open.length === 1 ? ' aberta' : ' abertas')}
                </span>
            </div>

            <div className="tasks-scroll">
                {s.tasks.length > 0 && (
                    <ul
                        className="tasks-list"
                        style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        }}
                    >
                        {s.tasks.map((t) => (s.editId === t.id ? renderEditing(t) : renderTask(t)))}
                    </ul>
                )}
            </div>

            {s.tasks.length === 0 && (
                <div style={{ padding: '20px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <strong style={{ font: "700 18px 'Bricolage Grotesque',sans-serif" }}>Nenhuma tarefa ainda</strong>
                    <span style={{ fontSize: 15, color: '#5B6475' }}>
                        Adicione a primeira tarefa para ver quanto tempo falta para terminar o dia.
                    </span>
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    app.addTask()
                }}
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 8,
                    paddingTop: 12,
                    borderTop: '1px solid #E3E7EF'
                }}
            >
                <label
                    htmlFor="new-task"
                    style={{
                        position: 'absolute',
                        width: 1,
                        height: 1,
                        overflow: 'hidden',
                        clip: 'rect(0 0 0 0)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Nome da tarefa
                </label>
                <input
                    id="new-task"
                    type="text"
                    autoComplete="off"
                    placeholder="O que você vai fazer agora?"
                    value={s.newText}
                    onChange={(e) => app.setNewText(e.target.value)}
                    style={{
                        height: 48,
                        boxSizing: 'border-box',
                        padding: '0 16px',
                        borderRadius: 12,
                        border: '2px solid #7C869A',
                        fontSize: 16,
                        color: INK,
                        background: '#fff',
                        flex: '1 1 100%',
                        minWidth: 0
                    }}
                />
                {s.addError && (
                    <span
                        role="alert"
                        style={{ order: 5, flex: '1 1 100%', fontSize: 14, fontWeight: 500, color: '#B3261E' }}
                    >
                        Digite o nome da tarefa para adicioná-la.
                    </span>
                )}
                <div
                    style={{
                        flex: '1 1 100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        flexWrap: 'wrap'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span style={STEP_LABEL}>Pomodoros</span>
                        <StepButton kind="minus" label="Diminuir pomodoros estimados" onClick={() => app.stepNewEst(-1)} />
                        <span style={STEP_VALUE}>{s.newEst}</span>
                        <StepButton kind="plus" label="Aumentar pomodoros estimados" onClick={() => app.stepNewEst(1)} />
                    </div>
                    <button
                        type="submit"
                        style={{
                            height: 48,
                            padding: '0 22px',
                            borderRadius: 999,
                            background: th.bg,
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 16,
                            transition: 'background .9s ease'
                        }}
                    >
                        Adicionar tarefa
                    </button>
                </div>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <p style={{ margin: 0, fontSize: 14, color: '#5B6475', lineHeight: 1.4 }}>{estimateText}</p>
                {s.tasks.some((t) => t.complete) && (
                    <button
                        onClick={app.clearDone}
                        style={{
                            minHeight: 44,
                            padding: '0 4px',
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: 'underline',
                            color: INK
                        }}
                    >
                        Limpar concluídas
                    </button>
                )}
            </div>
        </section>
    )
}

export default TasksCard
