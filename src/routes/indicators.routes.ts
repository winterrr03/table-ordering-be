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

/**
 * Description. Get analytics
 * Path: /analytics
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
indicatorRouter.get(
  '/analytics',
  requireLogin,
  requireOneOfRoles(Role.Owner),
  wrapRequestHandler(controller.analyticsIndicatorController)
)

/**
 * Description. Get reviews
 * Path: /reviews
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
indicatorRouter.get(
  '/reviews',
  requireLogin,
  requireOneOfRoles(Role.Owner),
  wrapRequestHandler(controller.getReviewController)
)

export default indicatorRouter
