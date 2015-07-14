angular.module("oauth.providers", ["oauth.utils"])

    .factory("$cordovaOauth", ["$q", '$http', "$cordovaOauthUtility", function ($q, $http, $cordovaOauthUtility) {

        return {

            /*
             * Sign into the DRE service
             *
             * @param    object credentials
             * @return   promise
             */
            dre: function (c) {
                var deferred = $q.defer();
                if (window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if ($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        var loginCount = 0;
                        var browserRef = window.open(c.auth_url + c.credentials.authorization_path + '?client_id=' + c.credentials.client_id + '&redirect_uri=' + redirect_uri + '&response_type=code', '_blank', 'closebuttoncaption=Cancel,location=no,clearsessioncache=yes,clearcache=yes,toolbar=no');
                        browserRef.addEventListener('loadstart', function (event) {
                            console.log("loadstart: " + event.url);
                            if ((event.url).indexOf("http://localhost/callback") === 0) {
                                requestToken = (event.url).split("code=")[1];
                                console.log("code: " + requestToken);
                                deferred.resolve(requestToken);
                                browserRef.close();
                            } else {
                                if ((event.url).indexOf('oauth2/login') > -1) {
                                    if (loginCount >= 2) {
                                        deferred.reject("Login Failure");
                                        browserRef.close();
                                    }
                                    loginCount++;
                                }
                            }
                        });
                        browserRef.addEventListener('exit', function (event) {
                            console.log("here in oauth exit");
                            deferred.reject("The sign in flow was canceled");
                        });
                    } else {
                        deferred.reject("Could not find InAppBrowser plugin");
                    }
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },
            /*
             * Sign into the SMART on FHIR service
             *
             * @param    object credentials
             * @return   promise
             */
            smart: function (c) {
                var deferred = $q.defer();
                if (window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if ($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";

                        var browserRef = window.open(c.auth_url + c.credentials.authorization_path + '?client_id=' + c.credentials.client_id + '&redirect_uri=' + redirect_uri + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function (event) {
                            console.log("loadstart: " + event.url);
                            if ((event.url).indexOf("/login?error=failure") > -1) {
                                deferred.reject("Login Failure");
                                browserRef.close();
                            }
                            if ((event.url).indexOf("http://localhost/callback") === 0) {
                                requestToken = (event.url).split("code=")[1];
                                console.log("code: " + requestToken);
                                deferred.resolve(requestToken);
                                browserRef.close();
                            }
                        });
                        browserRef.addEventListener('exit', function (event) {
                            deferred.reject("The sign in flow was canceled");
                        });
                    } else {
                        deferred.reject("Could not find InAppBrowser plugin");
                    }
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            }

        };

    }]);

/*
 * Cordova AngularJS Oauth
 *
 * Created by Nic Raboy
 * http://www.nraboy.com
 *
 *
 *
 * DESCRIPTION:
 *
 * Use Oauth sign in for various web services.
 *
 *
 * REQUIRES:
 *
 *    Apache Cordova 3.5+
 *    Apache InAppBrowser Plugin
 *    Apache Cordova Whitelist Plugin
 *
 *
 * SUPPORTS:
 *
 *    DRE - Amida Technology Solutions
 */

angular.module("ngCordovaOauth", [
    "oauth.providers",
    "oauth.utils"
]);

angular.module("oauth.utils", [])

    .factory("$cordovaOauthUtility", ["$q", function ($q) {

        return {

            /*
             * Check to see if the mandatory InAppBrowser plugin is installed
             *
             * @param
             * @return   boolean
             */
            isInAppBrowserInstalled: function (cordovaMetadata) {
                var inAppBrowserNames = ["cordova-plugin-inappbrowser", "org.apache.cordova.inappbrowser"];

                return inAppBrowserNames.some(function (name) {
                    return cordovaMetadata.hasOwnProperty(name);
                });
            }
        };

    }]);