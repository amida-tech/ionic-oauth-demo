angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

    })

    .controller('SettingCtrl', ['$scope', 'TokenService', function ($scope, TokenService) {
        $scope.baseUrl = 'http://localhost:3000/'
        TokenService.getBase(function (baseUrl) {
            $scope.baseUrl = baseUrl;
        });

        $scope.updateBase = function (newBase) {
            console.log("controller baseUrl: ");
            TokenService.setBase(newBase);
        }
    }])

    .controller('TokenCtrl', ['$scope', '$state', '$cordovaOauth', 'TokenService', function ($scope, $state, $cordovaOauth, TokenService) {
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
                $scope.tokens.push(result);
                TokenService.setTokens($scope.tokens);
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
    }])

    .controller('PatientCtrl', ['$scope', '$state', '$stateParams', 'TokenService', function ($scope, $state, $stateParams, TokenService) {

        var c = {};
        var token = $stateParams.token;
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
                $scope.medications = response.entry;
            });
        });
    }]);
