import express from 'express'
const productRoute = express.Router();

import { getAllProducts , newProductHandler , searchProducts } from '../Controllers/productControllers.js';
productRoute.get('/products' , getAllProducts);
productRoute.post('/products' , newProductHandler);
productRoute.get('/products/search' , searchProducts);

export default productRoute;