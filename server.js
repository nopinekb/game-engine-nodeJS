const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const server = app.listen(process.env.PORT || 3000)
const io = require('socket.io')(server)


app.get('/', function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.use("/client.js", express.static(__dirname + '/client.js'));

let players = [];
let bullets = [];
var playerWidth = 20;
var playerHeight = 20;
var SPEED = 4;



io.on('connection', (socket) => {


    console.log("\x1b[32m",'A user " ' + socket.id + ' " connected. Now ' + io.engine.clientsCount + ' players');

    socket.emit('name', socket.id);

    socket.on('disconnect', function () {
        console.log("\x1b[31m", 'A user " ' + socket.id + ' " disconnected. Now ' + io.engine.clientsCount + ' players');
        DeletePlayer(socket.id);

    });

    function nowOnline(){
        var count = io.engine.clientsCount;
        socket.emit('count', count);
        setTimeout(nowOnline, 1000);
    }

   function coll(){
        if(players.length > 1){
            for (var index = 0; index < players.length; ++index) {
                for (var index2 = 0; index2 < players.length; ++index2){
                    if(index !== index2){

                        if ((players[index2].x <= players[index].x) && (players[index2].x >= players[index].x - playerWidth) && 
                            (players[index2].y-playerHeight <= players[index].y) && (players[index2].y+playerHeight >= players[index].y)){

                            var ind = 1 - players[index2].x/players[index].x;
                            var endIndex =  Math.floor(ind * 100000) / 100000;

                            if(endIndex != 0){
                                players[index2].rightPush = -endIndex;

                                players[index2].x -= players[index2].right*players[index].rightPush;
                                players[index].x += players[index2].right*players[index].rightPush;

                            }

                            console.log("\x1b[37m", "coll_R: "+ players[index].id + " [ "+ index + " ] - with - [ "+ index2 + " ] " +players[index2].id + " ~~ " + players[index2].rightPush);
                        } 
                        else 
                        {
                            players[index2].rightPush = 1;
                        }
                        ///////
                        if ((players[index2].x >= players[index].x) && (players[index2].x <= players[index].x + playerWidth) && 
                            (players[index2].y+playerHeight >= players[index].y) && (players[index2].y-playerHeight <= players[index].y)){

                            var ind = 1 - players[index].x/players[index2].x;
                            var endIndex =  Math.floor(ind * 100000) / 100000;

                            if(endIndex != 0){
                                players[index2].leftPush = -endIndex;

                                players[index2].x += players[index2].left*players[index].leftPush;
                                players[index].x -= players[index2].left*players[index].leftPush;

                            }

                            console.log("\x1b[37m", "coll_L: "+ players[index].id + " [ "+ index + " ] - with - [ "+ index2 + " ] " +players[index2].id + " ~~ " + players[index2].leftPush);
                        } 
                        else 
                        {
                            players[index2].leftPush = 1;
                        }
                        //////.
                        if ((players[index2].x <= players[index].x + playerWidth) && (players[index2].x >= players[index].x - playerWidth) && 
                            (players[index2].y <= players[index].y) && (players[index2].y >= players[index].y-playerHeight)){

                            var ind = 1 - players[index2].y/players[index].y;
                            var endIndex =  Math.floor(ind * 100000) / 100000;

                            if(endIndex != 0){
                                players[index2].downPush = -endIndex/2;

                                players[index2].y -= players[index2].down*players[index].downPush;
                                players[index].y += players[index2].down*players[index].downPush;
                            }

                            console.log("\x1b[37m", "coll_D: "+ players[index].id + " [ "+ index + " ] - with - [ "+ index2 + " ] " +players[index2].id + " ~~ " + players[index2].downPush);
                        } 
                        else 
                        {
                            players[index2].downPush = 1;

                        }
                        //////.
                        if ((players[index2].x >= players[index].x - playerWidth) && (players[index2].x <= players[index].x + playerWidth) && 
                            (players[index2].y >= players[index].y) && (players[index2].y <= players[index].y + playerHeight)){

                            var ind = 1 - players[index2].y/players[index].y;
                            var endIndex =  Math.floor(ind * 100000) / 100000;

                            if(endIndex != 0){ 
                                players[index2].upPush = endIndex/2;

                                players[index2].y += players[index2].up*players[index].upPush;
                                players[index].y -= players[index2].up*players[index].upPush;
                            }

                            console.log("\x1b[37m", "coll_U: "+ players[index].id + " [ "+ index + " ] - with - [ "+ index2 + " ] " +players[index2].id + " ~~ " + players[index2].upPush);
                        } 
                        else 
                        {
                            players[index2].upPush = 1;

                        }
                    }
                }
            }
        }    
    } 



    function collObj(objectX, objectY, objectW, objectH,PlayerID, playerX, playerY, playerW, playerH){
        //console.log("func - " + playerX + " : " + playerY + " = " + objectX + " : " + objectY);
        let arrives = {
                id: PlayerID,
                collision: false,
                leftPush:1.0,
                rightPush:1.0,
                upPush:1.0,
                downPush:1.0
            };

        if(playerY < objectY+objectH && playerY+playerH > objectY && playerX+playerW > objectX && playerX < objectX+objectW ){
            arrives.collision = true;
            if(playerX+playerW <= objectX+4 || playerX >= objectX+(objectW-4)){    
                if(playerX <= objectX+objectW && playerX >= objectX+playerW){
                    var ind = 1 - playerX/(objectX+(objectW/2));
                    var endIndex =  Math.floor(ind * 100000) / 100000;
                    arrives.leftPush = endIndex;
                }
                else arrives.leftPush = 1;

                if(playerX + playerW >= objectX && playerX <= objectX+objectW-playerW){
                    var ind = 1 - (playerX + playerW)/(objectX+(objectW/2));
                    var endIndex =  Math.floor(ind * 100000) / 100000;
                    arrives.rightPush = endIndex;
                }
                else arrives.rightPush = 1;
            }
            else{
                if (playerY <= objectY + objectH && playerY >= objectY + objectH - playerH){
                    var ind = 1 - (objectY+(objectH/2))/playerY;
                    var endIndex =  Math.floor(ind * 100000) / 100000;
                    arrives.upPush = endIndex;
                }
                else arrives.upPush = 1;

                if (playerY + playerH >= objectY && playerY <= objectY){
                    var ind = 1 - playerY/(objectY+(objectH/2))*2;
                    var endIndex =  Math.floor(ind * 100000) / 100000;
                    arrives.downPush = endIndex;
                }
                else arrives.downPush = 1;

            }

          }
          else arrives.collision = false;

          return arrives;         
    } 
    function collBullet(objectID, objectX, objectY, objectW, objectH,playerID, playerX, playerY, playerW, playerH){
        //console.log(objectX + " : " + objectY + " & " + playerX + " : " + playerY);
        if(objectID !== playerID &&playerY < objectY+objectH && playerY+playerH > objectY && playerX+playerW > objectX && playerX < objectX+objectW ){
            return true;
        }
        else return false;
    }

    function bulletSpeed(Mx, x, My, y){
        let velocity = {
            xVelocity : 0,
            yVelocity : 0,
        }

        var dx = Mx - x;
        var dy = My - y;
        var angle = Math.atan2(dy, dx);
        velocity.xVelocity = SPEED * 2 * Math.cos(angle);
        velocity.yVelocity = SPEED * 2 * Math.sin(angle);
        return velocity;

    }




    function UpdatePlayer(id,x,y,left,right,up,down, Mx, My){
        
         for (var index = 0; index < players.length; ++index) {
            if(players[index].id == id){
                //players[index].x = x;
                //players[index].y = y;
                players[index].left = left;
                players[index].right = right;                
                players[index].up = up;
                players[index].down = down;

                players[index].x -= left;
                players[index].x += right;
                players[index].y -= up;
                players[index].y += down; 

                players[index].Mx = Mx;  
                players[index].My = My;

                //console.log(Mx + " " + My);
            }
            var a  = collObj(300,300,500,50,players[index].id,players[index].x-10,players[index].y-10,20,20);
            //console.log(a);
            if(a.leftPush < 1 || a.rightPush < 1 || a.upPush < 1 || a.downPush < 1){
                players[index].x -= 10*a.leftPush;
                players[index].x += 10*a.rightPush;
                players[index].y -= 10*a.upPush;
                players[index].y += 10*a.downPush;
            }

        }
        for (var index = 0; index < bullets.length; ++index){

                for (var indexP = 0; indexP < players.length; ++indexP){
                    if(players[indexP] !== undefined){
                        if(bullets[index] !== undefined && collBullet(bullets[index].id,bullets[index].x,bullets[index].y,5,5,players[indexP].id,players[indexP].x-10,players[indexP].y-10,20,20)){
                            
                            bullets.splice(index,1);
                            players[indexP].health -= 20;

                            if(players[indexP].health <= 0){
                                console.log("death :" +players[indexP].id)
                                DeletePlayer(players[indexP].id);

                            }
                        }
                        if(bullets[index] !== undefined && collBullet(bullets[index].id,bullets[index].x,bullets[index].y,5,5,0,300,300,500,50)){
                            bullets.splice(index,1);
                        }

                    }
                }
                if(bullets[index] !== undefined && bullets[index].id == id){

                    var bulletS = bulletSpeed(bullets[index].Mx, bullets[index].Sx, bullets[index].My, bullets[index].Sy);
                    
                    
                    //console.log(bullets[index].id + " : " + bulletS.xVelocity + " : " + bulletS.yVelocity);
                    bullets[index].x += bulletS.xVelocity;
                    bullets[index].y += bulletS.yVelocity;

                }           
         }
        
    }


    function deleteBullets() {
        var index = bullets.findIndex(el => el.x <= 0 || el.y <= 0 || el.x >= 2000 || el.y >= 2000);
        if (index !== -1){
            bullets.splice(index,1);
        } 

        for (var indexP = 0; indexP < bullets.length; ++indexP){
            var id1 = players.findIndex(el => el.id === bullets[indexP].id );
            if (id1 == -1){
                bullets.splice(indexP,1);
            }
        }
    }


    function MakePlayer(id,x,y,left,right,up,down,leftPush,rightPush,upPush,downPush, Mx, My, health) {      
        if (players.filter(item=> item.id == id).length == 0){
            players.push({id, x, y, left, right, up, down, leftPush, rightPush, upPush, downPush, Mx, My, health});
        }
    }

    function DeletePlayer(id){
        
        for (var index = 0; index < players.length; ++index) {
             if(players[index].id == id){
                players.splice(index,1);
            }

        }




        socket.emit('reload', id);
    }

    socket.on('position', function(position) {

        UpdatePlayer(position.id,position.x,position.y,
                    position.left,position.right,position.up,position.down,position.Mx,position.My);
        coll();
        deleteBullets()

        socket.emit('draw', players, bullets);
    });

    socket.on('mouse', function(mouse){
        bullets.push(mouse);
        //console.log(bullets);

    });
    /*function clearBullets(){
        bullets.shift
        setTimeout(clearBullets, 10000);
    }*/




    socket.on('start', function(start) {
        MakePlayer(start.id,start.x,start.y,
                    start.left,start.right,start.up,start.down,
                    start.leftPush,start.rightPush,start.upPush,start.downPush,start.Mx,start.My,start.health)
    });


    nowOnline() ;    
       
            
});

