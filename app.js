var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "employeeTracker_DB"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

// function which prompts the user for what action they should take
function start() {
    console.log("\n\n\n\n\n\n\n\n")
    inquirer
        .prompt({
            name: "toDo",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "View all employees",
                "View all employees by role",
                "View all employees by department",
                "Add an employee",
                "Add a role",
                "Add a department",
                "Update an employee's role"
            ]
        })
        .then(function (answer) {
            var toDo = answer.toDo;
            switch (toDo) {
                case "View all employees":
                    viewAllEmployees();
                    break;
                case "View all employees by role":
                    viewAllEmployeesByRole();
                    break;
                case "View all employees by department":
                    viewAllEmployeesByDepartment();
                    break;
                case "Add an employee":
                    addAnEmployee();
                    break;
                case "Add a role":
                    addARole();
                    break;
                case "Add a department":
                    addADepartment();
                    break;
                case "Update an employee's role":
                    updateEmployeeRole();
                    break;
                default:
                    console.log("Went to default in switch block")
            }
        });
}

function viewAllEmployees() {
    var query =
        `SELECT employees1.id AS id, employees1.first_name, employees1.last_name, role.title, department.name AS department, role.salary, CONCAT (employees2.first_name, " ", employees2.last_name) AS manager
    FROM employees AS employees1
    INNER JOIN role ON role.id=employees1.role_id
    INNER JOIN department ON role.department_id=department.id
    LEFT JOIN employees AS employees2 ON employees1.manager_id=employees2.id`
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    })
}

function viewAllEmployeesByRole() {
    var query =
        `SELECT DISTINCT title FROM role`
    connection.query(query, function (err, res) {
        if (err) throw err;
        roles = [];
        for (i in res) {
            roles.push(res[i].title);
        }
        inquirer
            .prompt({
                name: "role",
                type: "rawlist",
                message: "Which role would you like to search for?",
                choices: roles
            })
            .then(function (answer) {
                selectedRole = answer.role;
                connection.query(`SELECT id FROM role WHERE title='${selectedRole}'`, function (err, res) {
                    if (err) throw err;
                    var selectedRole_id = res[0].id;
                    query =
                        `SELECT employees1.id AS id, employees1.first_name, employees1.last_name, role.title, department.name AS department, role.salary, CONCAT (employees2.first_name, " ", employees2.last_name) AS manager
                        FROM employees AS employees1
                        INNER JOIN role ON role.id=employees1.role_id
                        INNER JOIN department ON role.department_id=department.id
                        LEFT JOIN employees AS employees2 ON employees1.manager_id=employees2.id
                        WHERE employees1.role_id=${selectedRole_id}`
                    connection.query(query, function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        start();
                    })
                })
            })
    });
}

function viewAllEmployeesByDepartment() {
    var query =
        `SELECT DISTINCT name FROM department`
    connection.query(query, function (err, res) {
        if (err) throw err;
        departments = [];
        for (i in res) {
            departments.push(res[i].name);
        }
        inquirer
            .prompt({
                name: "department",
                type: "rawlist",
                message: "Which department would you like to search for?",
                choices: departments
            })
            .then(function (answer) {
                selectedDepartment = answer.department;
                connection.query(`SELECT id FROM department WHERE name='${selectedDepartment}'`, function (err, res) {
                    if (err) throw err;
                    var selectedDepartment_id = res[0].id;
                    query =
                        `SELECT employees1.id AS id, employees1.first_name, employees1.last_name, role.title, department.name AS department, role.salary, CONCAT (employees2.first_name, " ", employees2.last_name) AS manager
                        FROM employees AS employees1
                        INNER JOIN role ON role.id=employees1.role_id
                        INNER JOIN department ON role.department_id=department.id
                        LEFT JOIN employees AS employees2 ON employees1.manager_id=employees2.id
                        WHERE role.department_id=${selectedDepartment_id}`
                    connection.query(query, function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        start();
                    })
                })
            })
    })
}

