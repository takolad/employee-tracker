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
          new inquirer.Separator('----------------------------------------------'),
        ],
      })
      .then((answer) => {
        switch (answer.action) {
          case 'View All Employees':
            viewAllEmp();
            break;
          case 'View All Employees By Department':
            viewAllEmpDept();
            break;
          case 'View All Employees By Manager':
            // doAThing();
            break;
          case 'Add Employee':
            // addEmp();
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

  // don't know how to get manager name instead of id
const viewAllEmp = () => {
    const query = "SELECT emp.id, emp.first_name, emp.last_name, role.title, dept.name AS department, role.salary, emp.manager_id AS manager " +
    "FROM employee AS emp LEFT JOIN role ON emp.role_id = role.id " +
    "LEFT JOIN department AS dept ON role.department_id = dept.id;";
    connection.query(query, (err, res) => {
        const table = cTable.getTable(res);
        console.log('\n\n' + table);
    });
    console.log('\n');
    mainMenu();
}

const viewAllEmpDept = () => {
    const query = "Select name FROM department";
    const deptArray = [];
    connection.query(query, (err,res) => {
        res.forEach(({name}) => {
            name = name.charAt(0).toUpperCase() + name.slice(1);
            deptArray.push(name);
            console.log(name);
            console.log(deptArray.length);
        })
    })
    inquirer
      .prompt({
          name: 'dept',
          type: 'list',
          message: 'Select a Department',
          choices: deptArray,// give it an array
      })
      .then((answer) => {
        query = "SELECT * FROM employee WHERE department = ?";
        connection.query(query, {department : answer.dept},(err, res) => {
            const table = cTable.getTable(res);
            console.log('\n\n' + table);
        });
        console.log('\n');
        mainMenu();
      })
  }

    // Add an Employee
    const addEmp = () => {
      const roleArray = [];
      const managerArray = [];
      inquirer
        .prompt({
            type: 'input',
            name: 'firstN',
            message: 'What is the employee\'s first name?',
          },
          {
            type: 'input',
            name: 'lastN',
            message: 'What is the employee\'s last name?',
          },
          {
            type: 'list',
            name: 'role',
            message: 'What is the employee\'s role?',
            choices: roleArray,
          },
          {
            type: 'list',
            name: 'manager',
            message: 'Who is the employee\'s manager?',
            coices: managerArray,
          },
        )
        .then((answer) => {
          const query = "INSERT INTO employee ('first_name', 'last_name', 'role_id', 'manager_id') "
          + "VALUES (?, ?, ?, ?)"
          connection.query(query, [ answer.firstN, answer.lastN, answer.role, answer.manager ],(err, res) => {
            if (err) throw err;
            const table = cTable.getTable(res);
          });
          mainMenu();
        })
    }