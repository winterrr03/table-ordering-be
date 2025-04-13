import { MongoClient, Db, Collection } from 'mongodb'
import envConfig from '~/config'
import Account from '~/models/Account.models'
import RefreshToken from '~/models/RefreshToken.models'

const uri = `mongodb+srv://${envConfig.DB_USERNAME}:${envConfig.DB_PASSWORD}@cluster0.e3vxaey.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
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

  get accounts(): Collection<Account> {
    return this.db.collection(envConfig.DB_ACCOUNTS_COLLECTION)
  }

  get refresh_tokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.DB_REFRESH_TOKENS_COLLECTION)
  }
}

const databaseService = new DatabaseService()
export default databaseService
