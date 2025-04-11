import { ObjectId } from 'mongodb'
import { RoleType } from '~/types/jwt.types'

interface AccountType {
  _id?: ObjectId
  name: string
  email: string
  password: string
  avatar?: string
  role: RoleType
  created_at?: Date
  updated_at?: Date
}

export default class Account {
  _id?: ObjectId
  name: string
  email: string
  password: string
  avatar: string
  role: RoleType
  created_at: Date
  updated_at: Date

  constructor({ _id, name, email, password, avatar, role, created_at, updated_at }: AccountType) {
    const date = new Date()
    this._id = _id
    this.name = name
    this.email = email
    this.password = password
    this.avatar = avatar || ''
    this.role = role
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
