angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {
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
                $scope.healthKitAvailable = "Health Kit IS Available : )";

                var permissions = ['HKQuantityTypeIdentifierHeight', 'HKQuantityTypeIdentifierStepCount', 'HKQuantityTypeIdentifierBodyMass'];

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

                        var curDate = new Date();

                        $cordovaHealthKit.querySampleType({
                            startDate: new Date(curDate.getYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0),
                            endDate: curDate,
                            sampleType: 'HKQuantityTypeIdentifierStepCount',
                            unit: 'count'
                        }, function (v) {
                            $scope.userSteps = JSON.stringify(v);
                        }, function (err) {
                            $scope.userSteps = err;
                        })
                    }, function (err) {
                        $scope.granted = false;
                    });

            }, function (no) {
                // No HK available
                $scope.healthKitAvailable = "Health Kit is NOT Available : (";
            });
        } else {
            $scope.healthKitAvailable = "Not on iOS / no HealthKit";
        }
    }])

    .controller('SettingCtrl', ['$scope', 'TokenService', function ($scope, TokenService) {
        $scope.baseUrl = 'http://localhost:3000/';
        TokenService.getBase(function (baseUrl) {
            $scope.baseUrl = baseUrl;
        });

        $scope.updateBase = function (newBase) {
            console.log("controller baseUrl: ");
            TokenService.setBase(newBase);
        }

        $scope.clearTokens = function () {
            TokenService.clearTokens();
        }
    }])

    .controller('TokenCtrl', ['$scope', '$state', '$cordovaOauth', 'TokenService', function ($scope, $state, $cordovaOauth, TokenService) {
        var isWeb = ionic.Platform.isWebView();

        $scope.tokens = [];
        TokenService.getTokens(function (tokens) {
            $scope.tokens = tokens;
        });

        var c = {};
        TokenService.getCredentials(function (credentials) {
            c = credentials;
        });

        $scope.getToken = function () {
            $cordovaOauth.dre(c).then(function (result) {
                $scope.oauthSuccess = "success " + JSON.stringify(result);
                TokenService.getPatients(c, result, function (response) {
                    result.patients = response.entry;
                    $scope.tokens.push(result);
                    TokenService.setTokens($scope.tokens);
                });
            }, function (error) {
                console.log("error: " + error);
                $scope.oauthError = "error " + error;
            });
        }

        $scope.goPatient = function (tokenIndex) {
            $state.go('app.patients', {
                token: $scope.tokens[tokenIndex]
            });
        }

        $scope.goMeds = function (tokenIndex) {
            $state.go('app.medications', {
                token: $scope.tokens[tokenIndex],
                patient: $scope.tokens[tokenIndex].patients[0].resource.id
            })
        }
    }])

    .controller('PatientCtrl', ['$scope', '$state', '$stateParams', 'TokenService', function ($scope, $state, $stateParams, TokenService) {

        var c = {};
        var token = $stateParams.token;
        $scope.token = token;
        $scope.patients = [];
        TokenService.getCredentials(function (credentials) {
            c = credentials;
            TokenService.getPatients(c, token, function (response) {
                $scope.patients = response.entry;
            });
        });

        $scope.goMeds = function (patientIndex) {
            $state.go('app.medications', {
                token: token,
                patient: $scope.patients[patientIndex].resource.id
            })
        }
    }])

    .controller('MedicationCtrl', ['$scope', '$stateParams', 'TokenService', function ($scope, $stateParams, TokenService) {
        var token = $stateParams.token;
        var patient = $stateParams.patient;
        TokenService.getCredentials(function (credentials) {
            c = credentials;
            TokenService.getMedications(c, token, patient, function (response) {
                var meds = response.entry;
                var medPush = [];
                for (var i = 0; i <= meds.length; i++) {
                    if (i === meds.length) {
                        $scope.medications = medPush;
                        //$scope.medPush = medPush;
                    } else {
                        if (meds[i].resource.resourceType === 'MedicationPrescription') {
                            medPush.push(meds[i]);
                        }
                    }
                }
                //$scope.medications = response.entry;
            });
        });
    }]);
