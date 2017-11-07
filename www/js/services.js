angular.module('starter.services', ['ngResource'])

/** This is the BASE URL for the application. */
.constant("baseURL", "https://watch-hours.herokuapp.com")

/**
 *  This factory is used to perform GET request for all shows
 */
.factory('Shows', ['$cacheFactory', '$resource', 'baseURL', function($cacheFactory, $resource, baseURL){
        // empty reference array
        var Shows = $resource(baseURL + '/shows', {}, {
            query: {
                method: 'GET',
                isArray: true
            }
        });
        return Shows;
    }])


/**
 *  This factory is used to perform GET request for a particular show
 */
.factory('Series', ['$cacheFactory', '$resource', 'baseURL', function($cacheFactory, $resource, baseURL){
        // empty reference object
        var Series = $resource(baseURL + '/shows/:id', {seriesId:'@id'}, {
           query: {
                method: 'GET',
                isArray: false
           }
        });
        return Series;
    }])


/**
 *  This factory is used to perform GET request for episodes belonging to a particular show
 */
.factory('Episodes', ['$cacheFactory', '$resource', 'baseURL', function($cacheFactory, $resource, baseURL){
        // empty reference array
        var Episodes = $resource(baseURL + '/episodes/:seriesId', {seriesId:'@seriesId'}, {
            query: {
                method: 'GET',
                isArray: true
            }
        });
        return Episodes;
    }])


/**
 *  This factory is used to perform GET request for a posters belonging to a particular show
 */
.factory('Posters', ['$cacheFactory', '$resource', 'baseURL', function($cacheFactory, $resource, baseURL){
        // empty reference array
        var Posters = $resource(baseURL + '/posters/:seriesId', {seriesId:'@seriesId'}, {
            query: {
                method: 'GET',
                isArray: true
            }
        });
        return Posters;
    }])


/**
 * Get count of posters
 */
.factory('PostersCount', ['$cacheFactory', '$resource', 'baseURL', function($cacheFactory, $resource, baseURL){
    // empty reference array
    var PostersCount = $resource(baseURL + '/posters/:seriesId/count', {seriesId:'@seriesId'}, {
        query: {
            method: 'GET',
            isArray: false
        }
    });
    return PostersCount;
}])


/**
 *  This factory is used to perform GET request for actors of a particular show
 */
.factory('Actors', ['$cacheFactory', '$resource', 'baseURL', function($cacheFactory, $resource, baseURL){
    // empty reference array
    var Actors = $resource(baseURL + '/actors/:seriesId', {seriesId:'@seriesId'}, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
    return Actors;
}])

/**
 * Get count of actors
 */
.factory('ActorsCount', ['$cacheFactory', '$resource', 'baseURL', function($cacheFactory, $resource, baseURL){
    // empty reference array
    var ActorsCount = $resource(baseURL + '/actors/:seriesId/count', {seriesId:'@seriesId'}, {
        query: {
            method: 'GET',
            isArray: false
        }
    });
    return ActorsCount;
}])

/**
 *  This factory is used to perform POST request to subscribe, watchlist and favorites
 */
.factory('Subscription', ['$http', 'baseURL', function($http, baseURL) {
        return {
            subscriptions: function(show, uid) {
                return $http.post(baseURL + '/subscription/subscribe', { showId: show._id, uid: uid });
            },
            watchlist: function(show, uid) {
                return $http.post(baseURL + '/subscription/watchlist', { showId: show._id, uid: uid });
            },
            favorites: function(show, uid) {
                return $http.post(baseURL + '/subscription/favorites', { showId: show._id, uid: uid });
            }
        };
    }])


/**
 *  This factory is used to perform PUT request for comments in a particular episode
 */
.factory('commentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

    return $resource(baseURL + "/episodes/:id/comments/:commentId", {id:"@Id", commentId: "@CommentId"}, {
        'update': {
            method: 'PUT'
        }
    });

}])


/**
 *  HELPER FUNCTION for home.html
 */
