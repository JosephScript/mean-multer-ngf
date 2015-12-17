var app = angular.module('fileUpload', ['ngFileUpload']);


app.controller('formCtrl', ['$http', 'Upload', '$scope', function($http, Upload, $scope){

  $http.get('/uploads').then(function(response){
    console.log(response.data);
    $scope.uploads = response.data;
  });

  $scope.submit = function(){
    Upload.upload({
      url: '/uploads',
      method: 'post',
      data: $scope.upload
    }).then(function (response) {
      console.log(response.data);
      $scope.uploads.push(response.data);
      $scope.upload = {};
    })
  }
}]);