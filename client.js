//const socket = io('http://localhost:3000');

const socket = io.connect('https://game1231.herokuapp.com/', {secure: true});

var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var counter = document.getElementById('counter');
var positionHTML = document.getElementById('position');
var startBtn = document.getElementById('start');
var help = document.getElementById('help');

var LoopSpeed = 10;
var PlayerID;
var counterPlayers = 0;
var SPEED = 4;
var rightPush = 1, leftPush = 1, upPush = 1, downPush = 1;
var centerX = canvas.width/2, centerY = canvas.height/2;
var x = centerX, y = centerY, angle;
var playerWidth = 20, playerHeight = 20, playerCenterW = playerWidth/2, playerCenterH = playerHeight/2;

var LEFT=65, UP=87, RIGHT=68, DOWN=83 , SHIFT=16;
var left = 0, right = 0, up = 0, down = 0, shift = 0;
var dirs = {[LEFT]:0, [UP]:0, [RIGHT]:0, [DOWN]:0, [SHIFT]:0};
var angle = Math.atan2(x, y) / Math.PI * 180;
var Sx, Sy, Mx, My;
var BMx, BMy;
var canvasW =canvas.width , canvasH= canvas.height;
var camera = {
  leftTopPos: { x: 0, y: 0 },
  size: { x: 0, y: 0 },
  scale: 1,
  speed: 4
};

var mouseDown = 0;
var out = 0;
let clientObjects = [];


function updateCameraSize() {
  camera.size = {
    x: canvas.width / camera.scale,
    y: canvas.height / camera.scale,
  };
}

function setFullscreenSize() {
  canvasW = canvas.width = window.innerWidth;
  canvasH = canvas.height = window.innerHeight;
  updateCameraSize();
}

function makeAlwaysCanvasFullscreen() {
  setFullscreenSize();
  window.addEventListener('resize', setFullscreenSize);
}


socket.on('name', function(name) {
		PlayerID = name;
		//console.log(PlayerID);
});
socket.on('reload', function(id){
	if(PlayerID == id){
		window.location.reload();
	}
});



function PlayerControl() {
	
	$(document).keydown(function (e) {
		dirs[e.keyCode] = 1;
	})

	

	$(document).keyup(function (e) {
		dirs[e.keyCode] = 0;
	})
	  
	setInterval(function () {
		left = dirs[LEFT];
		right = dirs[RIGHT];
		up = dirs[UP];
		down = dirs[DOWN];
		shift = dirs[SHIFT];

		//camera.leftTopPos.x -= dirs[LEFT] * camera.speed ;
  		//camera.leftTopPos.x += dirs[RIGHT] * camera.speed;
  		//camera.leftTopPos.y -= dirs[UP] * camera.speed;
  		//camera.leftTopPos.y += dirs[DOWN] * camera.speed;
	}, LoopSpeed)
};


document.onmousemove = function(e){
	let z = window.getComputedStyle(canvas).zoom || 1;     
	Mx = e.pageX/z - e.target.offsetLeft,
	My = e.pageY/z - e.target.offsetTop;
    BMx = e.clientX + x - centerX;	
    BMy = e.clientY + y - centerY;
	//console.log(BMx + " : " + BMy);

}

