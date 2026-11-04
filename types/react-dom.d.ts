// The project does not ship @types/react-dom; this declares the one function used (createPortal)
// so the Picture-in-Picture window can render React content without adding a dependency.
declare module 'react-dom' {
    import type { ReactNode, ReactPortal } from 'react'
    export function createPortal(children: ReactNode, container: Element): ReactPortal
}
