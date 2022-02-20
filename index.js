const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;

const db = mysql.createConnection(
    {
    host: 'localhost',
    user: 'root',
    password: 'pass',
    database: 'employee_db'
},
console.log('Connected to the employee_db')

)