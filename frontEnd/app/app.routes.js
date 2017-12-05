/**
 * Created by MXG0RYP on 5/13/2016.
 */
(function(){
    angular.module('nextGrid').config(Config);
    
    Config.$inject = [
        '$urlRouterProvider',
        '$stateProvider'
    ];
    
    function Config($urlRouterProvider, $stateProvider){
        $urlRouterProvider.otherwise('/map');
        
        $stateProvider.state('home', {
                url: '/home',
                templateUrl: 'app/components/home/home.view.html',
                controller: 'homeCtrl'
            })
            .state('map', {
                url: '/map',
                templateUrl: 'app/components/map/map.view.html',
                controller: 'myMapCtrl'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'app/components/login/login.view.html',
                controller: 'loginCtrl'
            });
            // .state('home', {
            //     url: '/home',
            //     templateUrl: 'app/components/home/home.view.html',
            //     controller: 'homeCtrl'
            // })

    }
})();