function addAnEmployee() {
    inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "What is this employee's first name?"
            },
            {
                name: "lastName",
                type: "input",
                message: "What is this employee's last name?"
            }
        ])
        .then(function (answer) {
            var firstName = answer.firstName;
            var lastName = answer.lastName;
            var fullName = `${firstName} ${lastName}`;
            connection.query(`SELECT DISTINCT title FROM role`, function (err, res) {
                if (err) throw err;
                roles = [];
                for (i in res) {
                    roles.push(res[i].title);
                }

                connection.query(`SELECT CONCAT(employees.first_name, ' ', employees.last_name) AS existingEmployeeName FROM employees`, function (err, res) {
                    if (err) throw err;
                    names = [];
                    for (i in res) {
                        names.push(res[i].existingEmployeeName)
                    }
                    names.push("Doesn't have a manager")
                    inquirer
                        .prompt([
                            {
                                name: "role",
                                type: "rawlist",
                                message: `Which of these is ${fullName}'s role?`,
                                choices: roles
                            },
                            {
                                name: "manager",
                                type: "rawlist",
                                message: `Who is ${fullName}'s manager?`,
                                choices: names
                            }
                        ])
                        .then(function (answer) {
                            newEmployeeRole = answer.role;
                            newEmployeeManager = answer.manager;
                            if (newEmployeeManager === "Doesn't have a manager") {
                                newEmployeeManager_id = null;
                            } else {
                                connection.query(`SELECT id FROM employees WHERE CONCAT(employees.first_name, ' ', employees.last_name)='${newEmployeeManager}'`, function (err, res) {
                                    if (err) throw err;
                                    newEmployeeManager_id = res[0].id;
                                })
                            }
                            connection.query(`SELECT id FROM role WHERE title='${newEmployeeRole}'`, function (err, res) {
                                newEmployeeRole_id = res[0].id;
                                connection.query(`INSERT INTO employees SET ?`,
                                    {
                                        first_name: firstName,
                                        last_name: lastName,
                                        role_id: newEmployeeRole_id,
                                        manager_id: newEmployeeManager_id
                                    },
                                    function (err) {
                                        if (err) throw err;
                                        console.log(`${fullName} was successfully added as an employee`)
                                        start();
                                    }
                                )
                            })
                        })
                })
            })
        })
}

function addARole() {
    inquirer
        .prompt({
            name: "role",
            type: "input",
            message: "What is the name of the role you want to add"
        })
        .then(function (answer) {
            role = answer.role;
            var query =
                `SELECT DISTINCT name FROM department`
            connection.query(query, function (err, res) {
                if (err) throw err;
                departments = [];
                for (i in res) {
                    departments.push(res[i].name);
                }
                inquirer
                    .prompt([
                        {
                            name: "salary",
                            type: "input",
                            message: `What is the yearly salary for a ${role}?`
                        },
                        {
                            name: "department",
                            type: "rawlist",
                            message: `Which department does the role ${role} belong to?`,
                            choices: departments
                        }
                    ])
                    .then(function (answer) {
                        salary = answer.salary;
                        department = answer.department;
                        connection.query(`SELECT id FROM department WHERE name='${department}'`, function (err, res) {
                            if (err) throw err;
                            department_id = res[0].id;
                            connection.query(`INSERT INTO role SET ?`,
                                {
                                    title: role,
                                    salary: salary,
                                    department_id: department_id
                                },
                                function (err) {
                                    if (err) throw err;
                                    console.log(`${role} was successfully added as a role`)
                                    start();
                                }
                            )
                        })
                    })
            })
        })
}

function addADepartment() {
    inquirer
        .prompt({
            name: "department",
            type: "input",
            message: "What is the name of the department you want to add?"
        })
        .then(function (answer) {
            department = answer.department;
            connection.query(`INSERT INTO department SET ?`,
                {
                    name: department
                },
                function (err) {
                    if (err) throw err;
                    console.log(`${department} was successfully added as a department`)
                    start();
                }
            )
        })
}

function updateEmployeeRole() {
    connection.query(`SELECT CONCAT(employees.first_name, ' ', employees.last_name) as fullName FROM employees`, function (err, res) {
        if (err) throw err;
        names = [];
        for (i in res) {
            names.push(res[i].fullName)
        }
        connection.query(`SELECT DISTINCT title FROM role`, function (err, res) {
            if (err) throw err;
            roles = [];
            for (i in res) {
                roles.push(res[i].title)
            }
            inquirer
                .prompt([
                    {
                        name: "employee",
                        type: "rawlist",
                        message: "Which employee is getting an updated role?",
                        choices: names
                    },
                    {
                        name: "role",
                        type: "rawlist",
                        message: "What is the new role of this employee?",
                        choices: roles
                    }
                ])
                .then(function (answer) {
                    employee = answer.employee;
                    role = answer.role;
                    connection.query(`SELECT id FROM role WHERE title='${role}'`, function (err, res) {
                        if (err) throw err;
                        role_id = res[0].id;
                        connection.query(`SELECT id FROM employees WHERE CONCAT(employees.first_name, ' ', employees.last_name)='${employee}'`, function (err, res) {
                            if (err) throw err;
                            employee_id = res[0].id;
                            connection.query(`UPDATE employees SET role_id = '${role_id}' WHERE id='${employee_id}'`, function (err) {
                                if (err) throw err;
                                console.log(`Successfully updated ${employee}'s role to ${role}`);
                                start();
                            })
                        })
                    })
                })
        })
    })
}