import crypto from 'crypto'

export const randomId = () => crypto.randomUUID().replace(/-/g, '')
