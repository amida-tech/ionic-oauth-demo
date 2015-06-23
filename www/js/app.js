// Ionic Starter App

angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'ionic.utils', 'ngCordovaOauth'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })

            .state('app.health', {
                url: "/health",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/health.html",
                        controller: 'HealthCtrl'
                    }
                }
            })

            .state('app.settings', {
                url: "/settings",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/settings.html",
                        controller: 'SettingCtrl'
                    }
                }
            })

            .state('app.tokens', {
                url: "/tokens",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/tokens.html",
                        controller: 'TokenCtrl'
                    }
                }
            })
            .state('app.patients', {
                cache: false,
                url: '/patients',
                views: {
                    'menuContent': {
                        templateUrl: "templates/patient.html",
                        controller: 'PatientCtrl'
                    }
                },
                params: {token: null}
            })

            .state('app.medications', {
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/medications.html",
                        controller: 'MedicationCtrl'
                    }
                },
                params: {token: null, patient: null}
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/tokens');
    });
