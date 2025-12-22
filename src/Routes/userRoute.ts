import express from 'express'
const userRoute = express.Router();
import { userAuth } from '../Middlewares/auth.js';

import { newUserHandler , userLoginHandler , userProfile } from '../Controllers/userController.js';
userRoute.post('/auth/register' , newUserHandler);
userRoute.post('/auth/login' , userLoginHandler);
userRoute.get('/auth/profile' , userAuth , userProfile);

export default userRoute;