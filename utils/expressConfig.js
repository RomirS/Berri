const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app
.set('views', path.resolve(__dirname, '../views'))
.set('view engine', 'pug')
.use(express.static(path.resolve(__dirname, '../public')))
.use(bodyParser.urlencoded({ extended: true }))
.use(bodyParser.json())
.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

module.exports = function(){ return app; }
    
    //appbodyParser.urlencoded({ extended: false })                                                