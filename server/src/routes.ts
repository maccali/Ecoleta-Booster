import express from 'express'

import PointsController from '../src/controllers/PointsControler'
import ItemsController from '../src/controllers/ItemsController'

const routes = express.Router()
const pointsController = new PointsController()
const itemsController = new ItemsController()

routes.get('/items', itemsController.index)
routes.post('/points', pointsController.create)
routes.get('/points', pointsController.index)
routes.get('/points/:id', pointsController.show)

// index, show, create, update, delete

export default routes;