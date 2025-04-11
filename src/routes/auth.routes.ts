import { Router } from 'express'
import { validate } from '~/middlewares/validate'
import { LoginBody } from '~/validations/auth.validations'
import * as controller from '~/controllers/auth.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const authRouter = Router()

/**
 * Description. Login
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
authRouter.post('/login', validate({ body: LoginBody }), wrapRequestHandler(controller.loginController))

export default authRouter
