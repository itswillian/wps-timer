import { useCallback, useEffect, useRef, useState } from 'react'

// Document Picture-in-Picture (Chrome/Edge 116+, desktop): an always-on-top window that holds regular HTML.
interface DocumentPiP {
    requestWindow(options?: { width?: number; height?: number }): Promise<Window>
}

export const PIP_SIZE = { width: 340, height: 250 }

function getApi(): DocumentPiP | undefined {
    return (window as unknown as { documentPictureInPicture?: DocumentPiP }).documentPictureInPicture
}

// The new window starts empty, so the page styles and fonts are copied into it.
function copyStyles(target: Document) {
    document.head.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
        if (node instanceof HTMLLinkElement) {
            const link = target.createElement('link')
            link.rel = 'stylesheet'
            link.href = node.href
            target.head.appendChild(link)
        } else {
            target.head.appendChild(node.cloneNode(true))
        }
    })
}

export function usePip() {
    const [supported, setSupported] = useState(false)
    const [win, setWin] = useState<Window | null>(null)
    const winRef = useRef<Window | null>(null)

    // Checked after mount so the server render and the first client render match.
    useEffect(() => {
        setSupported(!!getApi())
        return () => {
            if (winRef.current) winRef.current.close()
        }
    }, [])

    const open = useCallback(async () => {
        const api = getApi()
        if (!api || winRef.current) return
        try {
            const w = await api.requestWindow(PIP_SIZE)
            copyStyles(w.document)
            w.document.title = 'WPS Timer'
            w.addEventListener('pagehide', () => {
                winRef.current = null
                setWin(null)
            })
            winRef.current = w
            setWin(w)
        } catch (e) {}
    }, [])

    const toggle = useCallback(() => {
        if (winRef.current) winRef.current.close()
        else open()
    }, [open])

    return { supported, win, toggle }
}

export type Pip = ReturnType<typeof usePip>
