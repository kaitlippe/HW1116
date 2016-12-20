var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 15;


var geometry = new THREE.BoxGeometry(1, 1, 1);
var cube;

var latestAccelData = {
	'accelX': 0,
	'accelY': 0,
	'accelZ': 0
};

var latestOData = {
	'oAlpha': 0,
	'oBeta': 0,
	'oGamma': 0
};

var users = {};

// users['12412341234124323233'].cube.position.set()

var socket = io();

var createCube = function(user) {
	var col = user.cubeColor * 0xffffff;
	var material = new THREE.MeshBasicMaterial({
		color: col,
		wireframe: true
	});


	cube = new THREE.Mesh(geometry, material);
	cube.position.x = user.cubePos.x * 10;
	cube.position.y = user.cubePos.y * 10;
	cube.position.z = user.cubePos.z * 10;
	scene.add(cube);

	return cube;
};

//on('connect') is the built-in event that fires
//when a client successfully connects to server
//socket.on('connect', function(data){
socket.on('welcome message', function(data) {

	users = data.allUsers;
	//users[uniqueUserID] = {};

	for (var socketID in users) {

		users[socketID].cube = createCube(users[socketID]);

		// var col = Math.random() * 0xffffff;
		// var material = new THREE.MeshBasicMaterial({
		// 	color: col,
		// 	wireframe: true
		// });


		// users[socketID].cube = new THREE.Mesh(geometry, material);
		// users[socketID].cube.position.x = Math.random() * 10;
		// users[socketID].cube.position.y = Math.random() * 10;
		// users[socketID].cube.position.z = Math.random() * 10;
		// scene.add(users[socketID].cube);

	};

	console.log(users);

	var uniqueUserID = data.socketID;

	// socket.emit('new cube data', {
	// 	'newUser': users[uniqueUserID]
	// });


});

socket.on('new user', function(data) {
	console.log("NEW USER JOINED");
	users[data.socketID] = data.newUser;
	users[data.socketID].cube = createCube(users[data.socketID]);
});

var intervalTime = 1000;

setInterval(function() {
	socket.emit('incoming data', {
		'latestOData': latestOData,
		'latestAData': latestAccelData
	});

}, intervalTime);



function onOrientationChange(data) {
	latestOData = {
		'oAlpha': data.alpha,
		'oBeta': data.beta,
		'oGamma': data.gamma
	}
}


if (window.DeviceOrientationEvent) {
	window.addEventListener('deviceorientation', onOrientationChange, false);
} else {
	window.alert("ERROR, cannot detect orientation event");
}

function onDeviceMotion(data) {
	latestAccelData = {
		'accelX': data.acceleration.x,
		'accelY': data.acceleration.y,
		'accelZ': data.acceleration.z
	}
}

if (window.DeviceMotionEvent) {
	window.addEventListener('devicemotion', onDeviceMotion, false);
} else {
	console.log("ERROR, cannot detect device motion");
}

scene.add(camera);
// cube.position.set(0,0,0);
function render() {
	requestAnimationFrame(render);

	socket.on('data update', function(data){
		var cubeToUpdate = users[data.socketID].cube;

		if (data.x != null) {
			cubeToUpdate.rotation.x = data.a * 0.05;
			cubeToUpdate.rotation.y = data.b * 0.05;
			cubeToUpdate.rotation.z = data.g * 0.05;

		}

		if (data.x != null) {
			if (data.x > 0.3 || data.x < 0.3) {
				cubeToUpdate.position.x = data.x;
			}
			if (data.y > 0.3 || data.y < 0.3) {
				cubeToUpdate.position.y = data.y;
			}
			if (data.z > 0.3 || data.z < 0.3) {
				cubeToUpdate.position.z = data.z;
			}
		}
	});

	socket.on('orientationMsg', function(data) {

		var cubeToUpdate = users[data.socketID].cube;

		if (data.x != null) {
			cubeToUpdate.rotation.x = data.x * 0.05;
			cubeToUpdate.rotation.y = data.y * 0.05;
			cubeToUpdate.rotation.z = data.z * 0.05;

		}
	});
	socket.on('accelMsg', function(data) {

		var cubeToUpdate = users[data.socketID].cube;

		if (data.x != null) {
			if (data.x > 0.3 || data.x < 0.3) {
				cubeToUpdate.position.x = data.x;
			}
			if (data.y > 0.3 || data.y < 0.3) {
				cubeToUpdate.position.y = data.y;
			}
			if (data.z > 0.3 || data.z < 0.3) {
				cubeToUpdate.position.z = data.z;
			}
		}
	});

	renderer.render(scene, camera);
}

render();