import express, { Request, Response } from 'express'
import cors from 'cors'
import envConfig from './config'

const app = express()
const port = envConfig.PORT

app.use(cors())
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Table Ordering Backend')
})

app.listen(port, () => {
  console.log(`App is running on port ${port}`)
})
