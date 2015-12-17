var app = angular.module('fileUpload', ['ngFileUpload']);

app.controller('filesCtrl', ['$http', '$scope', function($http, $scope){
  $http.get('/uploads').then(function(response){
    $scope.uploads = response.data;
  })
}]);

app.controller('formCtrl', ['$http', '$scope', function($http, $scope){
  $scope.submit = function(){
    console.log($scope.upload);
  }
}]);