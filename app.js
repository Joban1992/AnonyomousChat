var express =require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static(__dirname+'/public'));

app.get("*", function(req, res){
  res.sendfile('./public/index.html');
})

var setup = {
  rooms: ['General'],
  usersockets: {},
  defaultMessage:{
     
  }
}

io.on('connection', function(socket){
	socket.on('newuser', function(data){
	   console.log('newuser');
	   var room = setup.rooms[setup.rooms.indexOf('General')];
	   data['room'] = room;
	   socket['uderData'] = data;
	   setup.usersockets[data.email] = socket;
	   socket.join(room);
	   data['flag'] = 1;
	   data['action'] = 'joined';
	   io.in(room).emit('onmessage', data);
	})
	
	socket.on('onconversation', function(data){
	   console.log('onconversation');
	   console.log(data);
	   //getting online users
	   if(data.flag==2){
	      var onlineUsers = {};
	      for(user in setup.usersockets){
			  var dummyuser = setup.usersockets[user].uderData;
			  if(data.room==dummyuser.room){
			     onlineUsers[dummyuser.email]={name:dummyuser.name, email:dummyuser.email, active:false, newmsgWhileInactive:false};
			  }
		  }
		  io.in(data.room).emit('onmessage', {flag:2, onlineusers:onlineUsers});
	   }
	   
	   //one to one chat
	   if(data.flag==4){
	     if(data.receiver){
	     console.log('sender :: '+socket.uderData);
		 console.log('receiver :: '+data.receiver.email);
		 data['sender'] = {name: socket.uderData.name, email:socket.uderData.email};
		 data.message['sender'] = {name:socket.uderData.name, email:socket.uderData.email};
	     setup.usersockets[data.receiver.email].emit('onmessage',data);
		 }
	   }
	})
	
	socket.on('disconnect', function(){ 
	 if(socket.uderData){
	  console.log('disconnect :: '+socket.uderData.email);
	  delete setup.usersockets[socket.uderData.email];
	  var data = {
	       flag:3, 
		   userDisconnected: {
		        name : socket.uderData.name,
				email : socket.uderData.email
		   }
		   
		 }
	  io.in(socket.uderData.room).emit('onmessage', data);
	 }
	 
   })
  
})
server.listen(8090);