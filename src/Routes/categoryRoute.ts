import express from 'express'
const categoryRouter = express.Router();

import { newCategoryHandler , getAllCategoryProducts } from '../Controllers/categoriesController.js';
categoryRouter.post('/categories' , newCategoryHandler);
categoryRouter.get('/categories/:id/products' , getAllCategoryProducts);

export default categoryRouter;