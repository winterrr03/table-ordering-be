import fs from 'fs'
import path from 'path'
import z from 'zod'
import { config } from 'dotenv'

config({
  path: '.env'
})

const checkEnv = async () => {
  const chalk = (await import('chalk')).default
  if (!fs.existsSync(path.resolve('.env'))) {
    console.log(chalk.red(`Không tìm thấy file môi trường .env`))
    process.exit(1)
  }
}
checkEnv()

const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DOMAIN: z.string(),
  PROTOCOL: z.string(),
  DB_NAME: z.string(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_ACCOUNTS_COLLECTION: z.string(),
  DB_REFRESH_TOKENS_COLLECTION: z.string(),
  DB_DISHES_COLLECTION: z.string(),
  DB_TABLES_COLLECTION: z.string(),
  DB_GUESTS_COLLECTION: z.string(),
  DB_GUEST_SESSIONS_COLLECTION: z.string(),
  DB_DISH_SNAPSHOTS_COLLECTION: z.string(),
  DB_ORDERS_COLLECTION: z.string(),
  DB_SOCKETS_COLLECTION: z.string(),
  DB_ABSA_RESULTS_COLLECTION: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  GUEST_ACCESS_TOKEN_EXPIRES_IN: z.string(),
  GUEST_REFRESH_TOKEN_EXPIRES_IN: z.string(),
  SERVER_TIMEZONE: z.string(),
  CLIENT_URL: z.string(),
  PRODUCTION: z.enum(['true', 'false']).transform((val) => val === 'true'),
  PRODUCTION_URL: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  S3_BUCKET_NAME: z.string(),
  AVATAR_DEFAULT: z.string(),
  PAYOS_CLIENT_ID: z.string(),
  PAYOS_API_KEY: z.string(),
  PAYOS_CHECKSUM_KEY: z.string(),
  GOOGLE_REDIRECT_CLIENT_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_AUTHORIZED_REDIRECT_URI: z.string()
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error(configServer.error.issues)
  throw new Error('Các giá trị khai báo trong file .env không hợp lệ')
}

const envConfig = configServer.data
export const API_URL = envConfig.PRODUCTION
  ? envConfig.PRODUCTION_URL
  : `${envConfig.PROTOCOL}://${envConfig.DOMAIN}:${envConfig.PORT}`
export default envConfig

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof configSchema> {}
  }
}
