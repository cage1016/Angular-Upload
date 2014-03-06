angular.module('upload', ['upload.controller', 'bs.plupload'])
    .run(['$rootScope', function ($rootScope) {
        $rootScope.$safeApply = function ($scope, fn) {
            $scope = $scope || $rootScope;
            fn = fn || function () { };
            if ($scope.$$phase) {
                fn();
            }
            else {
                $scope.$apply(fn);
            }
        };
    }]);

angular.module('upload.controller', [])
    .controller('IndexCtrl', ['$scope', function ($scope) {
        $scope.uploadAction = '/File/Upload';
        //$scope.folder = $routeParams.folder || '';
    }]);
