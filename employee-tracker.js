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
        case 'View All Employees By Manager': // Bonus
          doAThing();
          break;
        case 'Add Employee':
          addEmp();
          break;
        case 'Remove Employee': // Bonus
          doAThing();
          break;
        case 'Update Employee Role':
          doAThing();
          break;
        case 'Update Employee Manager': // Bonus
          doAThing();
          break;
        case 'View All Roles':
          // viewRoles();
          (async () => {
            const roleArr = await getRoles();
            console.log(roleArr);
          })();
          break;
        case 'Add Role':
          doAThing();
          break;
        case 'Remove Role': // Bonus
          doAThing();
          break;
        case 'View All Departments':
          viewDepartments();
          break;
        case 'Add Department':
          doAThing();
          break;
        case 'Remove Department': // Bonus
          doAThing();
          break;
        case 'View Utilized Department Budget By Department': // Bonus
          doAThing();
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
    mainMenu();
  });
}

const viewAllEmpDept = () => {
  const deptArray = viewDepartments(); // doesn't work, breaks everything below
  inquirer
    .prompt({
      name: 'dept',
      type: 'list',
      message: 'Select a Department',
      choices: deptArray, // give it an array
    })
    .then((answer) => {
      query = "SELECT * FROM employee WHERE department = ?";
      connection.query(query, { department: answer.dept }, (err, res) => {
        const table = cTable.getTable(res);
        console.log('\n\n' + table);
        mainMenu();
      });
    })
}

// Add an Employee
const addEmp = () => {
  // these don't work
  const roleArray = getRoles();
  console.log(roleArray);
  const managerArray = getManagers();
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
        enumerate: function (manager) { // do I need to do this?
          // turn the title into the role id number...
          // ...er get the related id?
        }
      },
    )
    .then((answer) => {
      const query = "INSERT INTO employee ('first_name', 'last_name', 'role_id', 'manager_id') "
        + "VALUES (?, ?, ?, ?)"
      connection.query(query, [answer.firstN, answer.lastN, answer.role, answer.manager], (err, res) => {
        if (err) throw err;
        console.log(`Added ${employeeName} to the database`);
        mainMenu();
      });
    });
}

const addRole = () => {
  const roleArr = [];
  inquirer
    .prompt({
      type: 'input',
      name: 'firstN',
      message: 'What is the employee\'s first name?',
    }
    )
    .then((answer) => {
      const query = "INSERT INTO role ('title', 'salary'"
      connection.query(query, [answer.firstN, answer.lastN, answer.role, answer.manager], (err, res) => {
        if (err) throw err;
        console.log(`Added ${employeeName} to the database`);
      });
    }).then(mainMenu());
}

// hoping to return a array of objects with 3 properties
  // ex: manager[0].fName, manager[0].lName, manager[0].id
const getManagers = () => {
  // has to be more efficient way to pass role_id
  const query = "SELECT first_name, last_name, id FROM employee WHERE role_id = 1"
  connection.query(query, (err, res) => {
    return res;
  });
}

const viewRoles = () => {
  const query = "SELECT title FROM role";
  const roleArr = [];
  connection.query(query, (err, res) => {
    res.forEach((data) => {
      roleArr.push(data.title);
    })
    // inquire here!?
    console.cTable(roleArr);
    mainMenu();
  });
}
// praise be to stackoverflow
function getRoles() {
  const roleArr = [];
  return new Promise((resolve, reject) => {
    const query = "SELECT title FROM role";
    connection.query(query, (err, res) => {
      res.forEach((data) => {
        roleArr.push(data.title);
      })
      return err ? reject(err) : resolve(roleArr);
    });
  });
}

function viewDepartments() {
  const query = "SELECT name FROM department";
  const deptArr = [];
  connection.query(query, (err, res) => {
    res.forEach((data) => {
      deptArr.push(data.name);
    })
    console.log(deptArr + '\n');
    mainMenu();
  });
}

function doAThing() {
  console.log("\nNot yet implemented\n");
  mainMenu();
}