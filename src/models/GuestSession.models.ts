import { ObjectId } from 'mongodb'

interface GuestSessionType {
  _id?: ObjectId
  guest_id: ObjectId
  table_id: ObjectId
  refresh_token: string
  refresh_token_exp: Date
  created_at?: Date
  updated_at?: Date
}

export default class GuestSession {
  _id?: ObjectId
  guest_id: ObjectId
  table_id: ObjectId
  refresh_token: string
  refresh_token_exp: Date
  created_at: Date
  updated_at: Date

  constructor({ _id, guest_id, table_id, refresh_token, refresh_token_exp, created_at, updated_at }: GuestSessionType) {
    const date = new Date()
    this._id = _id
    this.guest_id = guest_id
    this.table_id = table_id
    this.refresh_token = refresh_token
    this.refresh_token_exp = refresh_token_exp
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
