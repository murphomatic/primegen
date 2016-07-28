/* primeController.js
 * Prime Generator main controller
 * STM - 07/28/2016
 */

(function () {
    'use strict';

    angular.module('primeApp').controller('primeController', [
        '$scope',
        'primeService',
        function ($scope, primeService) {
            $scope.model = {
                maxTime: 60, // default 60 seconds
                totalTime: 0,
                maxPrime: 0,
                totalPrimes: 0,
                totalNumbers: 0
            };

            $scope.error = "";
            $scope.processing = false;
            $scope.complete = false;

            $scope.calcMaxPrime = function () {
                $scope.processing = true;
                $scope.complete = false;
                $scope.error = "";  
                primeService.calcMaxPrime($scope.model.maxTime).then(
                    function (result) {
                        $scope.model.totalTime = result.totalTime;
                        $scope.model.maxPrime = result.maxPrime;
                        $scope.model.totalPrimes = result.totalPrimes;
                        $scope.model.totalNumbers = result.totalNumbers;
                        $scope.complete = true;
                        $scope.processing = false;
                    },
                    function (errMsg) {
                        $scope.error = errMsg;
                        $scope.complete = true;
                        $scope.processing = false;
                    }
                );
            };
        }]);
})();