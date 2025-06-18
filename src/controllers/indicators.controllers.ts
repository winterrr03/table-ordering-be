import { Request, Response } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import indicatorService from '~/services/indicators.services'
import {
  AspectSentimentIndicatorResType,
  DashboardIndicatorQueryParamsType,
  DashboardIndicatorResType,
  reviewWithAspectsResType
} from '~/validations/indicators.validations'

export const dashboardIndicatorController = async (
  req: Request<ParamsDictionary, any, any, Query>,
  res: Response<DashboardIndicatorResType>
) => {
  const { fromDate, toDate } = req.query as unknown as DashboardIndicatorQueryParamsType
  const result = await indicatorService.dashboardIndicator(fromDate, toDate)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy các chỉ số thành công',
    data: result as DashboardIndicatorResType['data']
  })
}

export const analyticsIndicatorController = async (
  req: Request<ParamsDictionary>,
  res: Response<AspectSentimentIndicatorResType>
) => {
  const result = await indicatorService.analyticsIndicator()
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy các thống kê phân tích khía cạnh thành công',
    data: result as AspectSentimentIndicatorResType['data']
  })
}

export const getReviewController = async (req: Request<ParamsDictionary>, res: Response<reviewWithAspectsResType>) => {
  const result = await indicatorService.getReviewList()
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy các phân tích khía cạnh thành công',
    data: result as reviewWithAspectsResType['data']
  })
}
