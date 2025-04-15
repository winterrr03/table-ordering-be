import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import envConfig from './config'
import databaseService from '~/services/database.services'
import authRouter from '~/routes/auth.routes'
import { errorHandler } from '~/middlewares/errorHandler'
import accountRouter from '~/routes/accounts.routes'
import mediaRouter from '~/routes/medias.routes'
import { initFolder } from '~/utils/files'
import dishRouter from '~/routes/dishes.routes'

const app = express()
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
app.use('/media', mediaRouter)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next)
})

app.listen(port, () => {
  console.log(`App is running on port ${port}`)
})
