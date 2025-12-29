import express from 'express'
const ProductRouteMongodb = express.Router();

import { getAllProducts } from '../Controllers/mongodbProductsController.js';
ProductRouteMongodb.get('/mongodb/products' , getAllProducts);

export default ProductRouteMongodb;