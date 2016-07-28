
(function () {
    'use strict';

    angular.module('primeApp').factory('primeService', [
        '$q',
        '$timeout',
        function ($q, $timeout) {
            return {
                calcMaxPrime: function (timeLimit) {
                    var deferred = $q.defer();

                    $timeout(function () {
                        try {
                            if (isNaN(timeLimit)) throw { message: "You must provide a valid time in seconds." };
                            if (timeLimit < 1 || timeLimit > 60) throw { message: "Please choose a time between 1 and 60 seconds." };
                            var startTime = new Date();
                            var primes = [];
                            var currentNum = 1;
                            var currentTime = new Date();
                            var maxTime = (timeLimit * 1000) - 1;  // give 1ms to finish up.

                            // increment the test and check primality for X seconds.
                            while (currentTime - startTime <= maxTime) {
                                if (isPrime(currentNum)) {
                                    // stash the prime and advance the test by two (since there are never two+ primes in a row except 1,2,3)
                                    primes.push(currentNum);
                                    if (currentNum >= 3) {
                                        currentNum += 2;
                                    }
                                    else {
                                        currentNum++;
                                    }
                                }
                                else {
                                    currentNum++;
                                }
                                currentTime = new Date();
                            }

                            var endTime = new Date();
                            deferred.resolve({
                                totalTime: (endTime - startTime),
                                maxPrime: primes[primes.length - 1],
                                totalPrimes: primes.length,
                                totalNumbers: currentNum - 1
                            });
                        }
                        catch (exception) {
                            deferred.reject(exception.message);
                        }

                        function isPrime(test) {
                            if (test == 1) return true;

                            // quick-check first 1000 primes to see if test is a composite -
                            for (var i = 1; i <= 1000 && i < primes.length; i++) {
                                if (test % primes[i] == 0) return false;
                            }

                            // if test is not a composite of the first 1000 primes, resort to doing a more expensive check with sqrt. 
                            var top = Math.sqrt(test);
                            for (var i = 1001; primes[i] < top; i++) {
                                if (test % primes[i] == 0) return false;
                            }
                            return true;
                        }
                    }, 100);

                    return deferred.promise;


                }
            }
        }]);
})();