document.onmousedown = function() { 
    mouseDown = 1;
	
	
}
document.onmouseup = function() {
    mouseDown = 0;
}




		
socket.on('draw', function(players, bullets){
	
	ctx.clearRect(0,0, canvasW,canvasH);
	
	ctx.save();
	ctx.translate(-x+centerX * camera.scale, -y+centerY * camera.scale);

	ctx.scale(camera.scale, camera.scale);

	for (var index = 0; index < bullets.length; ++index){
		ctx.beginPath();
		ctx.arc(bullets[index].x, bullets[index].y, 5, 0, 2 * Math.PI, false);
		ctx.lineWidth = 1;	
		ctx.strokeStyle = 'black';
		//ctx.fillStyle = 'cyan';
		ctx.fill();
		ctx.stroke();
	}

	for (var index = 0; index < players.length; ++index) {
		ctx.beginPath();
		if(PlayerID == players[index].id){
			x = players[index].x;
			y = players[index].y;
		} 
		ctx.save();
		
		var a = players[index].Mx - centerX;
		var b = players[index].My - centerY;

		//console.log("ff " + players[index].Mx + " : " + players[index].My);
		angle = Math.atan2(a, b)* (180 / Math.PI);

		ctx.translate(players[index].x,players[index].y);
		ctx.rotate(-angle * Math.PI / 180);

		ctx.fillRect(-playerCenterW,-playerCenterH, playerWidth, playerHeight);

		ctx.fillRect(players[index].x-players[index].x-5,players[index].y-players[index].y, 10, 15);

		ctx.restore();

		ctx.font = "20px Arial";
		ctx.fillText("HP: " +players[index].health, players[index].x-40, players[index].y-playerHeight); 
		ctx.stroke();

		positionHTML.innerHTML = "players: " + players.length;
		// + "<br />" + JSON.stringify(players);
	}

	for (var i = 0; i <= 2000; i+=40) {
	   ctx.beginPath();
	   ctx.moveTo(0, i);
	   ctx.lineTo(2000, i);
	   ctx.fillStyle = '1a2edb';
	   ctx.strokeStyle = '1a2edb';
	   ctx.fill();
	   ctx.stroke();
		
	}
	for (var i = 0; i <= 2000; i+=40) {
	   ctx.beginPath();
	   ctx.moveTo(i, 0);
	   ctx.lineTo(i, 2000);
	   ctx.fillStyle = '1a2edb';
	   ctx.strokeStyle = '1a2edb';
	   ctx.fill();
	   ctx.stroke();
	}


		for (var index = 0; index < clientObjects.length; ++index) {
			ctx.beginPath();
			ctx.fillStyle = 'black';
			ctx.fillRect(clientObjects[index].x,clientObjects[index].y,clientObjects[index].width,clientObjects[index].height);
			ctx.fill();
			ctx.stroke();
		}
	

	
	


	ctx.restore();
	//positionCameraUpdate();

});

socket.on('objectsUpdate', function(objects){
	/*for (var index = 0; index < objects.length; ++index) {
		var id1 = clientObjects.findIndex(el => el.x === objects[index].x && el.y === objects[index].y);
			if(id1 == -1){
				clientObjects.push({id : objects[index].id, x : objects[index].x, y : objects[index].y, 
								width : objects[index].width, height : objects[index].height
								});
			}
	}*/
	clientObjects = objects;
	console.log(clientObjects);
});

/*function positionCameraUpdate(){
	if(x-camera.leftTopPos.x < centerX-7){

		camera.leftTopPos.x -= 2.5*(centerX/(x-camera.leftTopPos.x));

	}
	if(x-camera.leftTopPos.x > centerX+7){
		camera.leftTopPos.x += 2.5*((x-camera.leftTopPos.x)/centerX);
	}
	if(y-camera.leftTopPos.y < centerY-7){
		camera.leftTopPos.y -= 2.5*(centerY/(y-camera.leftTopPos.y));
	}
	if(y-camera.leftTopPos.y > centerY+7){
		camera.leftTopPos.y += 2.5*((y-camera.leftTopPos.y)/centerY);
	}
}*/

function positionUpdate() {
	const position = {
		id: PlayerID,
		x: x,
		y: y,
		left: left, 
		right: right, 
		up: up, 
		down: down,
		Mx : Mx,
		My : My,
		out : out
	};
	socket.emit('position', position);


	setTimeout(positionUpdate, LoopSpeed);
}

function shooting(){
	if (mouseDown == 1) {
		let mouse = {
			id : PlayerID,
			x : x,
			y : y,
			Sx : x,
			Sy : y,
			Mx: BMx,
			My : BMy,
			velocity : 0
		}
		socket.emit('mouse', mouse);
	}
		
	   
	
	if(shift == 1){
		let coords = {
			id : PlayerID,
			Mx: BMx,
			My : BMy
		}

		socket.emit('object', coords);
	}
	
	
	console.log(shift);
	
	setTimeout(shooting, 200);
}



socket.on('count', function(count) {
	counter.innerHTML = "online: " + count;
	counterPlayers = count;
});



startBtn.addEventListener('click', () => {

	const start = {
		id: PlayerID,
		x: x,
		y: y,
		left: left, 
		right: right, 
		up: up, 
		down: down,
		rightPush : rightPush, 
		leftPush : leftPush, 
		upPush : upPush, 
		downPush : downPush,
		Mx : Mx,
		My : My,

	};
    socket.emit('start', start);
    startBtn.remove();
	help.remove();
    positionUpdate();
	PlayerControl();
	makeAlwaysCanvasFullscreen();
	shooting();
})






