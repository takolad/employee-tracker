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
          viewAllEmpByDept();
          break;
        case 'View All Employees By Manager':
          viewAllEmpByManager();
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
          addRole();
          break;
        case 'Remove Role': // Bonus
          doAThing();
          break;
        case 'View All Departments':
          viewDepartments();
          break;
        case 'Add Department':
          addDepartment();
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

const viewAllEmpByDept = () => {
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
          const query = "SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, " +
          "r.salary, concat(m.first_name, ' ', m.last_name) AS manager " +
          "FROM employee AS e LEFT JOIN role AS r ON e.role_id = r.id " +
          "LEFT JOIN department AS d ON r.department_id = d.id " +
          "LEFT JOIN employee m ON m.id = e.manager_id " +
          `WHERE d.name = ? ORDER BY e.id`;

          connection.query(query, answer.dept, (err, res) => {
            if (err) throw err;
            const table = cTable.getTable(res);
            if(res[0]) {
              console.log('\n\n' + table);
            } else {
              console.log("\nNo matches found.\n");
            }
            mainMenu();
          });
        })
      })();
}

const viewAllEmpByManager = () => {
  (async () => {
    const managers = await getManagers();
    inquirer
      .prompt({
        name: 'manager',
        type: 'list',
        message: 'Select a Manager',
        choices: managers,
      })
      .then((answer) => {
          let manager = answer.manager.split(' ');
          const query = "SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, " +
          "r.salary, concat(m.first_name, ' ', m.last_name) AS manager " +
          "FROM employee AS e LEFT JOIN role AS r ON e.role_id = r.id " +
          "LEFT JOIN department AS d ON r.department_id = d.id " +
          "LEFT JOIN employee m ON m.id = e.manager_id " +
          `WHERE m.first_name = ? AND m.last_name = ? ORDER BY e.id`;

          connection.query(query, [ manager[0], manager[1] ], (err, res) => {
            if (err) throw err;
            const table = cTable.getTable(res);
            if(res[0]) {
              console.log('\n\n' + table);
            } else {
              console.log("\nNo matches found.\n");
            }
            mainMenu();
          });
        })
      })();
}

// Add an Employee
const addEmp = () => {
  (async () => {
    const roleArray = await getRoles();
    const managerArray = await getManagers();
    managerArray.unshift('None'); // Adds None to the array as an option
    inquirer
      .prompt([{
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
          choices: roleArray, // to >> role.title
        },
        {
          type: 'list',
          name: 'manager',
          message: 'Who is the employee\'s manager?',
          choices: managerArray, // answer needs to be converted to e.id
        }
      ])
      .then((answer) => {
        (async () => {
          // gets id of argued name
          const managerId = await getIdByName(answer.manager);
          // gets id of argued role
          const roleId = await getRoleIdByTitle(answer.role);
          if (managerId === '') {
            const query = "INSERT INTO employee (first_name, last_name, role_id) "
              + "VALUES (?, ?, ?)";
            connection.query(query, [answer.firstN, answer.lastN, roleId], (err, res) => {
              if (err) throw err;
              console.log(`\nAdded ${answer.firstN + ' ' + answer.lastN} to the database\n`);
              mainMenu();
            });
          } else if (!isNaN(managerId)){
            const query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) "
              + "VALUES (?, ?, ?, ?)"
            connection.query(query, [answer.firstN, answer.lastN, roleId, managerId], (err, res) => {
              if (err) throw err;
              console.log(`\nAdded ${answer.firstN + ' ' + answer.lastN} to the database\n`);
              mainMenu();
            });
          }
        })();
        })
  })();

}

const addRole = () => {
  (async() => {
    // get array of departments
    const deptArr = await getDepartments();
    deptArr.unshift('None');
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'role',
          message: 'What role would you like to add?',
        },
        {
          type: 'number',
          name: 'salary',
          message: 'What is the salary for this role?'
        },
        {
          type: 'list',
          name: 'dept',
          message: 'Which department does this role belong to?',
          choices: deptArr
        }
      ])
      .then((answer) => {
        if (answer.dept === 'None') {
          const query = "INSERT INTO role (title, salary) VALUES (?, ?)";
          connection.query(query, [answer.role, answer.salary], (err, res) => {
            if (err) throw err;
            console.log(`\nAdded '${answer.role}' role to the database`);
            mainMenu();
          });
        } else {
          (async() => {
            // get id of matching dept
            const deptId = await getDeptIdByName(answer.dept);
            const query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
            connection.query(query, [answer.role, answer.salary, deptId], (err, res) => {
              if (err) throw err;
              console.log(`\nAdded '${answer.role}' role to the database\n`);
              mainMenu();
            });
          })();
        }
      })
  })();
}

const getManagers = () => {
  const managerArr = [];
  return new Promise((resolve, reject) => {
    const query = "SELECT DISTINCT concat(m.first_name, ' ', m.last_name) AS manager " +
    "FROM employee AS m " +
    "JOIN employee AS e ON m.id = e.manager_id";
    connection.query(query, (err, res) => {
      res.forEach((data) => {
        managerArr.push(data.manager);
      })
      return err ? reject(err) : resolve(managerArr);
    });
  })
}

const updateEmpRole = () => {
  // get an array of employees
  // get an array of roles
  // promp which employee
  // prompt which role
  // update role
}

const viewRoles = () => {
    const query = "SELECT title FROM role";
    connection.query(query, (err, res) => {
      if (err) throw(err);
      const table = cTable.getTable(res);
      console.log('\n\n' + table);
      mainMenu();
    });
}

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
  })
}

const addDepartment = () => {
  inquirer
    .prompt({
      type: 'input',
      name: 'dept',
      message: 'What department would you like to add?'
    })
    .then((answer) => {
      const query = 'INSERT INTO department (name) VALUE (?)'
      connection.query(query, answer.dept, (err, res) => {
        if (err) throw err;
        console.log(`\nSuccessfully added ${answer.dept} to the database\n`);
        mainMenu();
      });
    });
}

function viewDepartments() {
    const query = "SELECT id, name FROM department";
    const deptArray = [];
    connection.query(query, (err, res) => {
      res.forEach((data) => {
        deptArray.push({departments:data.name});
      })
      const table = cTable.getTable(deptArray);
      console.log('\n' + table);
      mainMenu();
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

// returns id of matching name or empty string if None is selected
function getIdByName(name) {
  return new Promise((resolve, reject) => {
    if (name !== 'None') {
      let nameArr = name.split(' ');
      query = "SELECT id FROM employee " +
      "WHERE first_name = ? and last_name = ?";
      connection.query(query, [ nameArr[0], nameArr[1] ], (err, res) => {
        return (err) ? reject(err) : resolve(res[0].id);
      });
    } else resolve('');
  });
}

function getRoleIdByTitle(title) {
  return new Promise((resolve, reject) => {
    query = "SELECT id FROM role " +
    "WHERE title = ?";
    connection.query(query, [ title ], (err, res) => {
      return (err) ? reject(err) : resolve(res[0].id);
    });
  });
}

function getDeptIdByName(name) {
  return new Promise((resolve, reject) => {
    query = "SELECT id FROM department " +
    "WHERE name = ?";
    connection.query(query, [ name ], (err, res) => {
      return (err) ? reject(err) : resolve(res[0].id);
    });
  });
}