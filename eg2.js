const express = require('express');
const oracle = require('oracledb');

const app = express();
const port = 3000;

class Employee {
constructor(id, firstName, lastName) {
this.id = id;
this.firstName = firstName;
this.lastName = lastName;
}
getId() {
return this.id;
}
getFirstName() {
return this.firstName;
}
getLastName() {
return this.lastName;
}
}


app.use(express.static('learn'));

app.get('/', function(request, response) {
response.redirect('/index.html');
});


app.get('/employees', async function(request, response) {

var connection = null;
connection = await oracle.getConnection({
'user': 'hr',
'password': 'pass',
'connectionString': 'localhost:1521/xepdb1'
});

var resultSet = await connection.execute('Select employee_id, first_name, last_name from employees');

var html = "";

html = html + "<!DOCTYPE HTML>";
html = html + "<html>";
html = html + "<head>";
html = html + "<meta charset='utf-8'>";
html = html + "<title>HR-Application</title>";
html = html + "<style>";
html = html + "table {";
html = html + "border: 1px solid black;";
html = html + "border-collapse: collapse;";
html = html + "}";
html = html + "table th, td {";
html = html + "border: 1px solid black;";
html = html + "}";
html = html + "</style>";
html = html + "</head>";
html = html + "<body>";
html = html + "<table>";
html = html + "<thead>";
html = html + "<tr>";
html = html + "<th>S.No</th>";
html = html + "<th>Id</th>";
html = html + "<th>First Name</th>";
html = html + "<th>Last Name</th>";
html = html + "</tr>";
html = html + "</thead>";
html = html + "<tbody>";

for(var i=0; i<resultSet.rows.length; i++) {

html = html + "<tr>";
html = html + "<td>";
html = html + (i+1);
html = html + "</td>";
html = html + "<td>";
html = html + resultSet.rows[i][0];
html = html + "</td>";
html = html + "<td>";
html = html + resultSet.rows[i][1];
html = html + "</td>";
html = html + "<td>";
html = html + resultSet.rows[i][2];
html = html + "</td>";
html = html + "</tr>";

}

html = html + "</tbody>";
html = html + "</table>";
html = html + "<a href='/'>Home</a>"; 
html = html + "</body>";
html = html + "</html>";

await connection.close();
response.send(html);
});


app.get('/getEmployees', async (request, response) => {
var connection = null;
connection = await oracle.getConnection({
"user": "hr",
"password": "pass",
"connectionString": "localhost:1521/xepdb1"
});
var resultSet = await connection.execute("select employee_id, first_name, last_name from employees");
var employees = [];
var i=0;
var emp;
var id, first_name, last_name;
while(i<resultSet.rows.length) {
id = resultSet.rows[i][0];
firstName = resultSet.rows[i][1];
lastName = resultSet.rows[i][2];
emp = new Employee(id, firstName, lastName);
employees.push(emp);
i++;
}

await connection.close();
response.send(employees);
})


app.get('/getFirstNames', async (request, response) => {


var connection = await oracle.getConnection({
'user': 'hr',
'password': 'pass',
'connectionString': 'localhost:1521/xepdb1'
});

var resultSet = await connection.execute(`select first_name from employees where first_name like 'A%'`)

var names = [];
for(var row of resultSet.rows) {
names.push(row[0]);
}

console.log(names)

await connection.close();

response.send(names);

})


app.listen(port, function(err) {
if(err) 
console.log(`Some error occured  ${err}`);
else
console.log(`Server started listening on port ${port}`);
})
