import express from 'express'
const orderRoute = express.Router();

import { orderProductHandler } from '../Controllers/orderController.js';
orderRoute.post('/order/new' , orderProductHandler);

export default orderRoute;