import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import mediasService from '~/services/medias.services'
import { UploadImageResType } from '~/validations/medias.validations'

export const uploadImageController = async (req: Request<ParamsDictionary>, res: Response<UploadImageResType>) => {
  const urlList = await mediasService.uploadImage(req)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Upload ảnh thành công',
    data: urlList[0].url
  })
}
