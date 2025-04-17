import crypto from 'crypto'

export const randomId = () => crypto.randomUUID().replace(/-/g, '')

export const dateToUnixTimestamp = (date: Date = new Date()): number => {
  return Math.floor(date.getTime() / 1000)
}

export const unixTimestampToDate = (timestamp: number): Date => {
  return new Date(timestamp * 1000)
}
