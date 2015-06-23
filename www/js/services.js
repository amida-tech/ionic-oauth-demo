angular.module('starter.services', [])

    .service('TokenService', ['$localstorage', '$http', function ($localstorage, $http) {
        function getTokens(callback) {
            var userTokens = $localstorage.getObject('userTokens');
            if (userTokens.hasOwnProperty("tokens")) {
                callback(userTokens.tokens);
            } else {
                callback([]);
            }
        }

        this.getTokens = getTokens;

        function getBase(callback) {
            var baseUrl = $localstorage.get('baseUrl', 'http://192.168.0.118:3000/');
            console.log(baseUrl);
            callback(baseUrl);
        }

        this.getBase = getBase;

        function setBase(newBase) {
            return $localstorage.set('baseUrl', newBase)
        }

        this.setBase = setBase;

        function setTokens(tokens) {
            var userTokens = {tokens: tokens};
            $localstorage.setObject('userTokens', userTokens);
        }

        this.setTokens = setTokens;

        function getCredentials(callback) {
            getBase(function (baseUrl) {
                c = {
                    name: 'DRE/FHIR (' + baseUrl + ')',
                    url: baseUrl,
                    //url: 'http://192.168.0.120:3000/',
                    auth_url: baseUrl,
                    //auth_url: 'http://192.168.0.120:3000/',
                    logo_url: '',
                    credentials: {
                        client_id: 'argonaut_demo_client_local',
                        client_secret: 'have no secrets!',
                        site: baseUrl,
                        //site: 'http://192.168.0.120:3000/',
                        api_url: baseUrl + 'fhir',
                        //api_url: 'http://192.168.0.120:3000/fhir',
                        authorization_path: 'oauth2/authorize',
                        token_path: 'oauth2/token',
                        revocation_path: 'oauth2/revoke',
                        scope: '',
                        //redirect_uri: 'http://localhost:3001/fhir/callback'
                        redirect_uri: 'http://localhost/callback'
                    }
                };
                callback(c);
            })
        }

        this.getCredentials = getCredentials;

        function getPatients(c, token, callback) {
            $http({
                method: "get",
                url: c.credentials.api_url + '/Patient',
                headers: {
                    Authorization: 'Bearer ' + token.access_token,
                    Accept: 'application/json'
                }
            })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data, status) {
                    callback(status);
                })
        }

        this.getPatients = getPatients;

        function getMedications(c, token, patient, callback) {
            $http({
                method: "get",
                url: c.credentials.api_url + '/MedicationPrescription?patient=' + patient,
                headers: {
                    Authorization: 'Bearer ' + token.access_token,
                    Accept: 'application/json'
                }
            })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data, status) {
                    callback(status);
                })
        }

        this.getMedications = getMedications;
    }]);