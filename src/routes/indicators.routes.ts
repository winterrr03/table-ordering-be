import { Router } from 'express'
import { requireLogin, requireOneOfRoles } from '~/middlewares/auth'
import * as controller from '~/controllers/indicators.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/middlewares/validate'
import { Role } from '~/constants/types'
import { DashboardIndicatorQueryParams } from '~/validations/indicators.validations'

const indicatorRouter = Router()

/**
 * Description. Get indicator
 * Path: /dashboard
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { fromDate: Date, toDate: Date }
 */
indicatorRouter.get(
  '/dashboard',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ query: DashboardIndicatorQueryParams }),
  wrapRequestHandler(controller.dashboardIndicatorController)
)

export default indicatorRouter
