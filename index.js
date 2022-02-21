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

}


const viewEmployees = () => {
    const sql = `SELECT employee.id AS ID, employee.first_name AS First, employee.last_name AS Last, role.title AS Title,
    department.name AS department, manager.first_name AS Managers, role.salary as Salary FROM employee 
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




select();