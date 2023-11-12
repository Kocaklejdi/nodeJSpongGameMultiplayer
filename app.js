const express = require('express');
const app = express();
const server = require('http').Server(app);

app.get('/',(req,res)=>[
    res.sendFile(__dirname + '/client/index.html')
]);
app.use('/client',express.static(__dirname + '/client'));
server.listen(2000);

const SOCKET_LIST = [];
const PLAYER_LIST = [];

class player{
    constructor(id){
        this.id = id;
        this.x = 50;
        this.y = 250;
        this.up = false;
        this.down = false;
        // this.left = false;
        // this.right = false;
        this.speed = 10;
    }
    updatePos(){
        if(this.up){
            this.y -= this.speed;
        }
        if(this.down){
            this.y += this.speed;
        }
        // if(this.left){
        //     this.x -= this.speed;
        // }
        // if(this.right){
        //     this.x += this.speed;
        // }
    }
}

class ball{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.speed = 5
        this.xSpeed = this.speed;
        this.ySpeed = this.speed;
    }
    update(){
        if(this.x < 0 || this.x > 800){
            this.xSpeed *= -1;
        }
        if( this.y < 0 || this.y > 500){
            this.ySpeed *= -1;
        }
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }
    bounce(other){
    if(((this.x -30 < other.x && this.x > other.x)||(this.x + 20 > other.x && this.x < other.x))&& (this.y <= other.y+50 && this.y > other.y-50)){
            this.xSpeed *= -1;
        }
    }
}

const BALL = new ball(400,250);

const io = require('socket.io')(server,{});
let counter = 0;
if(counter < 3){
io.sockets.on('connection',(socket) =>{
    counter++;
    socket.id = Math.random();
    const serxho = new player(socket.id);
    if(counter === 2){
        serxho.x = 750;
    }
    PLAYER_LIST[socket.id] = serxho;
    SOCKET_LIST[socket.id] = socket;
    console.log('socket connection')
    socket.on('disconnect',()=>{
        delete SOCKET_LIST[socket.id]
        delete PLAYER_LIST[socket.id]
        counter--;
    });
    socket.on('keypress',(data)=>{
        // if(data.inputId === 'left'){
        //     serxho.left = data.state;
        // }
        // if(data.inputId === 'right'){
        //     serxho.right = data.state;
        // }
        if(data.inputId === 'down'){
            serxho.down = data.state;
        }
        if(data.inputId === 'up'){
            serxho.up = data.state;
        }
    })
});
}

setInterval(function(){
    const pack = [];
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        player.updatePos();
        BALL.bounce(player);
        pack.push({
            x:player.x,
            y:player.y
        })
    }
    BALL.update();
    pack.push({
        x:BALL.x,
        y:BALL.y
    })
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPos',pack);
        //socket.emit("playerScore",2)
    }
    
},1000/30)