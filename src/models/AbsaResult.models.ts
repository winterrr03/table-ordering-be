import { ObjectId } from 'mongodb'

interface AspectType {
  aspect: string
  sentiment: 'positive' | 'neutral' | 'negative' | 'none'
  confidence: number
}

interface ABSAResultType {
  _id?: ObjectId
  text: string
  aspects: AspectType[]
  created_at?: Date
  updated_at?: Date
}

export default class ABSAResult {
  _id?: ObjectId
  text: string
  aspects: AspectType[]
  created_at: Date
  updated_at: Date

  constructor({ _id, text, aspects, created_at, updated_at }: ABSAResultType) {
    const now = new Date()
    this._id = _id
    this.text = text
    this.aspects = aspects
    this.created_at = created_at || now
    this.updated_at = updated_at || now
  }
}
