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
    })
}

function viewAllEmployeesByRole() {
    var query =
        `SELECT DISTINCT title FROM role`
    connection.query(query, function (err, res) {
        if (err) throw err;
        roles = [];
        for (i in res) {
            roles.push(res[i].title)
        }
        console.log(roles);
        inquirer
            .prompt({
                name: "role",
                type: "rawlist",
                message: "Which role would you like to search for?",
                choices: roles
            })
            .then(function (answer) {
                selectedRole = answer.role;
                console.log(selectedRole);
                connection.query(`SELECT id FROM role WHERE title='${selectedRole}'`, function (err, res) {
                    if (err) throw err;
                    var selectedRole_id = res[0].id;
                    console.log(selectedRole_id);
                    query =
                        `SELECT employees1.id AS id, employees1.first_name, employees1.last_name, role.title, department.name AS department, role.salary, CONCAT (employees2.first_name, " ", employees2.last_name) AS manager
                        FROM employees AS employees1
                        INNER JOIN role ON role.id=employees1.role_id
                        INNER JOIN department ON role.department_id=department.id
                        LEFT JOIN employees AS employees2 ON employees1.manager_id=employees2.id
                        WHERE employees1.role_id=${selectedRole_id}`
                    connection.query(query, function(err, res) {
                        if (err) throw err;
                        console.table(res);
                    })
                })
            })
    });
}