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
          destroyEmployee();
          break;
        case 'Update Employee Role':
          updateEmpRole();
          break;
        case 'Update Employee Manager': // Bonus
          updateEmpManager();
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
function addEmp() {
  (async () => {
    const roleArray = await getRoles(); // gets role title AND id
    // new array for role titles ONLY
    const roleTitles = [];
    roleArray.forEach((element) => {
      roleTitles.push(element.title);
    })
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
          choices: roleTitles,
        },
        {
          type: 'list',
          name: 'manager',
          message: 'Who is the employee\'s manager?',
          choices: managerArray,
        }
      ])
      .then((answer) => {
        (async () => {
          // gets id of argued name
          const managerId = await getIdByName(answer.manager);
          // gets id of argued role
          const roleId = await getRoleIdByTitle(answer.role);
          if (managerId === '') { // no manager selected
            const query = "INSERT INTO employee (first_name, last_name, role_id) "
              + "VALUES (?, ?, ?)";
            connection.query(query, [answer.firstN, answer.lastN, roleId], (err, res) => {
              if (err) throw err;
              console.log(`\nAdded ${answer.firstN + ' ' + answer.lastN} to the database\n`);
              mainMenu();
            });
          } else if (!isNaN(managerId)){ // manager selected
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

function destroyEmployee() {
  (async() => {
    const empList = await getEmployees();
    if(empList.length > 7)
      empList.push(new inquirer.Separator());
    inquirer
      .prompt({
        type: 'list',
        name: 'employee',
        message: 'Which employee do you want to remove?',
        choices: empList,
      })
      .then((answer) => {
        let empId;
        for (let i = 0; i < empList.length; i++) {
          if (empList[i].name === answer.employee) {
            empId = empList[i].id;
            break;
          }
        }
        const query = "DELETE FROM employee WHERE id = ?";
        connection.query(query, empId, (err, res) => {
          if (err) throw err;
          console.log("\nRemoved employee from the database\n");
          mainMenu();
        })
      })
  })();
}

// returns (promise) array of employees (name, id)
const getEmployees = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT concat(first_name, ' ', last_name) AS name, "
    + "id FROM employee";
    connection.query(query, (err, res) => {
      return err ? reject(err) : resolve(res);
    });
  })
}

function addRole() {
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
  (async() => {
    // get an array of employees
    const empArr = await getEmployees(); // name, id
    if (empArr.length > 7)
      empArr.push(new inquirer.Separator());
    // get an array of roles
    const roleArr = await getRoles(); // title, id (shows undefined in choices)
    // get role titles in their own array for 'choices'
    const roleTitles = [];
    roleArr.forEach((element) => {
      roleTitles.push(element.title);
    })
    if (roleTitles.length > 7)
      roleTitles.push(new inquirer.Separator());
    // prompt for employee name and updated role
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'employee',
          message: 'Which employee would you like to update the role for?',
          choices: empArr,
        },
        {
          type: 'list',
          name: 'role',
          message: 'Which role would you like to assign them to?',
          choices: roleTitles,
        }
      ]).then((answers) => {
        const empName = answers.employee;
        const empRole = answers.role;
        let empId; // id of selected employee
        let roleId; // (role)id of user selected role
        for (let i = 0; i < empArr.length; i++) {
          if (empArr[i].name === answers.employee) {
            empId = empArr[i].id;
            break;
          }
        }
        for (let i = 0; i < empRole.length; i++) {
          if (roleArr[i].title === answers.role) {
            roleId = roleArr[i].id;
            break;
          }
        }
        // update role
        const query = "UPDATE employee SET role_id = ? WHERE "
        + "id = ?";
        connection.query(query, [roleId, empId], (err, res) => {
          if (err) throw err;
          console.log(`\nSuccessfully updated ${empName}'s role to ${answers.role}\n`);
          mainMenu();
        })
      })
  })();
}

const updateEmpManager = () => {
  (async() => {
    // get an array of employees
    const empArr = await getEmployees(); // name, id
    if (empArr.length > 7)
      empArr.push(new inquirer.Separator());
    
    // prompt for employee name and updated manager
    let employeeName;
    inquirer
      .prompt(
        {
          type: 'list',
          name: 'employee',
          message: "Which employee's manager do you want to update?",
          choices: empArr,
        })
        .then((answer) => {
          employeeName = answer.employee;
          const potentialManagers = empArr.filter(e => e.name !== answer.employee);
          inquirer
            .prompt(
              {
                type: 'list',
                name: 'manager',
                message: 'Which employee do you want to set as manager for the selected employee?',
                choices: potentialManagers,
              })
              .then((answer) => {
                (async() => {
                  let empId; // id of selected employee
                  for (let i = 0; i < empArr.length; i++) {
                    if (empArr[i].name === employeeName) {
                      empId = empArr[i].id;
                      break;
                    }
                  }
                  const managerId = await getIdByName(answer.manager);
                  // update manager
                  const query = "UPDATE employee SET manager_id = ? WHERE "
                  + "id = ?";
                  connection.query(query, [ managerId, empId ], (err, res) => {
                    if (err) throw err;
                    console.log(`\nUpdated employee's manager\n`);
                    mainMenu();
                  })
                })();
              })
        })
  })();
}

function viewRoles() {
    const query = "SELECT title FROM role";
    connection.query(query, (err, res) => {
      if (err) throw(err);
      const table = cTable.getTable(res);
      console.log('\n\n' + table);
      mainMenu();
    });
}

const getRoles = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT title, id FROM role";
    connection.query(query, (err, res) => {
      return err ? reject(err) : resolve(res);
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

const getDepartments = () => {
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

