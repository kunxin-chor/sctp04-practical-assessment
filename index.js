const express = require('express');
const hbs = require('hbs');
const { createConnection } = require('mysql2/promise');

const wax = require('wax-on'); // <-- template inheritance
require('dotenv').config(); // <-- allow access to the env file

// create an express application
const app = express();

// set hbs
app.set('view engine', 'hbs'); // we're using hbs as the view engine
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts'); // tell wax-on where to the find the layout files
// layout files are hbs files that have elements which can be shared among other hbs files

let connection = null; // create an empty variable named connection

// setup form processing
app.use(express.urlencoded({
    extended: false
}))

async function main() {
    // creating a connect is an asynchronous operation
    // -> an async operation is one where NodeJS won't wait for it to finish
    // before executing the next line of code
    connection = await createConnection({
        'host': process.env.DB_HOST,
        'user': process.env.DB_USER,
        'database': process.env.DB_DATABASE,
        'password': process.env.DB_PASSWORD
    });  // createConnection takes a long time to finish
    // usually JS will just skip this line and move on to the next
    // but we don't want so we use await to make sure the connection finishes
    // creating before moving on to the next line

    // we want the connection to the database to be finished before defining the routes

    app.get("/", function (req, res) {
        res.render('home')
    });

    app.get('/test', function (req, res) {
        res.render('test-file');
    });

    app.get('/customers', async function (req, res) {
        // const results = await connection.execute(`
        //     SELECT * FROM Customers
        //         JOIN Companies
        //     ON Customers.company_id = Companies.company_id;
        // `);
        // const customers = results[0];
        
        // Use array destructuring to extract out the first element of the
        // results array into the customers array
        const [customers] = await connection.execute(`
            SELECT * FROM Customers
                JOIN Companies
            ON Customers.company_id = Companies.company_id;
        `);
  

        res.render('customers', {
            'allCustomers': customers
        })

    });

    // one route to display the form
    // one route to process the form
    app.get('/customers/add', async function(req,res){
        // const results = await connection.execute("SELECT * FROM Companies");
        // const companies = results[0];

        const [companies] = await connection.execute("SELECT * FROM Companies");

        res.render('create-customer', {
            'companies': companies
        });
    });

    app.post('/customers/add', async function(req,res) {


        // to extract data from a form, we will
        // use the name of the field as a key in req.body
        const firstName = req.body.first_name;
        const lastName = req.body.last_name;
        const rating = req.body.rating;
        const companyId = req.body.company_id;

        const bindings = [firstName, lastName, rating, companyId]

        // use a prepared statement to insert rows -- a secured way to prevent MySQL injection attacks
        await connection.execute(`INSERT INTO Customers (first_name, last_name, rating, company_id)
  VALUES (?, ?, ?, ? );`, bindings);

  // tell the browser to go a different URL
        res.redirect("/customers");
    })

    // app.get -- implies retriving information
    app.get('/employees', async function(req,res){
        const results = await connection.execute(`SELECT * FROM Employees 
              JOIN Departments
              ON Employees.department_id = Departments.department_id;`);
        // results will be an array of two elements
        // but the rows of all employees is in the first element
        const employees = results[0];
        console.log(employees);
        res.render('employees', {
            "employees":employees,
        });

    });

    // display the form to create a new employee
    app.get('/employees/create', async function(req,res){
        const results = await connection.execute("SELECT * FROM Departments");
        const departments = results[0];

        res.render('create-employee', {
            "departments": departments
        })
    })

    app.post('/employees/create', async function(req,res){
        
        const firstName = req.body.first_name;
        const lastName = req.body.last_name;
        const departmentId  = req.body.department_id;

        const sql = `INSERT INTO Employees (first_name, last_name, department_id)
 VALUES (?, ?, ?);
        `
        const bindings = [firstName, lastName, departmentId]

        await connection.execute(sql, bindings);
        res.redirect("/employees");
    })

    // we must generalize this route so that it works for any employee
    // therefore we need to know which employee is being deleted
    // --> route parameter
    app.get('/employees/:employee_id/delete', async function(req,res){
        try {
            const employeeId = req.params.employee_id;
            const results = await connection.execute(`
                SELECT * FROM Employees WHERE employee_id = ?
            `, [employeeId])
    
            // even when the results only has one row, it still be an array
            // that is, employees will be an array of one result
            const employees = results[0];
    
            const employeeToDelete = employees[0];
            
    
            res.render('delete-employee', {
                "employee": employeeToDelete
            })
        } catch (e) {
            res.send("Unable to process delete");
        }
       
    });

    app.post('/employees/:employee_id/delete', async function(req,res){
        try {
            const employeeId = req.params.employee_id;
            const query = `DELETE FROM Employees WHERE employee_id = ?`;
            await connection.execute(query, [employeeId]);
            res.redirect('/employees');
        } catch (e) {
            console.log(e);
            res.render("error",{
                'errorMessage':'Unable to process delete. Contact admin or try again'
            })
        }
 
    })

    

}
main();






// start the server
app.listen(3000, function () {
    console.log("Server has started")
})

