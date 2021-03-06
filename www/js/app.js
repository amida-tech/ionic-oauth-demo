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

            .state('app.dev', {
                url: "/dev",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/dev.html",
                        controller: 'DevCtrl'
                    }
                }
            })

            .state('app.settings', {
                url: "/settings",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/settings.html",
                        controller: 'SettingsCtrl'
                    }
                }
            })
            .state('app.info', {
                cache: false,
                url: '/info',
                views: {
                    'menuContent': {
                        templateUrl: "templates/info.html",
                        controller: 'InfoCtrl'
                    }
                },
                params: {token: null}
            })

            .state('app.medications', {
                cache: false,
                url: '/medications',
                views: {
                    'menuContent': {
                        templateUrl: "templates/medications.html",
                        controller: 'MedicationCtrl'
                    }
                }//,
//                params: {token: null, patient: null}
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/medications');
    });
