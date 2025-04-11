import { ObjectId } from 'mongodb'
import { Role, TokenType } from '~/constants/types'

export type TokenTypeValue = (typeof TokenType)[keyof typeof TokenType]
export type RoleType = (typeof Role)[keyof typeof Role]
export interface TokenPayload {
  userId: ObjectId
  role: RoleType
  tokenType: TokenTypeValue
  exp: number
  iat: number
}

export interface TableTokenPayload {
  iat: number
  number: number
  tokenType: (typeof TokenType)['TableToken']
}
