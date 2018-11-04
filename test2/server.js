var http = require('http');
var app = require('./app');

console.log('Server started at port: 3000');
http.createServer(app.handleRequest).listen(3000);