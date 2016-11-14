var app = angular.module('myapp',[ 'ui.router', 'app.controllers', 'app.services']);
window.onload= function(){
  localStorage.removeItem('chatBox');
 // location.hash="#/login";
}


app.config(function($stateProvider, $httpProvider){

$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'; 
  $stateProvider
  .state('login',{
    url:'/login',
	templateUrl:'Assets/pages/login.html',
	controller:'loginCntrl'
  })
  .state('home',{
    url:'/home',
	templateUrl:'Assets/pages/home.html',
	controller:'homeCntrl'
  })
  .state('dummy',{
    url:'/dummy',
	templateUrl:'Assets/pages/dummy.html',
	controller:''
  })
})

