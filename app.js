const express = require('express')
const app = express()

require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')

const port = process.env.PORT

const userRoutes = require('./routes/user')
const productRoutes = require('./routes/product')
const orderRoutes = require('./routes/order')

app.use(cors())
app.options('*', cors())
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
});

app.use('/users', userRoutes)
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)

mongoose.connect(process.env.MONGODB_LOCAL_DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(result =>{
    console.log('database connected');
}).catch(err => console.log(err))

app.listen(port, () =>{
    console.log(`app is running on port ${port}`)
})