const express = require('express');
const app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(express.static(__dirname + '/node_modules'));

// app.listen(3000, function() {
// 	console.log('May Node be with you')
// })

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html')
});

io.on('connection', function(client) {
	console.log('client connected...');

	client.on('join', function(data) {
		console.log(data);
		client.emit('messages','Hello from server');
	});

	client.on('messages', function(data) {
		spawnps(client);
		client.emit('broad', data);
		client.broadcast.emit('broad', data);
	});
});

function spawnps(client)
{
	var fdata = "hello";
	var spawn = require("child_process").spawn,child;
	child = spawn("powershell.exe",["./test.ps1"]);
	child.stdout.on("data",function(data){
		 console.log("Powershell Data: " + data);
	    //process.stdout.write(data);
	    client.emit('psmess', data);
	});
	child.stderr.on("data",function(data){
	    console.log("Powershell Errors: " + data);
	});
	child.on("exit",function(){
	    console.log("Powershell Script finished" + fdata);
	    //res.send(fdata)
	});
	child.stdin.end(); 
}

function runps(res)
{
		"use strict";
		const shell = require('node-powershell');
	 
	let ps = new shell({
	  executionPolicy: 'Bypass',
	  noProfile: true
	});
	 
	ps.addCommand('./test.ps1')
	ps.invoke()
	.then(output => {
	  res.send(output);
	})
	.catch(err => {
	  console.log(err);
	  ps.dispose();
	});
}

server.listen(3000);

