export function escapeHTML(str) {
    return str.replace(/[&<>'"/]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;',
            '/': '&#x2F;'
        }[tag]));
}
