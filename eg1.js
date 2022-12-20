const express = require('express');
// A reference of a function is stored in the express variable.

const app = express();
// We are calling the function, and that function returns an object which is being assigned to the app variable.

const port = 3000;

app.get('/', function(reques, response) {
response.send("Learning JQuery");
});
// Whenever a request arrives without any resource name, this anonymous function will get executed.
// We are calling get function of the object which is being refernced by app reference variable, and we are passing it the reference of an anonymous function which will be executed if the requested URL and the specified URL matches.

app.listen(port, function(err) {
if(err) {
console.log(`Some problem occured ${err}`);
}
console.log(`Server is ready and listening on port number ${port}`);
});
// app.listen is function which will bind our server to the specified port number, and our server will start listening on that port.
// The anonymous function will get executed, if any error occurs while starting the server it will be passed as argument to this anonymous function.
// And if no error occurs while starting the server this function will still execute, but null will be passed as argument.