import { ObjectId } from 'mongodb'

interface SocketType {
  _id?: ObjectId
  socket_id: string
  account_id?: string
  guest_id?: string
}

export default class Socket {
  _id?: ObjectId
  socket_id: string
  account_id: string
  guest_id: string

  constructor({ _id, socket_id, account_id, guest_id }: SocketType) {
    this._id = _id
    this.socket_id = socket_id
    this.account_id = account_id || ''
    this.guest_id = guest_id || ''
  }
}
