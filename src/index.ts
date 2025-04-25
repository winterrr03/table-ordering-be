import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import http from 'http'
import envConfig from './config'
import databaseService from '~/services/database.services'
import authRouter from '~/routes/auth.routes'
import { errorHandler } from '~/middlewares/errorHandler'
import accountRouter from '~/routes/accounts.routes'
import mediaRouter from '~/routes/medias.routes'
import { initFolder } from '~/utils/files'
import dishRouter from '~/routes/dishes.routes'
import tableRouter from '~/routes/tables.routes'
import guestRouter from '~/routes/guests.routes'
import orderRouter from '~/routes/orders.routes'
import { setupSocketIO } from '~/socket/server'
import indicatorRouter from '~/routes/indicators.routes'

const app = express()
const server = http.createServer(app)
const port = envConfig.PORT

databaseService.connect().then(() => {
  databaseService.indexRefreshToken()
})

initFolder()

app.use(cors())
app.use(express.json())

app.use('/auth', authRouter)
app.use('/accounts', accountRouter)
app.use('/dishes', dishRouter)
app.use('/tables', tableRouter)
app.use('/guests', guestRouter)
app.use('/orders', orderRouter)
app.use('/indicators', indicatorRouter)
app.use('/media', mediaRouter)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next)
})

setupSocketIO(server).then((io) => {
  app.set('io', io)
})

server.listen(port, () => {
  console.log(`App is running on port ${port}`)
})
