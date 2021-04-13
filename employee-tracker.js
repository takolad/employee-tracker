const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const dotenv = require('dotenv');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.DB_PASS,
    database: 'staffDB',
});