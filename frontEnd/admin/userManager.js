var app = angular.module('umApp', ['ui.router', 'ngResource']);

app.config(function($stateProvider) {
    $stateProvider
        .state('users', {url: '/users', templateUrl: 'list.html', controller: 'UserListCtrl'})
        .state('viewUser', {url: '/users/:id/view', templateUrl: 'view.html', controller: 'UserViewCtrl'})
        .state('newUser', {url: '/users/new', templateUrl: 'create.html', controller: 'UserCreateCtrl'})
        .state('editUser', {url: '/users/:id/edit', templateUrl: 'update.html', controller: 'UserEditCtrl'});
    }).run(function($state) {
        $state.go('users');
});

app.controller('UserListCtrl', function($scope, $state, $window, User) {
  $scope.users = User.query();
  $scope.deleteUser = function(user) {
    user.$delete(function() {
      $window.location.href = '';
    });
  };
});

app.controller('UserViewCtrl', function($scope, $stateParams, User) {
  $scope.user = User.get({ id: $stateParams.id });
})

app.controller('UserCreateCtrl', function($scope, $state, $stateParams, User) {
  $scope.user = new User();
  $scope.addUser = function() {
    $scope.user.$save(function() {
      $state.go('users');
    });
  };
});

app.controller('UserEditCtrl', function($scope, $state, $stateParams, User) {
  $scope.updateUser = function() {
    $scope.user.$update(function() {
      $state.go('users');
    });
  };

  $scope.loadUser = function() {
    $scope.user = User.get({ id: $stateParams.id });
  };

  $scope.loadUser();
});

app.factory('User', function($resource) {
      var APIHOME;
      if (window.location.hostname === 'localhost')
          APIHOME = "http://localhost:8080/admin/";
      else
          APIHOME = "http://goxsa1781:8080/admin/";
      return $resource(APIHOME + 'users/:id', { id: '@_id' }, {
          update: {
              method: 'PUT'
          }
      });
});