import express from 'express'
const productRoute = express.Router();

import { getAllProducts } from '../Controllers/productControllers.js';
productRoute.get('/products' , getAllProducts);

export default productRoute;