import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  account_id: ObjectId
  expires_at: Date
  created_at?: Date
}

export default class RefreshToken {
  _id?: ObjectId
  token: string
  account_id: ObjectId
  expires_at: Date
  created_at: Date

  constructor({ _id, token, account_id, expires_at, created_at }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.account_id = account_id
    this.expires_at = expires_at
    this.created_at = created_at || new Date()
  }
}
