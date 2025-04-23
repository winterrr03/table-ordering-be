import { MongoClient, Db, Collection } from 'mongodb'
import envConfig from '~/config'
import Account from '~/models/Account.models'
import Dish from '~/models/Dish.models'
import DishSnapshot from '~/models/DishSnapshot.models'
import Guest from '~/models/Guest.models'
import GuestSession from '~/models/GuestSession.models'
import Order from '~/models/Order.models'
import RefreshToken from '~/models/RefreshToken.models'
import Socket from '~/models/Socket.models'
import Table from '~/models/Table.models'

const uri = `mongodb+srv://${envConfig.DB_USERNAME}:${envConfig.DB_PASSWORD}@cluster0.e3vxaey.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private _client: MongoClient
  private db: Db
  constructor() {
    this._client = new MongoClient(uri)
    this.db = this.client.db(envConfig.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error', error)
      throw error
    }
  }

  async indexRefreshToken() {
    const exists = await this.refresh_tokens.indexExists('expires_at_1')

    if (!exists) {
      await this.refresh_tokens.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
    }
  }

  get client(): MongoClient {
    return this._client
  }

  get accounts(): Collection<Account> {
    return this.db.collection(envConfig.DB_ACCOUNTS_COLLECTION)
  }

  get refresh_tokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.DB_REFRESH_TOKENS_COLLECTION)
  }

  get dishes(): Collection<Dish> {
    return this.db.collection(envConfig.DB_DISHES_COLLECTION)
  }

  get tables(): Collection<Table> {
    return this.db.collection(envConfig.DB_TABLES_COLLECTION)
  }

  get guests(): Collection<Guest> {
    return this.db.collection(envConfig.DB_GUESTS_COLLECTION)
  }

  get guest_sessions(): Collection<GuestSession> {
    return this.db.collection(envConfig.DB_GUEST_SESSIONS_COLLECTION)
  }

  get dish_snapshots(): Collection<DishSnapshot> {
    return this.db.collection(envConfig.DB_DISH_SNAPSHOTS_COLLECTION)
  }

  get orders(): Collection<Order> {
    return this.db.collection(envConfig.DB_ORDERS_COLLECTION)
  }

  get sockets(): Collection<Socket> {
    return this.db.collection(envConfig.DB_SOCKETS_COLLECTION)
  }
}

const databaseService = new DatabaseService()
export default databaseService
