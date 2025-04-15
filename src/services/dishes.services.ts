import { ObjectId, WithId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import Dish from '~/models/Dish.models'
import databaseService from '~/services/database.services'
import { StatusError } from '~/utils/errors'
import { CreateDishBodyType, UpdateDishBodyType } from '~/validations/dishses.validations'

class DishService {
  async getDishList() {
    const dishes = await databaseService.dishes
      .aggregate([
        {
          $addFields: {
            _id: { $toString: '$_id' }
          }
        },
        {
          $sort: { created_at: -1 }
        }
      ])
      .toArray()
    return dishes
  }

  async getDishListWithPagination(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [items, totalItem] = await Promise.all([
      databaseService.dishes
        .aggregate([
          {
            $addFields: {
              _id: { $toString: '$_id' }
            }
          },
          {
            $sort: { created_at: -1 }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.dishes.countDocuments()
    ])
    const totalPage = Math.ceil(totalItem / limit)
    return {
      items,
      totalItem,
      page,
      limit,
      totalPage
    }
  }

  async getDishDetail(dishId: string) {
    const dish = await databaseService.dishes.findOne({ _id: new ObjectId(dishId) })
    if (!dish) {
      throw new StatusError({ message: 'Món ăn không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    return dish
  }

  async createDish(body: CreateDishBodyType) {
    const result = await databaseService.dishes.insertOne(
      new Dish({
        name: body.name,
        price: body.price,
        description: body.description,
        image: body.image,
        status: body.status
      })
    )
    const dish = (await databaseService.dishes.findOne({
      _id: result.insertedId
    })) as WithId<Dish>
    return dish
  }

  async updateDish(dishId: string, body: UpdateDishBodyType) {
    const existDish = await databaseService.dishes.findOne({ _id: new ObjectId(dishId) })
    if (!existDish) {
      throw new StatusError({ message: 'Món ăn không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    await databaseService.dishes.updateOne(
      { _id: new ObjectId(dishId) },
      {
        $set: {
          ...body,
          updated_at: new Date()
        }
      }
    )
    const dish = (await databaseService.dishes.findOne({ _id: new ObjectId(dishId) })) as WithId<Dish>
    return dish
  }

  async deleteDish(dishId: string) {
    const dish = await databaseService.dishes.findOne({ _id: new ObjectId(dishId) })
    if (!dish) {
      throw new StatusError({ message: 'Món ăn không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    await databaseService.dishes.deleteOne({
      _id: new ObjectId(dishId)
    })
    return dish
  }
}

const dishService = new DishService()
export default dishService