.factory('HomeServices', [function(){
        var homeServices = {};
        var TODAY = moment().startOf('day');
        var TOMORROW = moment().add(1, 'days').startOf('day');

        // compare shows based on rating
        homeServices.compare = function(a, b) {
            // Use toUpperCase() to ignore character casing
            const ratingA = a.rating;
            const ratingB = b.rating;

            var comparison = 0;
            if (ratingA > ratingB) {
                comparison = 1;
            } else if (ratingA < ratingB) {
                comparison = -1;
            }
            return comparison* -1;
        };

        // check if day is today
        homeServices.isToday = function(momentDate) {
            return momentDate.isSame(TODAY, 'd');
        }

        // check if day is tomorrow
        homeServices.isTomorrow = function(momentDate) {
            return momentDate.isSame(TOMORROW, 'd');
        }

        // check if day is within this week
        homeServices.isWithinAWeek = function(momentDate) {
            return momentDate.isAfter(moment().startOf('week')) && momentDate.isBefore(moment().endOf('week'));
        }

        return homeServices;
    }])

/**
 *  This factory is used to store info of current user in local storage
 */
.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
}])

/**
 *  This factory is used to authenticate user
 */
.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL',
    function($resource, $http, $localStorage, $rootScope, $window, baseURL){

    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var isVerified = false;
    var admin = false;
    var authToken = undefined;
    var _id = '';
    var error = '';
    var message = '';

    function useCredentials(credentials) {
        isAuthenticated = true;
        username = credentials.username;
        authToken = credentials.token;
        admin = credentials.admin;
        isVerified = credentials.isVerified;
        _id = credentials._id;
        // Set the token as header for your requests!
        $http.defaults.headers.common['x-access-token'] = authToken;
    }

    function loadUserCredentials() {
        var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
        if (credentials.username != undefined) {
            useCredentials(credentials);
        }
    }

    function storeUserCredentials(credentials) {
        $localStorage.storeObject(TOKEN_KEY, credentials);
        useCredentials(credentials);
    }

    function destroyUserCredentials() {
        authToken = undefined;
        username = '';
        admin = false;
        isVerified = false;
        isAuthenticated = false;
        $http.defaults.headers.common['x-access-token'] = authToken;
        $localStorage.remove(TOKEN_KEY);
    }

    authFac.storeCredentials = function(data){
        storeUserCredentials(data);
    };

    authFac.forgotPassword = function(email){
        $resource(baseURL + "/users/forgotpassword")
            .save(email,
            function(response) {
                message = response.res;
                $rootScope.$broadcast('email sent');
            },
            function(err) {
                error = err.data.err.message;
                $rootScope.$broadcast('email not sent');
            }
        );
    }

    /**
     *  Function to reset password
     */
    authFac.resetPassword = function(){
        return $resource(baseURL + "/users/resetpassword", {authToken: '@authToken'}, {
            'update': {
                method: 'PUT'
            }
        });
    }

    /**
     * Function to login user
     * @param{Object} loginData
     */
    authFac.login = function(loginData) {

        $resource(baseURL + "/users/login")
            .save(loginData,
            function(response) {
                storeUserCredentials({
                    username:loginData.username,
                    token: response.token,
                    admin: response.admin,
                    _id: response._id,
                    isVerified: response.isVerified
                });
                $rootScope.$broadcast('login:Successful');
            },
            function(err) {
                isAuthenticated = false;
                error = err.data.err.message;
                $rootScope.$broadcast('login:Unsuccessful');
            }
        );
    };

    /**
     * Function to logout user
     */
    authFac.logout = function() {
        $resource(baseURL + "/users/logout").get(function(response){
        });
        destroyUserCredentials();
    };

    /**
     * Function to register user
     * @param{Object} registerData
     */
    authFac.register = function(registerData) {

        $resource(baseURL + "/users/register")
            .save(registerData,
            function(response) {
                authFac.login({username:registerData.username, password:registerData.password});
                if (registerData.rememberMe) {
                    $localStorage.storeObject('userinfo',
                        {username:registerData.username, password:registerData.password});
                }

                $rootScope.$broadcast('registration:Successful');
            },
            function(response){
                console.log("Registration Unsuccessful!");
            }
        );
    };

    /**
     * Check if user is authenticated
     */
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };

    /**
     * Get username
     */
    authFac.getUsername = function() {
        return username;
    };

    /**
     * Check if user is verified
     */
    authFac.isVerified = function() {
        return isVerified;
    };

    /**
     * Check if user is an admin
     */
    authFac.isAdmin = function(){
        return admin;
    }

    /**
     * Get user id
     */
    authFac.uid = function(){
        return _id;
    }

    /**
     * Return error if in authentication
     */
    authFac.Error = function(){
        return error;
    }

    /**
     * Return message
     */
    authFac.Message = function(){
        return message;
    }

    loadUserCredentials();

    return authFac;

}]);