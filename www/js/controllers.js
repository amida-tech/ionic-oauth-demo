angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout, TokenService) {
        //TokenService.setBase('http://dre.amida-demo.com:3000/');
        var isIOS = ionic.Platform.isIOS();
        if (isIOS) {
            $scope.enableHealthKit = true;
        } else {
            $scope.enableHealthKit = false;
        }
    })

    .controller('HealthCtrl', ['$scope', 'TokenService', '$cordovaHealthKit', function ($scope, TokenService, $cordovaHealthKit) {
        var isIOS = ionic.Platform.isIOS();
        if (isIOS) {
            $cordovaHealthKit.isAvailable().then(function (yes) {
                // HK is available
                $scope.healthKitAvailable = "HealthKit is available";

                var permissions = ['HKQuantityTypeIdentifierHeight', 'HKQuantityTypeIdentifierBodyMass'];

                $cordovaHealthKit.requestAuthorization(
                    permissions, // Read permission
                    [] // Write permission
                ).then(function (success) {
                        // store that you have permissions
                        $scope.granted = true;
                        $cordovaHealthKit.readWeight('lb').then(function (v) {
                            $scope.userWeight = v.value;
                            $scope.userWeightdate = v.date;
                        }, function (err) {
                        });
                        $cordovaHealthKit.readHeight('ft').then(function (v) {
                            $scope.userHeight = v.value;
                            $scope.userHeightdate = v.date;
                        }, function (err) {
                        });
                    }, function (err) {
                        $scope.granted = false;
                    });

            }, function (no) {
                // No HK available
                $scope.healthKitAvailable = "HealthKit is NOT Available";
            });
        } else {
            $scope.healthKitAvailable = "Not on iOS / no HealthKit";
        }
    }])

    .controller('DevCtrl', ['$scope', 'TokenService', function ($scope, TokenService) {
        $scope.base = {url: 'http://dre.amida-demo.com:3000/'};
        TokenService.getBase(function (baseUrl) {
            $scope.base.url = baseUrl;
        });

        $scope.updateBase = function (newBase) {
            TokenService.setBase(newBase);
        };

        $scope.clearTokens = function () {
            TokenService.clearTokens();
        }
    }])

    .controller('SettingsCtrl', ['$scope', '$state', '$location', '$cordovaOauth', '$ionicHistory', 'TokenService', function ($scope, $state, $location, $cordovaOauth, $ionicHistory, TokenService) {
        $scope.oauthError = "";
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        var isWeb = ionic.Platform.isWebView();

        $scope.token = {};
        TokenService.getToken(function (token) {
            $scope.token = token;
        });

        $scope.tokenExists = TokenService.tokenExists();

        var c = {};

        $scope.getDREToken = function () {
            $scope.oauthError = "";
            TokenService.getDRECredentials(function (credentials) {
                c = credentials;
            });
            $cordovaOauth.dre(c).then(function (requestToken) {
                TokenService.getTokenResult(c, requestToken, function (err, result) {
                    if (err) {
                        console.log("error: " + err);
                        $scope.oauthError = "error: " + err;
                    } else {
                        $scope.oauthSuccess = "success " + JSON.stringify(result);
                        result.c = c;
                        TokenService.getPatients(result, function (response) {
                            result.patients = response.entry;
                            $scope.token = result;
                            TokenService.setToken(result);
                            $scope.tokenExists = true;
                        });
                    }
                })
            }, function (error) {
                console.log("error: " + error);
                $scope.oauthError = "error: " + error;
            });
        };

        $scope.getSMARTToken = function () {
            $scope.oauthError = "";
            TokenService.getSMARTCredentials(function (credentials) {
                c = credentials;
            });
            $cordovaOauth.smart(c).then(function (result) {
                TokenService.getTokenResult(c, requestToken, function (err, result) {
                    if (err) {
                        console.log("error: " + err);
                        $scope.oauthError = "error: " + err;
                    } else {
                        $scope.oauthSuccess = "success " + JSON.stringify(result);
                        result.c = c;
                        result.patients = [{resource: {name: [{given: ['Daniel'], family: ['Adams']}]}}];
                        $scope.token = result;
                        TokenService.setToken(result);
                        $scope.tokenExists = true;
                    }
                })
            }, function (error) {
                console.log("error: " + error);
                $scope.oauthError = "error " + error;
            });
        };

        $scope.goPatient = function () {
            $state.go('app.info', {
                token: $scope.token
            });
        };

        $scope.goMeds = function () {
            $location.path('/app/medications');
        };

        $scope.clearTokens = function () {
            $scope.oauthError = "";
            TokenService.clearTokens();
            $scope.tokenExists = false;
        }
    }])

    .controller('InfoCtrl', ['$scope', '$location', '$stateParams', 'TokenService', function ($scope, $location, $stateParams, TokenService) {

        var token = $stateParams.token;
        $scope.token = token;
        $scope.patients = [];
        TokenService.getPatients(token, function (response) {
            $scope.patients = response.entry;
        });

        $scope.goMeds = function (patientIndex) {
            $location.path('/app/medications');
        }
    }])

    .controller('MedicationCtrl', ['$scope', '$state', '$location', '$ionicHistory', '$cordovaOauth', 'TokenService', function ($scope, $state, $location, $ionicHistory, $cordovaOauth, TokenService) {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });

        $scope.token = {};
        TokenService.getToken(function (token) {
            $scope.token = token;
        });

        function getMedications(val) {
            var result = [];
            if (val && val.entry) {
                var i, len = val.entry.length;
                for (i = 0; i < len; i++) {
                    var content = val.entry[i].content || val.entry[i].resource;
                    if (content && content.resourceType === 'MedicationPrescription') {
                        var contained = content.contained;
                        if (contained && contained.length > 0) {
                            var j, len2 = contained.length;
                            for (j = 0; j < len2; j++) {
                                result.push({
                                    name: contained[j].name,
                                    status: content.status
                                });
                            }
                        }
                    }
                }
            }
            return result;
        }

        $scope.tokenExists = TokenService.tokenExists();
        console.log("token exists: " + $scope.tokenExists);

        if ($scope.tokenExists) {
            TokenService.getUserMedications(function (response) {
                console.log("get user meds response: " + response);
                $scope.medications = getMedications(response);
                /*
                var meds = response.entry;
                var medPush = [];
                for (var i = 0; i <= meds.length; i++) {
                    if (i === meds.length) {
                        $scope.medications = medPush;
                    } else {
                        if (meds[i].resource.resourceType === 'MedicationPrescription') {
                            medPush.push(meds[i]);
                        }
                    }
                }
                 */
            });
        }

        $scope.goToSettings = function () {
            $location.path('/app/settings');
        };
    }]);
