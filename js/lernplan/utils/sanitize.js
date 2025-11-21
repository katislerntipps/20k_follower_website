export function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');
}

export function sanitizeChoice(value, allowedValues, fallback = '') {
    return allowedValues.includes(value) ? value : fallback;
}

export function sanitizeEmail(email) {
    const trimmed = String(email ?? '').trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(trimmed) ? trimmed : '';
}
