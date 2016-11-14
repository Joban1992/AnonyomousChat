angular.module('app.services',[])
 .service('$socketservice', function($rootScope){
    var $socketservice = {};
	$socketservice.userSocket=io('http://localhost:8090/');
	
	//setup your socket service
	
	$socketservice.setupforUser = function(data){
	  console.log('emit');
	  $socketservice.userSocket.emit('newuser', data);
	}
	
	$socketservice.getOnlineUsers = function(room){
	  var data = {flag:2, action:'getonlineuser', room:room};
	  $socketservice.sendMessages(data);
	}
	
	//common conversation
	$socketservice.sendMessages = function(data){
	  $socketservice.userSocket.emit('onconversation', data);
	}

	$socketservice.userSocket.on('onmessage', function(data){
		$rootScope.$broadcast('onmessage', data);
	});
	
	
	
    return $socketservice;
 })