const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.DB_PASS,
    database: 'staffDB',
});

connection.connect((err) => {
    if (err) throw err;
    mainMenu();
});

const mainMenu = () => {
    inquirer
      .prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
          'View All Employees',
          'View All Employees By Department',
          'View All Employees By Manager', //Bonus
          'Add Employee',
          'Remove Employee', // Bonus
          'Update Employee Role',
          'Update Employee Manager', // Bonus
          'View All Roles',
          'Add Role',
          'Remove Role', // Bonus
          'View All Departments',
          'Add Department',
          'Remove Department', //Bonus
          'View Utilized Department Budget By Department', // combined salaries by dept
        ],
      })
      .then((answer) => {
        switch (answer.action) {
          case 'View All Employees':
            // viewAllEmp();
            break;
          case 'View All Employees By Department':
            // doAThing();
            break;
          case 'View All Employees By Manager':
            // doAThing();
            break;
          case 'Add Employee':
            // doAThing();
            break;
          case 'Remove Employee':
            // doAThing();
            break;
          case 'Update Employee Role':
            // doAThing();
            break;
          case 'Update Employee Manager':
            // doAThing();
            break;
          case 'View All Roles':
            // doAThing();
            break;
          case 'Add Role':
            // doAThing();
            break;
          case 'Remove Role':
            // doAThing();
            break;
          case 'View All Departments':
            // doAThing();
            break;
          case 'Add Department':
            // doAThing();
            break;
          case 'Remove Department':
            // doAThing();
            break;
          case 'View Utilized Department Budget By Department':
            // doAThing();
            break;
          default:
            console.log(`Invalid action: ${answer.action}`);
            break;
        }
      });
  };