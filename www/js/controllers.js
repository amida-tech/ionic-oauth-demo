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
            TokenService.getDRECredentials(function (credentials) {
                c = credentials;
            });
            $cordovaOauth.dre(c).then(function (result) {
                $scope.oauthSuccess = "success " + JSON.stringify(result);
                result.c = c;
                TokenService.getPatients(result, function (response) {
                    result.patients = response.entry;
                    $scope.token = result;
                    TokenService.setToken(result);
                    $scope.tokenExists = true;
                });
            }, function (error) {
                console.log("error: " + error);
                $scope.oauthError = "error " + error;
            });
        };

        $scope.getSMARTToken = function () {
            TokenService.getSMARTCredentials(function (credentials) {
                c = credentials;
            });
            $cordovaOauth.smart(c).then(function (result) {
                $scope.oauthSuccess = "success " + JSON.stringify(result);
                result.c = c;
                TokenService.getPatients(result, function (response) {
                    result.patients = response.entry;
                    $scope.token = result;
                    TokenService.setToken(result);
                    $scope.tokenExists = true;
                });
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

        $scope.tokenExists = TokenService.tokenExists();

        if ($scope.tokenExists) {
            TokenService.getUserMedications(function (response) {
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
            });
        }

        $scope.goToSettings = function () {
            $location.path('/app/settings');
        };

        var c = {};

        $scope.getSMARTToken = function () {
            TokenService.getSMARTCredentials(function (credentials) {
                c = credentials;
            });
            $cordovaOauth.smart(c).then(function (result) {
                $scope.oauthSuccess = "success " + JSON.stringify(result);
                result.c = c;
                TokenService.getPatients(result, function (response) {
                    result.patients = response.entry;
                    $scope.token = result;
                    TokenService.setToken(result);
                    $scope.tokenExists = true;
                    TokenService.getUserMedications(function (response) {
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
                    });
                });
            }, function (error) {
                console.log("error: " + error);
                $scope.oauthError = "error " + error;
            });
        };

        $scope.getDREToken = function () {
            TokenService.getDRECredentials(function (credentials) {
                c = credentials;
            });
            $cordovaOauth.dre(c).then(function (result) {
                $scope.oauthSuccess = "success " + JSON.stringify(result);
                result.c = c;
                TokenService.getPatients(result, function (response) {
                    result.patients = response.entry;
                    $scope.token = result;
                    TokenService.setToken(result);
                    $scope.tokenExists = true;
                    TokenService.getUserMedications(function (response) {
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
                    });
                });
            }, function (error) {
                console.log("error: " + error);
                $scope.oauthError = "error " + error;
            });
        };
    }]);
