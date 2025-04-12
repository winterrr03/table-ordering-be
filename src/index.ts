import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import envConfig from './config'
import databaseService from '~/services/database.services'
import authRouter from '~/routes/auth.routes'
import { errorHandler } from '~/middlewares/errorHandler'
import accountRouter from '~/routes/accounts.routes'

const app = express()
const port = envConfig.PORT

databaseService.connect()

app.use(cors())
app.use(express.json())

app.use('/auth', authRouter)
app.use('/accounts', accountRouter)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next)
})

app.listen(port, () => {
  console.log(`App is running on port ${port}`)
})
