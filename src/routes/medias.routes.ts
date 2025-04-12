import { Router } from 'express'
import { Role } from '~/constants/types'
import * as controller from '~/controllers/medias.controllers'
import { requireLogin, requireOneOfRoles } from '~/middlewares/auth'
import { wrapRequestHandler } from '~/utils/handlers'

const mediaRouter = Router()

/**
 * Description. Upload image
 * Path: /upload
 * Method: post
 * Header: { Authorization: Bearer <access_token> }
 */
mediaRouter.post(
  '/upload',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  wrapRequestHandler(controller.uploadImageController)
)

export default mediaRouter
