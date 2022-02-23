const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');
const { prompts } = require('inquirer');

const PORT = process.env.PORT || 3001;

//To hide within env file the sensitive data
require("dotenv").config();

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    console.log(`Connected to the employee_db.`)
);

const select = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "menu",
            message: "Select an option",
            choices: ["View all departments", "Add a department", "View all roles", "Add a role",
                "View all employees", "Add an employee", "Update an employee role", "Exit"]
        },

    ]).then((data) => {
        const choice = data.menu;
        if (choice === "View all departments") {
            return viewDepartments();
        } else if (choice === "Add a department") {
            return addDepartment();
        } else if (choice === "View all roles") {
            return viewRoles();
        } else if (choice === "Add a role") {
            return addRole();
        } else if (choice === "View all employees") {
            return viewEmployees();
        } else if (choice === "Add an employee") {
            return addEmployee();
        } else if (choice === "Update an employee role") {
            return updateRole();
        } else if (choice === "Exit") {
            console.log("Goodbye")
            return inquirer.prompt().ui.close() // To exit out of the prompt menu
        };
    });
};

const viewDepartments = () => {
    const sql = `SELECT department.id AS ID, department.name AS Department FROM department;`;
    db.query(sql, (err, data) => {
        if (err) throw err;
        console.table(data);
        select();
    })
}

const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "New department name",
            name: "department",
            validate: input => {
                if (input) {
                    return true;
                }
                return "Please enter a department name."
            }
        }
    ]).then(data => {
        const newDepartment = data.department;
        const sql = `INSERT INTO department (name) VALUES ("${newDepartment}");`;
        db.query(sql, (err, data) => {
            if (err) throw err;
            console.table(data);
            select();
        });
    });

};

const viewRoles = () => {
    const sql = `SELECT role.id AS ID, role.title AS Title, department.name AS department, role.salary FROM role
    LEFT JOIN department ON role.department_id = department.id;`;
    db.query(sql, (err, data) => {
        if (err) throw err;
        console.table(data)
        select();
    })
}

const addRole = () => {
    const sql = `SELECT id, name from department;`;
    db.query(sql, (err, data) => {
        const departmentList = data.map(({ id, name }) => ({
            name: name,
            value: id
        }));
        inquirer.prompt([
            {
                type: "input",
                message: "Job title",
                name: "title",
                validate: input => {
                    if (isNaN(input)) {
                        return true;
                    }
                    return "Please enter a role title.";
                }
            },
            {
                type: "number",
                message: "Salary",
                name: "salary",
            },
            {
                type: "list",
                message: "Department",
                name: "department",
                choices: departmentList

            }
        ]).then(data => {
            let deptId = data.department;

            const sql = `INSERT INTO role (title, salary, department_id) VALUES ("${data.title}", ${data.salary}, ${deptId});`;
            db.query(sql, (err, data) => {
                if (err) throw err;
                console.table(data);
                select();
            });
        });
    });
}


const viewEmployees = () => {
    const sql = `SELECT employee.id AS ID, employee.first_name AS First, employee.last_name AS Last, role.title AS Title,
    department.name AS Department, CONCAT (manager.first_name, " ", manager.last_name) AS Manager, role.salary as Salary FROM employee 
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
    ; `;
    db.query(sql, (err, data) => {
        if (err) throw err;
        console.table(data)
        select();
    })
}


const addEmployee = () => {

    inquirer.prompt([
        {
            type: "input",
            message: "First name",
            name: "first",
            validate: input => {
                if (isNaN(input)) {
                    return true;
                }
                return "Please enter first name.";
            }
        },
        {
            type: "input",
            message: "Last name",
            name: "last",
            validate: input => {
                if (isNaN(input)) {
                    return true;
                }
                return "Please enter last name.";
            }
        },
    ]).then((data) => {
        const employeeCreate = [data.first, data.last];
        const sql = `SELECT id, title FROM role;`;

        db.query(sql, (err, data) => {
            if (err) throw err;
            const roleList = data.map(({ id, title }) => ({
                name: title,
                value: id
            }));
            inquirer.prompt([

                {
                    type: "list",
                    message: "Job title",
                    name: "title",
                    choices: roleList

                },
            ]).then((data => {
                const title = data.title;
                employeeCreate.push(title);

                const sql = `SELECT id, first_name, last_name from employee;`;
                db.query(sql, (err, data) => {
                    managerList = data.map(({ id, first_name, last_name }) => ({
                        name: first_name + " " + last_name,
                        value: id
                    }));
                    managerList.unshift({
                        name: "None",
                        value: null
                    });
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "Choose manager name",
                            name: "manager",
                            choices: managerList

                        }
                    ]).then(data => {
                        let managerId = data.manager;
                        employeeCreate.push(managerId)

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                            VALUES (?, ?, ?, ?);`
                        db.query(sql, employeeCreate, (err, data) => {
                            if (err) throw err;
                            console.table(data);
                            select();
                        });
                    });
                });
            }));
        });
    });

};



const updateRole = () => {

    const sql = `SELECT id, first_name, last_name from employee;`;
    db.query(sql, (err, data) => {
        const employeeChoice = data.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id
        }));
        inquirer.prompt([
            {
                type: "list",
                message: "Which employee do you want to update?",
                name: "employee",
                choices: employeeChoice
            }
        ]).then((data) => {
            let employeeId = "";
            let roleUpdateId = "";
            employeeId = data.employee

            const sqlRole = `SELECT id, title FROM role;`;
            db.query(sqlRole, (err, data) => {
                const roleChoice = data.map(({ title, id }) => ({ name: title, value: id }));
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Which role do you want to assign this employee?",
                        name: "role",
                        choices: roleChoice
                    }
                ]).then((data) => {
                    roleUpdateId = data.role;
                    updateEmployee()
                })
                const updateEmployee = () => {
                    const sqlUpdate = `UPDATE employee SET role_id = ${roleUpdateId} where id = ${employeeId};`;
                    db.query(sqlUpdate, (err, data) => {
                        if (err) throw err;
                        console.log("Updated employee.");
                        select();
                    })
                }

            })
        })
    })


}


select();

