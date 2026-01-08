import express from 'express'
const productRoute = express.Router();

import { getAllProducts , newProductHandler , searchProducts } from '../Controllers/productControllers.js';
import { userAuth , isAdmin } from '../Middlewares/pgAuth.js';
import { softDeleteProductHandler } from '../Controllers/productControllers.js';

productRoute.get('/products' , getAllProducts);
productRoute.post('/products', userAuth , isAdmin , newProductHandler);
productRoute.get('/products/search' , searchProducts);

// Delete products (soft delete)
productRoute.put('/products/:id/delete' , userAuth , isAdmin ,  softDeleteProductHandler);

export default productRoute;