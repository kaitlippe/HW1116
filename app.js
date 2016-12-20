var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 9000;
var io = require('socket.io')(server);

app.use('/', express.static(__dirname + '/public'));

var users = {};

function serverUpCallBack() {
	console.log("listening on port: " + port);
}

function createUser(socketID) {

	var adjustedRandom = function(){
		return Math.random()*2-1;
	};

	users[socketID] = {
		cubePos: {
			'x': adjustedRandom(),
			'y': adjustedRandom(),
			'z': adjustedRandom()
		},
		cubeColor: Math.random()
	};
}

function incomingSocket(socket) {
	console.log('user connected with socket ID ' + socket.id);

	createUser(socket.id);

	clientStartData = {
		'start': 'generateCube',
		'socketID': socket.id,
		'allUsers': users
	};

	socket.emit('welcome message', clientStartData);

	io.emit('new user', {
		newUser: users[socket.id],
		socketID: socket.id
	});



	// socket.on('new cube data',function(data){
	// 	users[socket.id] = data.newUser;

	// 	io.emit('new user joined', {
	// 		user: users[socket.id],
	// 		socketID: socket.id
	// 	});
	// });

	socket.on('incoming data', function(data) {
		var dataFromServer = {
			'a': data.latestOData.oAlpha,
			'b': data.latestOData.oBeta,
			'g': data.latestOData.oGamma,
			'x': data.latestAData.accelX,
			'y': data.latestAData.accelY,
			'z': data.latestAData.accelZ,
			'socketID': socket.id
		};
		console.log("Orientation: ");
		console.log(dataFromServer);
		io.emit("data update", dataFromServer);
	})

	socket.on('incoming oData', function(data) {
		var dataFromServer = {
			'x': data.oAlpha,
			'y': data.oBeta,
			'z': data.oGamma,
			'socketID': socket.id
		};
		console.log("Orientation: ");
		console.log(dataFromServer);
		io.emit("orientationMsg", dataFromServer);
	})

	socket.on('incoming accelData', function(data) {
		var dataFromServer = {
			'x': data.accelX,
			'y': data.accelY,
			'z': data.accelZ,
			'socketID': socket.id
		};
		console.log("Accel: ");
		console.log(dataFromServer);
		io.emit("accelMsg", dataFromServer);
	})
}

io.on('connection', incomingSocket);

server.listen(port, serverUpCallBack);