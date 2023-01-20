const express = require('express');
const oracle = require('oracledb')
const bodyParser = require('body-parser');
const res = require('express/lib/response');
const e = require('express');

const port = 3000;
const app = express();

const urlEncodedBodyParser = bodyParser.urlencoded({extended: false});

const timePass = (ms) => {
  let promise = new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
  return promise;
}

class Department {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Employee {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class EmployeeDetail {
  constructor(id, name, email, phone, joinDate, jobId, salary) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.joinDate = joinDate;
    this.jobId = jobId;
    this.salary = salary;
  }
}

app.use(express.static('learn'));

app.get('/getDepartments', async (request, response) => {
  //await timePass(3000);
  let connection = null;
  let departments = [];
  connection = await oracle.getConnection({
    connectionString: "localhost:1521/xepdb1",
    user: 'hr',
    password: 'pass'
  })

  let resultSet = await connection.execute(`select department_id, department_name from departments`)

  for(row of resultSet.rows) {
    let id = row[0];
    let name = row[1];
    departments.push(new Department(id, name));
  }

  response.send(departments);

})

app.get('/getDepartmentEmployees', urlEncodedBodyParser, async (request, response) => {
  await timePass(3000);
  const departmentId = request.query.departmentId;
  console.log(departmentId)
  let employees=[];

  let connection = await oracle.getConnection({
    user: 'hr',
    password: 'pass',
    connectionString: 'localhost:1521/xepdb1'
  })

  let resultSet = await connection.execute(`select employee_id, first_name, last_name from employees where department_id=${departmentId}`);

  if(resultSet.rows.length == 0) {
    response.sendStatus(404);
    connection.close();
    return;
  }

  for(row of resultSet.rows) {
    let id = row[0];
    let firstName = row[1];
    let lastName = row[2];
    employees.push(new Employee(id, firstName+" "+lastName));
  }
  response.send(employees);
})

app.get('/getEmployeesByDepartmentId', urlEncodedBodyParser, async (request, response) => {
  // await timePass(3000);
  const departmentId = request.query.departmentId;
  console.log(departmentId)
  let employees=[];

  let connection = await oracle.getConnection({
    user: 'hr',
    password: 'pass',
    connectionString: 'localhost:1521/xepdb1'
  })
  let resultSet = await connection.execute(`select * from employees where department_id=${departmentId}`);

  for(row of resultSet.rows) {
    let id = row[0];
    let firstName = row[1];
    let lastName = row[2];
    let email = row[3];
    let phone = row[4];
    let joinDate = row[5];
    let jobId = row[6];
    let salary = row[7];
    employees.push(new EmployeeDetail(id, firstName+" "+lastName, email, phone, joinDate, jobId, salary));
  }
  
  response.send(employees);

})


app.get('/getEmployeeById', urlEncodedBodyParser, async (request, response) => {
  // await timePass(3000);
  const employeeId = request.query.employeeId;
  console.log(employeeId)
  
  let connection = await oracle.getConnection({
    user: 'hr',
    password: 'pass',
    connectionString: 'localhost:1521/xepdb1'
  })
  let resultSet = await connection.execute(`select * from employees where employee_id=${employeeId}`);

  if(resultSet.rows.length == 0) {
    response.sendStatus(404);
    connection.close();
    return;
  }
  let row = resultSet.rows[0];
  let id = row[0];
  let firstName = row[1];
  let lastName = row[2];
  let email = row[3];
  let phone = row[4];
  let joinDate = row[5];
  let jobId = row[6];
  let salary = row[7];
  let employee  = new EmployeeDetail(id, firstName+" "+lastName, email, phone, joinDate, jobId, salary);

  console.log(employee);

  response.send(employee);

})

class City {
  constructor(id, name, sortOrder) {
    this.id = id;
    this.name = name;
    this.sortOrder = sortOrder;
  }
}

let cities = [];

app.get("/getCities", async (request, response) => {
  cities = [];
  let connection = await oracle.getConnection({
    user: "hr",
    password: "pass",
    connectionString: "localhost:1521/xepdb1"
  })

  let resultSet = await connection.execute("select * from cities order by sort_order")
  console.log(resultSet)
  if(resultSet.rows.length == 0) {
    response.send("No Data Available")
    connection.close();
    return;
  }

  for(row of resultSet.rows) {
    let id = row[0];
    let name = row[1];
    let sortOrder = row[2];
    let city = new City(id, name, sortOrder);
    cities.push(city);
  }
  response.send(cities)
  connection.close();
})

app.get("/updateCityOrder", urlEncodedBodyParser, async(request, response) => {

  let connection = await oracle.getConnection({
    user: "hr",
    password: "pass",
    connectionString: "localhost:1521/xepdb1"
  })

  let startIdx = +request.query.start;
  let endIdx = +request.query.end;
  if(startIdx < endIdx) {
    let tmp = cities[startIdx]
    for(let i=startIdx; i<endIdx; i++) {
      cities[i+1].sortOrder = i+1;
      cities[i] = cities[i+1];
    }
    tmp.sortOrder = endIdx+1;
    cities[endIdx] = tmp;     
  } else if(startIdx > endIdx) {
    let tmp = cities[startIdx];
    for(let i=startIdx; i>endIdx; i--) {
      cities[i-1].sortOrder = i+1;
      cities[i] = cities[i-1];      
    }
    tmp.sortOrder = endIdx+1;
    cities[endIdx] = tmp;
  }

  for(let city of cities) {
    console.log(`update cities set sort_order=${city.sortOrder} where name='${city.name}'`)
    await connection.execute(`update cities set sort_order=${city.sortOrder} where name='${city.name}'`);
  }

  response.sendStatus(200)
  connection.commit();
  connection.close();
})

app.get("/getAllSubjects", async (request, response) => {
  let connection = await oracle.getConnection({
    user: "hr",
    password: "pass",
    connectionString: "localhost:1521/xepdb1"
  })

  let subjects = [];
  
  let resultSet = await connection.execute("select * from subjects")
  for(let row of resultSet.rows) {
    subjects.push(row[0]);
  }
  console.log("Subjects : " + subjects);

  let selectedSubjects = [];
  resultSet = await connection.execute("select * from selected_subjects");
  for(let row of resultSet.rows) {
    selectedSubjects.push(row[0])
  }
  console.log("Selected subjects : " + selectedSubjects);

  response.send({
    subjects,
    selectedSubjects
  })
  connection.close();
})

app.get("/addSubject", urlEncodedBodyParser, async(request, response) => {
  let connection = await oracle.getConnection({
    user: "hr",
    password: "pass",
    connectionString: "localhost:1521/xepdb1"
  })

  let table = request.query.list;
  let subject = request.query.subject;

  if(!table || !subject) {
    response.send("Incorrect request");
    connection.close();
    return;
  }
  let resultSet = await connection.execute(`insert into ${table} values ('${subject}')`)
  console.log(resultSet)
  if(table === "subjects") {
    console.log('deleting')
    resultSet = await connection.execute(`delete from selected_subjects where name = '${subject}'`)
  } else {
    resultSet = await connection.execute(`delete from subjects where name = '${subject}'`)
  }
  console.log(resultSet);
  connection.commit();
  response.send(true)

})

class Team {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

app.get("/getTeams", async (request, response) => {
  let connection = await oracle.getConnection({
    user: "hr",
    password: "pass",
    connectionString: "localhost:1521/xepdb1"
  })

  let resultSet = await connection.execute('select * from teams order by id')
  let teams = [];
  for(let row of resultSet.rows) {
    let id = row[0]
    let name = row[1];
    teams.push(new Team(id, name));
  }
  response.send(teams);
})

class Player {
  constructor(id, name, teamId) {
    this.id = id;
    this.name = name;
    this.teamId = teamId;
  }
}

app.get("/getPlayers", async (request, response) => {
  let connection = await oracle.getConnection({
    user: "hr",
    password: "pass",
    connectionString: "localhost:1521/xepdb1"
  })

  let resultSet = await connection.execute('select * from players order by id')
  let players = [];
  for(let row of resultSet.rows) {
    let id = row[0]
    let name = row[1];
    let teamId = row[2];
    players.push(new Player(id, name, teamId));
  }
  response.send(players);
})

app.get("/updatePlayer", urlEncodedBodyParser, async(request, response) => {
  console.log("Updating player")
  let connection = await oracle.getConnection({
    user: "hr",
    password: 'pass',
    connectionString: "localhost:1521/xepdb1"
  })

  let playerId = request.query.playerId
  let newTeamId = request.query.newTeamId
  if(newTeamId === 'players') newTeamId = null;
  let resultSet = await connection.execute(`update players set team_id=${newTeamId} where id=${playerId}`)
  connection.commit();
  connection.close();
  console.log(resultSet)
  response.send("Done")
})

app.get("/getAllEmployees", async(request, response) => {
  console.log("Fetching All Employees");
  let connection = await oracle.getConnection({
    user: 'hr',
    password: 'pass',
    connectionString: 'localhost:1521/xepdb1'
  })

  let resultSet = await connection.execute(`select employee_id, first_name, last_name from employees`)

  class Employee {
    constructor(id, firstName, lastName) {
      this.id = id;
      this.firstName = firstName;
      this.lastName = lastName;
    }
  }

  let employees = [];
  for(let row of resultSet.rows) {
    let id = row[0];
    let firstName = row[1];
    let lastName = row[2];
    employees.push(new Employee(id, firstName, lastName));
  }  

  response.send(employees);

})

app.get("/addEmployee", urlEncodedBodyParser, (request, response) => {
  const id = request.query.id;
  const name = request.query.name;
  const designation = request.query.designation;
  const salary = request.query.salary;
  const gender = request.query.gender;
  console.log("Id : " + id)
  console.log("Name : " + name)
  console.log("Designation : " + designation)
  console.log("Salary : " + salary)
  console.log("Gender : " + gender)

  response.send(`

    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      Done <br/>
      <a href="/">Home</a> 
    </body>
    </html>
  `)
})


app.get("/checkUsernameValidForRegistration", function(request, response) {
  var username = request.query.name;
  console.log(username)
  var usersInDB = ["Harsh","Yash","Pawan","Lucky","Adarsh"];
  if(usersInDB.find(el => el == username)) {
    response.send(false);
    return;
  }
  response.send(true);
})

app.listen(port, function(err) {
  if(err) {
    console.log(err)
  }
  console.log("Server is ready to listen request at port " + port);
})