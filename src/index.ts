import express from 'express'
import dotenv from 'dotenv'
dotenv.config();

const app = express()
const port = process.env.PORT || 3000;

// Import all routes here 
import productRoute from './Routes/ProductRoute.js';
import categoryRouter from './Routes/categoryRoute.js';
app.use('/api/v1/' , productRoute);
app.use('/api/v1/' , categoryRouter);

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
