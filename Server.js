const express = require('express');
const connectDB = require('./config/db.js');

const app = express();

//here we will connect to the database
connectDB();
app.get('/', (req, res) => res.send('The API is running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('server is running on port '+PORT));

