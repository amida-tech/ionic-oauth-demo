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

        function getToken(callback) {
            callback($localstorage.getObject('userToken'));
        }

        this.getToken = getToken;

        function setToken(token) {
            $localstorage.setObject('userToken', token);
        }

        this.setToken = setToken;
        /*
        function getBase(callback) {
            var baseUrl = $localstorage.get('baseUrl', 'http://dre.amida-demo.com:3000/');
            callback(baseUrl);
        }

        this.getBase = getBase;

        function setBase(newBase) {
            return $localstorage.set('baseUrl', newBase)
        }

        this.setBase = setBase;
         */
        function setTokens(tokens) {
            var userTokens = {tokens: tokens};
            $localstorage.setObject('userTokens', userTokens);
        }

        this.setTokens = setTokens;

        function clearTokens() {
            var userTokens = {tokens: []};
            $localstorage.setObject('userTokens', userTokens);
            $localstorage.setObject('userToken', {});
        }

        this.clearTokens = clearTokens;

        function tokenExists() {
            var token = $localstorage.getObject('userToken', {});
            if (Object.keys(token).length === 0) {
                return false;
            } else {
                return true;
            }
        }

        this.tokenExists = tokenExists;

        function getDRECredentials(callback) {
            var c = {
                name: 'DRE/FHIR',
                url: 'http://dre.amida-demo.com:3000/',
                auth_url: 'http://dre.amida-demo.com:3000/',
                logo_url: '',
                credentials: {
                    client_id: 'argonaut_demo_client_local',
                    client_secret: 'have no secrets!',
                    site: 'http://dre.amida-demo.com:3000/',
                    api_url: 'http://dre.amida-demo.com:3000/fhir',
                    authorization_path: 'oauth2/authorize',
                    token_path: 'oauth2/token',
                    revocation_path: 'oauth2/revoke',
                    scope: '',
                    redirect_uri: 'http://localhost/callback'
                }
            };
            callback(c);
        }

        this.getDRECredentials = getDRECredentials;

        function getTokenResult(c, requestToken, callback) {
            var redirect_uri = "http://localhost/callback";
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
                    console.log("getDREResult: " + data);
                    callback(null, data);
                })
                .error(function (data, status) {
                    console.log("getDREResult error: " + data);
                    callback("Problem Authenticating");
                })
        }

        this.getTokenResult = getTokenResult;

        function getSMARTCredentials(callback) {
            var c = {
                name: 'SMART on FHIR',
                url: 'https://fhir-api.smarthealthit.org/',
                auth_url: 'https://authorize.smarthealthit.org/',
                logo_url: '',
                credentials: {
                    client_id: '89032ea9-ca63-45fc-a4a9-c41e5d0a5fe4',
                    client_secret: 'ALsLobPCcQFrDCwzJ-eC_puhIPTFeEP6eSz6cj07DNSvWN9mM2nCmxW4hlxwOu9xB8s92BeCbx_eh9nRvZ3lioQ',
                    site: 'https://authorize.smarthealthit.org/',
                    api_url: 'https://fhir-api.smarthealthit.org/',
                    authorization_path: '/authorize',
                    token_path: '/token',
                    revocation_path: '/revoke',
                    scope: '',
                    redirect_uri: 'http://localhost/callback'
                }
            };
            callback(c);
        }

        this.getSMARTCredentials = getSMARTCredentials;

        function getPatients(token, callback) {
            $http({
                method: "get",
                url: token.c.credentials.api_url + '/Patient',
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

        function getMedications(token, patient, callback) {
            $http({
                method: "get",
                url: token.c.credentials.api_url + '/MedicationPrescription?patient=' + patient,
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

        function getUserMedications(callback) {
            getToken(function (token) {
                var medUrl = token.c.credentials.api_url + '/MedicationPrescription?patient=' + token.patients[0].resource.id;
                if (token.c.name === 'SMART on FHIR') {
                    // /MedicationPrescription/_search?patient%3APatient=1288992'
                    medUrl = token.c.credentials.api_url + 'MedicationPrescription/_search?patient%3APatient=1288992';
                }
                $http({
                    method: "get",
                    url: medUrl,
                    headers: {
                        Authorization: 'Bearer ' + token.access_token,
                        Accept: 'application/json'
                    }
                })
                    .success(function (data) {
                        console.log("was successful connection to meds: " + JSON.stringify(data));
                        callback(data);
                    })
                    .error(function (data, status) {
                        console.log("error connecting to meds: " + data + " - " + status);
                        callback(status);
                    })
            });
        }

        this.getUserMedications = getUserMedications;
    }]);