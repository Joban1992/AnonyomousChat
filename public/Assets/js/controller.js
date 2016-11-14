angular.module("app.controllers",[])
  .controller('mainCntrl', function(){
    console.log("main cntrl");
  })
  
  .run(function($socketservice, $window, $document){
    //initilise $socketservice
	  $window.onfocus = function(){
		var textArea = document.getElementById('texxt');
		if(textArea){
		  document.getElementById('texxt').focus();
		}
     }
  })
  
  .controller('loginCntrl', function($scope, $state, $socketservice){
    console.log("loginCntrl");
    $scope.init= function(){
	  $scope.loginData = {
	    username:null,
		email:null
	  }
	}
	
	$scope.doLogin = function(){
	  console.log('Login', $scope.loginData);
	  //console.log($filter('date')(new Date(),'y-m');
	  var userdata = {name:$scope.loginData.username, email:$scope.loginData.email, logintime:new Date().getTime()}
	  var data = {userdata:userdata};
	  localStorage.setItem('chatBox',angular.toJson(data));
	  $state.go('home');
	}
	
    $scope.init();	
  })
  
  .controller('homeCntrl', function($scope, $state, $socketservice, $timeout, $compile, $filter){
    console.log("homeCntrl");
	
    $scope.init= function(){
	   $scope.serachUser = {
	     name:'',
		 email:''
	   }
	   $scope.chatBoxOpened = false;
	   $scope.receiver = null;
	   $scope.notification = {
	      username:'',
		  message:'',
		  showHide:false
	   }
	   if(localStorage.getItem('chatBox')!=null){
	     $scope.userdetails = angular.fromJson(localStorage.getItem('chatBox')).userdata;
	     $socketservice.setupforUser(angular.fromJson(localStorage.getItem('chatBox')).userdata);
	     // General name of the room from where you want to ge online users
	     // in future rooms can be increase
	     $socketservice.getOnlineUsers('General');
	   }else{
	     $state.go('login');
	   }
	}
	
	$scope.$on('onmessage', function(event, data){
	  console.log('$scope.onmessage');
	  console.log(data)
	   //new user joined
	  if(data.flag==1){
	    console.log('new user joined');
		if(data.email != $scope.userdetails.email){
		   $scope.notification = {
	         username:data.name,
		     message:'has joined',
		     showHide:true
	       }
		   $timeout(function(){$scope.notification.showHide=false;},3000)
		 }
		
	  }
	  if(data.flag==2){
	    console.log('get online user');
		console.log(data.onlineusers)
		$scope.$apply(function(){
		   $scope.onlineUsers = data.onlineusers;
		})
	  }
	  if(data.flag==3){
	    console.log('delete user');
		if(data.userDisconnected.emaill != $scope.userdetails.email){
		   $scope.notification = {
	         username:data.userDisconnected.name,
		     message:'has disconnected',
		     showHide:true
	       }
		  
		 }
		for(var key in $scope.onlineUsers){
		   console.log($scope.onlineUsers[key].email +"=="+ data.userDisconnected.email)
		  if($scope.onlineUsers[key].email == data.userDisconnected.email){
		    console.log('removing user:: '+data.userDisconnected.email)
			$scope.$apply(function(){
		      delete $scope.onlineUsers[key];//$scope.onlineUsers.splice(i,1); 
			})
		  }
		}
		console.log(data.userDisconnected.email +"----"+ $scope.receiver.email)
		if(data.userDisconnected.email == $scope.receiver.email){
		  $scope.chatBoxOpened = false;
		}
		 $timeout(function(){$scope.notification.showHide=false;},3000)
	  }
	  
	  if(data.flag==4){
	    console.log(data);
		var userObj = $scope.onlineUsers[data.sender.email];
		if(!userObj.msg){
		  $scope.$apply(function(){
		    userObj.msg = [data.message];
		  });
		}else{
		  $scope.$apply(function(){
		    userObj.msg.push(data.message);
		  })
		}
		
		if($scope.receiver && $scope.receiver.email == data.sender.email){
		  console.log('Message from current active user');
		}else{
		  console.log('Other user meesage');
		  userObj.active = false;
		  userObj.newmsgWhileInactive = true;
		 $scope.$apply(function(){
		    $scope.onlineUsers[data.sender.email] = userObj;
		 })
		  
		  console.log($scope.onlineUsers);
		}

				
		var objDiv = document.getElementById("chatMessages");
		console.log(objDiv.scrollHeight);
        objDiv.scrollTop = objDiv.scrollHeight;
	  }
	});
	
	$scope.startChat = function(user){
	  $scope.chatBoxOpened = true;
	  console.log('Starting chat with :: ',user);
	  for(var key in $scope.onlineUsers){   
		$scope.onlineUsers[key].active = false;	  
	  } 
	  user.active = true;
	  user.newmsgWhileInactive = false;
	  if(!user.msg){
	    user['msg'] = [];
	  }
	  $scope.onlineUsers[user.email] = user;
	  $scope.receiver = user;
	  
	}
	
	$scope.sendChatMessage = function(e){
	   if(e.keyCode==13){
	   var time = $filter('date')(new Date(),'hh::mm a');
	   var data = {
	     flag:4,
		 receiver:{name:$scope.receiver.name, email:$scope.receiver.email},
		 message:{msg:$scope.usermessage, time:time}
	   }
	   console.log($scope.receiver," rec");
	   console.log($scope.onlineUsers[$scope.receiver.email])
	   
	   $scope.onlineUsers[$scope.receiver.email].msg.push({msg:$scope.usermessage, sender:{name:$scope.userdetails.name, email:$scope.userdetails.email}, time:time})

	   $scope.usermessage="";
	   $socketservice.sendMessages(data);
	   var objDiv = document.getElementById("chatMessages");
	   console.log(objDiv.scrollHeight);
	   setTimeout(function(){objDiv.scrollTop = objDiv.scrollHeight;},0);
        //objDiv.scrollTop = (objDiv.scrollHeight+350);
		 e.preventDefault();
	  }
	}
	
    $scope.init();	
  })
  .filter('myfilter', function(){
    return function(items, deleuseremail){
	   var filtered = [];
	   var userdetails = null;
	   if(localStorage.getItem('chatBox')!=null){
	      userdetails = angular.fromJson(localStorage.getItem('chatBox')).userdata ||{};
	   }
	   angular.forEach(items, function(item) { 
        if(item.email != userdetails.email) {
          filtered.push(item);
        }
      });
	  return filtered;
	}
  })
  
 