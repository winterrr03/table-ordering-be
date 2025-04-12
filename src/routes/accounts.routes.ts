import { Router } from 'express'
import { requireLogin } from '~/middlewares/auth'
import * as controller from '~/controllers/accounts.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const accountRouter = Router()

/**
 * Description. Get me
 * Path: /me
 * Method: GET
 */
accountRouter.get('/me', requireLogin, wrapRequestHandler(controller.getMeController))

export default accountRouter
