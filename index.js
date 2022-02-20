const inquirer = require('inquirer');
const mysql = require('mysql2');
const console = require('console.table');

const PORT = process.env.PORT || 3001;

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'pass',
        database: 'employee_db'
    },
    console.log('Connected to the employee_db')
)


const select = () => {
    return inquirer.prompt([
        {
            type: "list",
            name: "menu",
            message: "Select an option",
            Choices: ["View all departments", "Add a department", "View all roles", "Add a role",
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

const viewDepartments= () => {
    const sql = `SELECT department.id AS ID, department.name AS Department FROM department;`;
    db.query(sql, (err, data) => {
        if (err) throw err;
        console.table(data);
        select();
    })
}

const addDepartment = () => {

}



select();