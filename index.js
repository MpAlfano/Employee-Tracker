const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');

const PORT = process.env.PORT || 3001;

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'pass',
        database: 'employee_db'
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
                "View all employees", "Add an employee", "Update an employee role"]
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
            name: "department"
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
    inquirer.prompt([
        {
            type: "input",
            message: "Job title",
            name: "title"
        },
        {
            type: "input",
            message: "Salary",
            name: "salary"
        },
        {
            type: "input",
            message: "Department",
            name: "department"
        }
    ]).then(data => {
        const department = data.department;
        let deptId = "";
        db.query(`SELECT name, id from department;`, (err, data) => {
            if (err) throw err;
            console.log(data)
            const deptData = data;
            console.log(deptData);

            for (const dept of deptData) {
                if (dept.name.toLowerCase() === department.toLowerCase()) {
                    deptId = dept.id;
                }
            }
            sendRole()
        })

        const sendRole = () => {
            const sql = `INSERT INTO role (title, salary, department_id) VALUES ("${data.title}", ${data.salary}, ${deptId});`;
            db.query(sql, (err, data) => {
                if (err) throw err;
                console.table(data);
                select();
            });
        }
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
    const sql = `SELECT id, first_name, last_name from employee;`;
    db.query(sql, (err, data) => {
        const managerList = data.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id
        }));
        managerList.unshift({
            name: "None",
            value: null
        })
        inquirer.prompt([
            {
                type: "input",
                message: "First name",
                name: "first"
            },
            {
                type: "input",
                message: "Last name",
                name: "last"
            },
            {
                type: "input",
                message: "Job title",
                name: "title"
            },
            {
                type: "list",
                message: "Choose manager name",
                name: "manager",
                choices: managerList

            }
        ]).then(data => {
            let managerId = data.manager;
            console.log(data.manager)
            const roleTitle = data.title;
            let roleId = "";

            db.query('SELECT id, title FROM role;', (err, data) => {
                if (err) throw err;
                console.log(data)
                const roleData = data;

                for (const role of roleData) {
                    if (role.title.toLowerCase() === roleTitle.toLowerCase()) {
                        roleId = role.id;
                    }
                    console.log(role.title)
                    console.log(roleId)
                }
                sendEmployee()
            })

            const sendEmployee = () => {
                const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
            ("${data.first}", "${data.last}", ${roleId}, ${managerId});`;
                db.query(sql, (err, data) => {
                    if (err) throw err;
                    console.table(data);
                    select();
                });
            }
        });
    });
}


const updateRole = () => {

    const sql = `SELECT id, first_name, last_name from employee;`;
    db.query(sql, (err, data) => {
        const employeeChoice = data.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id
        }));
        console.log(employeeChoice)
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
            console.log(data)
            console.log(data.employee)
            employeeId = data.employee

            console.log(employeeId)
            const sqlRole = `SELECT id, title FROM role;`;
            db.query(sqlRole, (err, data) => {
                const roleChoice = data.map(({ title, id }) => ({ name: title, value: id }));
                console.log(roleChoice)
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Which role do you want to assign this employee?",
                        name: "role",
                        choices: roleChoice
                    }
                ]).then((data) => {
                    roleUpdateId = data.role;
                    console.log(data)
                    console.log(data.role)
                    updateEmployee()
                })
                const updateEmployee = () => {
                    console.log("3")
                    console.log(roleUpdateId)
                    console.log(employeeId)
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

