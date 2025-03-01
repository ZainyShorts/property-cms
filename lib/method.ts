export function formatDate(isoString : any) {
    return new Date(isoString).toISOString().split('T')[0];
}