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

                        var browserRef = window.open(c.auth_url + c.credentials.authorization_path + '?client_id=' + c.credentials.client_id + '&redirect_uri=' + redirect_uri + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function (event) {
                            console.log("loadstart: " + event.url);
                            if ((event.url).indexOf("http://localhost/callback") === 0) {
                                requestToken = (event.url).split("code=")[1];
                                console.log("code: " + requestToken);
                                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                                $http({
                                    method: "post",
                                    url: c.auth_url + c.credentials.token_path,
                                    auth: {
                                        user: c.credentials.client_id,
                                        pass: c.credentials.client_secret,
                                        sendImmediately: true
                                    },
                                    data: "client_id=" + c.credentials.client_id + "&client_secret=" + c.credentials.client_secret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken,
                                    form: {
                                        code: requestToken,
                                        redirect_uri: redirect_uri,
                                        client_id: c.credentials.client_id,
                                        client_secret: c.credentials.client_secret,
                                        grant_type: 'authorization_code'
                                    }
                                })
                                    .success(function (data) {
                                        deferred.resolve(data);
                                    })
                                    .error(function (data, status) {
                                        deferred.reject("Problem authenticating");
                                    })
                                    .finally(function () {
                                        setTimeout(function () {
                                            browserRef.close();
                                        }, 10);
                                    });
                            }
                        });
                        browserRef.addEventListener('exit', function (event) {
                            console.log("here in exit");
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
            },

            /*
             * Sign an Oauth 1.0 request
             *
             * @param    string method
             * @param    string endPoint
             * @param    object headerParameters
             * @param    object bodyParameters
             * @param    string secretKey
             * @param    string tokenSecret (optional)
             * @return   object
             */
            createSignature: function (method, endPoint, headerParameters, bodyParameters, secretKey, tokenSecret) {
                if (typeof jsSHA !== "undefined") {
                    var headerAndBodyParameters = angular.copy(headerParameters);
                    var bodyParameterKeys = Object.keys(bodyParameters);
                    for (var i = 0; i < bodyParameterKeys.length; i++) {
                        headerAndBodyParameters[bodyParameterKeys[i]] = encodeURIComponent(bodyParameters[bodyParameterKeys[i]]);
                    }
                    var signatureBaseString = method + "&" + encodeURIComponent(endPoint) + "&";
                    var headerAndBodyParameterKeys = (Object.keys(headerAndBodyParameters)).sort();
                    for (i = 0; i < headerAndBodyParameterKeys.length; i++) {
                        if (i == headerAndBodyParameterKeys.length - 1) {
                            signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]]);
                        } else {
                            signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]] + "&");
                        }
                    }
                    var oauthSignatureObject = new jsSHA(signatureBaseString, "TEXT");

                    var encodedTokenSecret = '';
                    if (tokenSecret) {
                        encodedTokenSecret = encodeURIComponent(tokenSecret);
                    }

                    headerParameters.oauth_signature = encodeURIComponent(oauthSignatureObject.getHMAC(encodeURIComponent(secretKey) + "&" + encodedTokenSecret, "TEXT", "SHA-1", "B64"));
                    var headerParameterKeys = Object.keys(headerParameters);
                    var authorizationHeader = 'OAuth ';
                    for (i = 0; i < headerParameterKeys.length; i++) {
                        if (i == headerParameterKeys.length - 1) {
                            authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '"';
                        } else {
                            authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '",';
                        }
                    }
                    return {
                        signature_base_string: signatureBaseString,
                        authorization_header: authorizationHeader,
                        signature: headerParameters.oauth_signature
                    };
                } else {
                    return "Missing jsSHA JavaScript library";
                }
            },

            /*
             * Create Random String Nonce
             *
             * @param    integer length
             * @return   string
             */
            createNonce: function (length) {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < length; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            },

            generateUrlParameters: function (parameters) {
                var sortedKeys = Object.keys(parameters);
                sortedKeys.sort();

                var params = "";
                var amp = "";

                for (var i = 0; i < sortedKeys.length; i++) {
                    params += amp + sortedKeys[i] + "=" + parameters[sortedKeys[i]];
                    amp = "&";
                }

                return params;
            },

            parseResponseParameters: function (response) {
                if (response.split) {
                    var parameters = response.split("&");
                    var parameterMap = {};
                    for (var i = 0; i < parameters.length; i++) {
                        parameterMap[parameters[i].split("=")[0]] = parameters[i].split("=")[1];
                    }
                    return parameterMap;
                }
                else {
                    return {};
                }
            },

            generateOauthParametersInstance: function (consumerKey) {
                var nonceObj = new jsSHA(Math.round((new Date()).getTime() / 1000.0), "TEXT");
                var oauthObject = {
                    oauth_consumer_key: consumerKey,
                    oauth_nonce: nonceObj.getHash("SHA-1", "HEX"),
                    oauth_signature_method: "HMAC-SHA1",
                    oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
                    oauth_version: "1.0"
                };
                return oauthObject;
            }

        };

    }]);