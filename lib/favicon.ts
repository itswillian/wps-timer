// Same logo as public/favicon.svg (the ring and dot from the page header), painted in the current theme color.
const faviconSvg = (color: string) =>
    '<svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    `<rect width="32" height="32" rx="8" fill="${color}"/>` +
    '<g transform="translate(16 16) scale(0.86) translate(-16 -16)">' +
    '<circle cx="16" cy="16" r="12" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="56 100" transform="rotate(-90 16 16)"/>' +
    '<circle cx="16" cy="16" r="3" fill="#fff"/>' +
    '</g></svg>'

export const faviconHref = (color: string) => 'data:image/svg+xml,' + encodeURIComponent(faviconSvg(color))
