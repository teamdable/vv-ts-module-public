export function dateWith(dateString: string, timeString: string): Date {
    return new Date(dateString + ' ' + timeString)
}

export function dateWithHourMin(date: Date, hour: number, min: number): Date {
    date.setHours(hour)
    date.setMinutes(min)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date
}

export function formatDateStringWith(date: Date): string {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${date.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
}

export function defaultDateRangeFrom(date: Date): { from: Date, to: Date } {
    const from = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0)
    const to = new Date(date.getFullYear() + 100, date.getMonth(), date.getDate(), 24, 0)
    return { from, to }
}