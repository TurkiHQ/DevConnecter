const express = require('express');
const connectDB = require('./config/db.js');

const app = express();

//connect to the database
connectDB();

//init middleware 
app.use(express.json({extended: false }));

app.get('/', (req, res) => res.send('The API is running'));

//define the routes (user,auth,profile,posts)
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('server is running on port '+PORT));

