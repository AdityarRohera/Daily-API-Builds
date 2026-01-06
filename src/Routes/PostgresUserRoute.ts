
import express from 'express'
const pgUserRoute = express.Router();

// Middleware
import { userAuth , isAdmin } from '../Middlewares/pgAuth.js';
import type { AuthenticatedRequest } from '../Middlewares/pgAuth.js';

import { newUserHandler , newRoleHandler , assignRoleHandler , signInUserHandler } from '../Controllers/pgUserController.js';

pgUserRoute.post('/pg-user/new' , newUserHandler);
pgUserRoute.post('/pg-user' , signInUserHandler);

pgUserRoute.get('/pg-user' , userAuth , isAdmin ,  (req , res) => {
    const user = req as AuthenticatedRequest
    const {userId , email} = user.user;

    res.send({
        data : {userId , email}
    })

});

pgUserRoute.post('/roles' , userAuth , isAdmin ,  newRoleHandler);
pgUserRoute.post('/pg-user/:id/assign_role'  , userAuth , isAdmin ,  assignRoleHandler);

export default pgUserRoute;