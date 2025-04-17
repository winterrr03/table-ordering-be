import { ObjectId } from 'mongodb'

interface GuestType {
  _id?: ObjectId
  phone: string
  score?: number
  created_at?: Date
  updated_at?: Date
}

export default class Guest {
  _id?: ObjectId
  phone: string
  score: number
  created_at: Date
  updated_at: Date

  constructor({ _id, phone, score, created_at, updated_at }: GuestType) {
    const date = new Date()
    this._id = _id
    this.phone = phone
    this.score = score || 0
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
