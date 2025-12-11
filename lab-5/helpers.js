// Generowanie koloru
export function randomHsl() {
    return `hsl(${Math.floor(Math.random() * 360)}, 90%, 70%)`;
}

// Generowanie ID dla kształtów
export function generateId() {
    return 'card-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}
