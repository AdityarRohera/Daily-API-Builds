import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import { dbConnect } from './Config/mongodbConnect.js';

dbConnect();


const app = express()
const port = process.env.PORT || 3000;

app.use(express.json());

// Import all routes here 
import productRoute from './Routes/ProductRoute.js';
import categoryRouter from './Routes/categoryRoute.js';
import userRoute from './Routes/userRoute.js';
import orderRoute from './Routes/orderRoute.js';
app.use('/api/v1/' , productRoute);
app.use('/api/v1/' , categoryRouter);
app.use('/api/v1/' , userRoute);
app.use('/api/v1/' , orderRoute);

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
