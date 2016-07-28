/* primeService.js
 * Prime Generator service which manages the work to search for primes.
 * STM - 07/28/2016
 */

(function () {
    'use strict';

    angular.module('primeApp').factory('primeService', [
        '$q',
        '$timeout',
        function ($q, $timeout) {
            return {
                calcMaxPrime: function (timeLimit, updateCallback) {
                    var deferred = $q.defer();

                    try {
                        // simple/initial validity checks.
                        if (isNaN(timeLimit)) throw { message: "You must provide a valid time in seconds." };
                        if (timeLimit < 1 || timeLimit > 60) throw { message: "Please choose a time between 1 and 60 seconds." };

                        // this abomination allows us to run all of this from the local file system without Chrome croaking on 
                        // origin distress.  Otherwise this solution would need to be hosted somewhere - then the worker function could live in its own .js file.
                        var worker = new Worker(URL.createObjectURL(new Blob(["(" + primeWorker.toString() + ")()"], { type: 'text/javascript' })));

                        // process messages returned by the worker.  Messages flagged as "updates" do not result in the promise being resolved.
                        worker.addEventListener('message', function (e) {
                            var data = e.data;
                            if (data.update) {
                                (updateCallback || angular.noop)(data);
                            }
                            else {
                                deferred.resolve(data);
                            }
                        });

                        // start the worker process.
                        worker.postMessage({ timeLimit: timeLimit });
                    }
                    catch (exception) {
                        deferred.reject(exception.message);
                    }
                    return deferred.promise;

                    // this worker function could live in another .js file if we were hosting the application on a real webserver.  I've brought it in here as a
                    // workaround for browsers griping about not being able to arbitrarily open a .js file from the local machine's file system.
                    function primeWorker() {
                        self.addEventListener('message', function (e) {
                            var data = e.data;

                            var startTime = new Date();
                            var primes = [];
                            var currentNum = 1;
                            var currentTime = new Date();
                            var maxTime = (data.timeLimit * 1000) - 1;  // give 1ms to finish up.

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

                                // every second - post a message back to the caller with current stats.  Flag it as an update.
                                if ((currentTime - startTime) % 1000 == 0)
                                    self.postMessage({
                                        totalTime: (currentTime - startTime),
                                        maxPrime: primes[primes.length - 1],
                                        totalPrimes: primes.length,
                                        totalNumbers: currentNum - 1,
                                        update: true
                                    });
                            }

                            var endTime = new Date();

                            // Final update to caller. Not an update - this will result in the promise being resolved.
                            self.postMessage({
                                totalTime: (endTime - startTime),
                                maxPrime: primes[primes.length - 1],
                                totalPrimes: primes.length,
                                totalNumbers: currentNum - 1,
                                update: false
                            });

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

                                // otherwise the number is indeed a prime.
                                return true;
                            }
                        });
                    }
                }
            }
        }
    ]);
})();
