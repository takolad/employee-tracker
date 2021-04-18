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
          viewRoles();
          break;
        case 'Add Role':
          doAThing();
          break;
        case 'Remove Role': // Bonus
          doAThing();
          break;
        case 'View All Departments':
          (async () => {
            let deptArr = await getDepartments();
            deptArr.forEach((data, idx) => {
              deptArr[idx] = {'\ndepartment':data.name};
            })
            console.table(deptArr);
            mainMenu();
          })();
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

const viewAllEmp = () => {
  const query = "SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, " +
  "r.salary, concat(m.first_name, ' ', m.last_name) AS manager " +
  "FROM employee AS e LEFT JOIN role AS r ON e.role_id = r.id " +
  "LEFT JOIN department AS d ON r.department_id = d.id " +
  "LEFT JOIN employee m ON m.id = e.manager_id";
  connection.query(query, (err, res) => {
    if (err) throw err;
    const table = cTable.getTable(res);
    if(res[0]) {
      console.log('\n\n' + table);
    } else {
      console.log("\nNo matches found.\n");
    }
    mainMenu();
  });
}


const viewAllEmpDept = () => {
  (async () => {
    let deptArr = await getDepartments();
    let depts = deptArr;
    inquirer
      .prompt({
        name: 'dept',
        type: 'list',
        message: 'Select a Department',
        choices: depts,
      })
      .then((answer) => {
        let deptText = answer.dept;
        (async () => {
          const deptId = await getDeptId(deptText);
        
          const query = "SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, " +
          "r.salary, concat(m.first_name, ' ', m.last_name) AS manager " +
          "FROM employee AS e LEFT JOIN role AS r ON e.role_id = r.id " +
          "LEFT JOIN department AS d ON r.department_id = d.id " +
          "LEFT JOIN employee m ON m.id = e.manager_id " +
          `WHERE d.id = ${deptId} ORDER BY e.id`;

          connection.query(query, (err, res) => {
            if (err) throw err;
            const table = cTable.getTable(res);
            if(res[0]) {
              console.log('\n\n' + table);
            } else {
              console.log("\nNo matches found.\n");
            }
            mainMenu();
          });
        })();
      })
  })();
}

// Add an Employee
const addEmp = () => {
  // these don't work
  const roleArray = getRoles(); // returns pending promise
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
  return new Promise((resolve, reject) => {
    const query = "SELECT title FROM role";
    connection.query(query, (err, res) => {
      if (err) reject(err);
      const table = cTable.getTable(res);
      resolve(console.log('\n\n' + table));
      mainMenu();
    });
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

function getDepartments() {
  const deptArr = [];
  return new Promise((resolve, reject) => {
    const query = "SELECT id, name FROM department";
    connection.query(query, (err, res) => {
      res.forEach((data) => {
        deptArr.push({id:data.id, name:data.name});
      })
      return err ? reject(err) : resolve(deptArr);
    });
  });
}

function doAThing() {
  console.log("\nNot yet implemented\n");
  mainMenu();
}

function getDeptId(deptName) {
  return new Promise((resolve, reject) => {
    const query = "SELECT id FROM department WHERE name = ?";
    connection.query(query, deptName, (err, res) => {
      return err ? reject(err) : resolve(res[0].id);
    });
  });
}