import express, { query } from 'express';
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload')    
const app = express();
app.use(express.static('public'), fileupload(),bodyParser.urlencoded({ limit: '10mb'}), bodyParser.json())


const authRoutes = require('./routes/auth');
const csvRoutes = require('./routes/csv_files');
const usersRoutes = require('./routes/users');

app.use('/auth', authRoutes);
app.use('/csv_files',csvRoutes);
app.use('/users', usersRoutes);

app.listen(5000, () => console.log('Server Running'));