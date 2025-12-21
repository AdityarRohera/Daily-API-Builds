import express from 'express'
const productRoute = express.Router();

import { getAllProducts , newProductHandler } from '../Controllers/productControllers.js';
productRoute.get('/products' , getAllProducts);
productRoute.post('/products' , newProductHandler);

export default productRoute;