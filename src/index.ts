import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import { dbConnect } from './Config/mongodbConnect.js';
import { limiter } from './Config/rateLimiting.js';
import { newClient } from './Config/radisConfig.js';

dbConnect();


const app = express()
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(limiter);

// Import all routes here 
import productRoute from './Routes/ProductRoute.js';
import categoryRouter from './Routes/categoryRoute.js';
import userRoute from './Routes/userRoute.js';
import orderRoute from './Routes/orderRoute.js';
import ProductRouteMongodb from './Routes/ProductRouteMongodb.js';
app.use('/api/v1/' , productRoute);
app.use('/api/v1/' , categoryRouter);
app.use('/api/v1/' , userRoute);
app.use('/api/v1/' , orderRoute);

// Mongodb pagination api
app.use('/api/v1' , ProductRouteMongodb);

(async () => {
  try {
    await newClient();
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start app', err);
    process.exit(1);
  }
})();
