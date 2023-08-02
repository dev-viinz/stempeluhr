export const getTodayFormatted = () => {
    const date = new Date().toISOString();
    return date.substring(0, date.indexOf('T'));
}