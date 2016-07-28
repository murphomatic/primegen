/* primeController.js
 * Prime Generator main controller
 * STM - 07/28/2016
 */

(function () {
    'use strict';

    angular.module('primeApp').controller('primeController', [
        '$scope',
        '$timeout',
        'primeService',
        function ($scope, $timeout, primeService) {
            $scope.model = {
                maxTime: 60, // default 60 seconds
                totalTime: 0,
                maxPrime: 0,
                totalPrimes: 0,
                totalNumbers: 0
            };

            // initial state of various flags.
            $scope.error = "";
            $scope.processing = false;
            $scope.complete = false;

            // bound to the Go! button.
            $scope.calcMaxPrime = function () {
                $scope.processing = true;
                $scope.complete = false;
                $scope.error = "";

                // start the calculates and provide a callback function to shepherd results back to the UI.
                primeService.calcMaxPrime($scope.model.maxTime, updateDisplay).then(
                    function (result) {
                        // final update to UI once promise is resolved.
                        updateDisplay(result);
                        $scope.complete = true;
                        $scope.processing = false;
                    },
                    function (errMsg) {
                        // notify user of error condition upon promise rejection.
                        $scope.error = errMsg;
                        $scope.complete = true;
                        $scope.processing = false;
                    }
                );
            };

            function updateDisplay(result) {
                // Ensure UI is updated with latest data.
                $timeout(function () {
                    $scope.model.totalTime = result.totalTime;
                    $scope.model.maxPrime = result.maxPrime;
                    $scope.model.totalPrimes = result.totalPrimes;
                    $scope.model.totalNumbers = result.totalNumbers;
                });
            }
        }]);
})();