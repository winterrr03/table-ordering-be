import { formatInTimeZone } from 'date-fns-tz'
import envConfig from '~/config'
import { OrderStatus } from '~/constants/types'
import databaseService from '~/services/database.services'

class IndicatorService {
  async dashboardIndicator(fromDate: Date, toDate: Date) {
    fromDate = new Date(fromDate)
    toDate = new Date(toDate)

    const [orders, guests, dishes] = await Promise.all([
      databaseService.orders
        .aggregate([
          {
            $match: {
              created_at: { $gte: fromDate, $lte: toDate }
            }
          },
          {
            $lookup: {
              from: 'dish_snapshots',
              localField: 'dish_snapshot_id',
              foreignField: '_id',
              as: 'dishSnapshot'
            }
          },
          { $unwind: '$dishSnapshot' },
          {
            $lookup: {
              from: 'guest_sessions',
              localField: 'guest_session_id',
              foreignField: '_id',
              as: 'guestSession'
            }
          },
          { $unwind: '$guestSession' },
          {
            $lookup: {
              from: 'tables',
              localField: 'guestSession.table_id',
              foreignField: '_id',
              as: 'table'
            }
          },
          { $unwind: { path: '$table', preserveNullAndEmptyArrays: true } }
        ])
        .toArray(),
      databaseService.guests
        .aggregate([
          {
            $match: {
              created_at: { $gte: fromDate, $lte: toDate }
            }
          },
          {
            $lookup: {
              from: 'guest_sessions',
              localField: '_id',
              foreignField: 'guest_id',
              as: 'guestSessions'
            }
          },
          { $unwind: '$guestSessions' },
          {
            $lookup: {
              from: 'orders',
              localField: 'guestSessions._id',
              foreignField: 'guest_session_id',
              as: 'orders'
            }
          },
          {
            $match: {
              'orders.status': OrderStatus.Paid
            }
          }
        ])
        .toArray(),
      databaseService.dishes.find({}).toArray()
    ])

    let revenue = 0
    const guestCount = guests.length
    const orderCount = orders.length

    const dishIndicatorObj: Record<string, any> = {}
    dishes.forEach((dish) => {
      dishIndicatorObj[dish._id.toString()] = {
        ...dish,
        successOrders: 0
      }
    })

    const revenueByDateObj: { [key: string]: number } = {}
    for (let i = new Date(fromDate); i <= toDate; i.setDate(i.getDate() + 1)) {
      const key = formatInTimeZone(i, envConfig.SERVER_TIMEZONE, 'dd/MM/yyyy')
      revenueByDateObj[key] = 0
    }

    const tableNumberObj: Record<number, boolean> = {}

    orders.forEach((order) => {
      const dishSnapshot = order.dishSnapshot
      const dishIdStr = dishSnapshot.dish_id.toString()
      const price = dishSnapshot.price
      const quantity = order.quantity

      if (order.status === OrderStatus.Paid) {
        revenue += price * quantity
        const dateKey = formatInTimeZone(order.created_at, envConfig.SERVER_TIMEZONE, 'dd/MM/yyyy')
        revenueByDateObj[dateKey] = (revenueByDateObj[dateKey] || 0) + price * quantity

        if (dishIndicatorObj[dishIdStr]) {
          dishIndicatorObj[dishIdStr].successOrders++
        }
      }

      if (
        [OrderStatus.Processing, OrderStatus.Pending, OrderStatus.Delivered].includes(order.status) &&
        order.table?.number != null
      ) {
        tableNumberObj[order.table.number] = true
      }
    })

    const revenueByDate = Object.entries(revenueByDateObj).map(([date, revenue]) => ({ date, revenue }))
    const dishIndicator = Object.values(dishIndicatorObj)
    dishIndicator.sort((a, b) => b.successOrders - a.successOrders)
    const servingTableCount = Object.keys(tableNumberObj).length

    return {
      revenue,
      guestCount,
      orderCount,
      servingTableCount,
      dishIndicator,
      revenueByDate
    }
  }

  async analyticsIndicator() {
    const results = await databaseService.absa_results
      .aggregate([
        {
          $unwind: {
            path: '$aspects'
          }
        },
        {
          $match: {
            'aspects.sentiment': {
              $in: ['positive', 'neutral', 'negative']
            }
          }
        },
        {
          $group: {
            _id: {
              aspect: '$aspects.aspect',
              sentiment: '$aspects.sentiment'
            },
            count: {
              $sum: 1
            }
          }
        },
        {
          $group: {
            _id: '$_id.aspect',
            sentiments: {
              $push: {
                sentiment: '$_id.sentiment',
                count: '$count'
              }
            },
            total: {
              $sum: '$count'
            }
          }
        },
        {
          $project: {
            _id: 0,
            aspect: '$_id',
            review_count: '$total',
            sentiments: {
              $map: {
                input: '$sentiments',
                as: 's',
                in: {
                  sentiment: '$$s.sentiment',
                  percentage: {
                    $round: [
                      {
                        $multiply: [
                          {
                            $divide: ['$$s.count', '$total']
                          },
                          100
                        ]
                      },
                      2
                    ]
                  }
                }
              }
            }
          }
        }
      ])
      .toArray()
    return results
  }

  async getReviewList() {
    const reviews = await databaseService.absa_results
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
    return reviews
  }
}

const indicatorService = new IndicatorService()
export default indicatorService
