require('dotenv').config();
const express = require('express');
const app = express();
const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route');

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB_URL, () => console.log('Conneted to mongodb ...'));
app.use(express.json());

app.use('/v1/auth', authRoute);
app.use('/v1/user', userRoute);

app.listen(3000, () => console.log('Server is running ...'));
