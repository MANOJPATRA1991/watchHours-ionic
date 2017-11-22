angular.module('starter.controllers', ['ngResource', 'ngCordova'])


// The application controller
.controller('AppCtrl', ['$scope', '$state', '$rootScope',
    'Shows', '$http', '$location', '$localStorage',
    'HomeServices', 'AuthFactory', '$ionicModal',
    '$ionicSideMenuDelegate', '$ionicPopup',
    '$timeout', '$cordovaInAppBrowser',  '$ionicLoading',
  function ($scope, $state, $rootScope, Shows, $http,
    $location, $localStorage, HomeServices,
    AuthFactory, $ionicModal, $ionicSideMenuDelegate,
    $ionicPopup, $timeout, $cordovaInAppBrowser, $ionicLoading) {

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    $scope.reservation = {};
    $scope.registration = {};
    $rootScope.currentUser = false;
    $rootScope.username = '';
    $rootScope.admin = false;
    $rootScope.uid = '';
    $rootScope.isVerified = false;

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.showSpinner = false;
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        $scope.showSpinner = true;
        AuthFactory.login($scope.loginData);
        $rootScope.$on('login:Successful', () => {
            $localStorage.storeObject('userinfo',$scope.loginData);
            $scope.closeLogin();
        });
    };

    // Perform logout
    $scope.logout = function() {
        AuthFactory.logout();
        $rootScope.currentUser = false;
        $rootScope.username = '';
        $rootScope.admin = false;
        $rootScope.isVerified = false;
        $rootScope.uid = '';
    };

    // Perform facebook login
    $scope.facebookLogin = function(){
        // options for inappbrowser
        var options = {
          location: 'yes',
          clearcache: 'yes',
          toolbar: 'no'
        };

        $scope.showSpinner = true;

        $cordovaInAppBrowser.open('https://watch-hours.herokuapp.com/users/facebook', '_blank', options);
    };

    // on load stop check url and redirect to app
    $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
        if(event.url.indexOf("https://watch-hours.herokuapp.com") > -1){
            var params = decodeURI(event.url.substring("?"));
            $cordovaInAppBrowser.close();
            var res = params.split("&");
            AuthFactory.storeCredentials({
                username: res[1].split("=")[1],
                token: res[0].split("=")[1],
                _id: res[2].split("=")[1],
                isVerified: res[3].split("=")[1]
            });
            $rootScope.$broadcast('login:Successful');
        }
        $scope.closeLogin();
    });

    // Set root variables if user is authenticated
    if(AuthFactory.isAuthenticated()) {
      $rootScope.currentUser = true;
      $rootScope.username = AuthFactory.getUsername();
      $rootScope.admin = AuthFactory.isAdmin();
      $rootScope.isVerified = AuthFactory.isVerified();
      $rootScope.uid = AuthFactory.uid();
    }

    // On successful login
    $rootScope.$on('login:Successful', function () {
        $rootScope.currentUser = AuthFactory.isAuthenticated();
        $rootScope.username = AuthFactory.getUsername();
        $rootScope.admin = AuthFactory.isAdmin();
        $rootScope.uid = AuthFactory.uid();
        $rootScope.isVerified = AuthFactory.isVerified();
    });

    $rootScope.$on('login:Unsuccessful', function(){
       var alertPopup = $ionicPopup.alert({
         title: 'Login Error',
         template: 'Check Internet Connection. If already connected, check username and password.'
       });
       $scope.showSpinner = false;
    });

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeRegister = function () {
        $scope.showSpinner = false;
        $scope.registerform.hide();
    };

    // Open the login modal
    $scope.register = function() {
        $scope.registerform.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doRegister = function() {
        $scope.showSpinner = true;
        if($scope.loginData.password !== "" && $scope.loginData.password === $scope.loginData.repeat_password){
            AuthFactory.register($scope.loginData);
        }else{
            var alertPopup = $ionicPopup.alert({
             title: 'Password mismatch',
             template: 'Passwords don\'t match'
            });
            $scope.showSpinner = false;
        }

        $rootScope.$on('registration:Successful', () => {
            $scope.closeRegister();
        });

        $rootScope.$on('registration:Unsuccessful', () => {
            $scope.showSpinner = false;
        });
    };

    // On successful registration
    $rootScope.$on('registration:Successful', function () {
        $rootScope.currentUser = AuthFactory.isAuthenticated();
        $rootScope.username = AuthFactory.getUsername();
        $rootScope.admin = AuthFactory.isAdmin();
        $rootScope.uid = AuthFactory.uid();
        $rootScope.isVerified = AuthFactory.isVerified();
    });

    // On unsuccessful registration
    $rootScope.$on('registration:Unsuccessful', function(){
        if($rootScope.registrationError === 500){
            var alertPopup = $ionicPopup.alert({
              title: 'Sign up Error',
              template: 'User with email already exists!'
            });
        }else{
            var alertPopup = $ionicPopup.alert({
                title: 'Sign up Error',
                template: 'Try again! Check internet connection!'
            });
        }
    });

    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
      };
}])

.controller('HomeCtrl', ['$scope', 'Shows', 'Episodes', 'HomeServices', '$rootScope',
function($scope, Shows, Episodes, HomeServices, $rootScope){
        $scope.todaysepisodes = [];
        $scope.tomorrowsepisodes = [];
        $scope.thisweeksepisodes = [];
        $scope.shows = [];
        
        Shows.query({}, function(resp){
            // Sort shows by rating
            $scope.shows = resp.sort(HomeServices.compare);
            // Get episodes for each show
            for(var i=0; i<$scope.shows.length; i++){
                Episodes.query({seriesId: $scope.shows[i]._id}, function(episodes) {
                    for(var i = 0; i < episodes.length; i++){
                        // Filter episodes for today
                        if (HomeServices.isToday(moment(episodes[i].firstAired))) {
                            $scope.todaysepisodes.push(episodes[i]);
                        }
                        // Filter episodes for tomorrow
                        if (HomeServices.isTomorrow(moment(episodes[i].firstAired))) {
                            $scope.tomorrowsepisodes.push(episodes[i]);
                        }
                        // Filter episodes for this week
                        if (HomeServices.isWithinAWeek(moment(episodes[i].firstAired))) {
                            $scope.thisweeksepisodes.push(episodes[i]);
                        }
                    }
                });
            }

            /**
             * Get show based on show id
             *
             * @param(Number) id - The show's id
             */
            $scope.showName = function(id){
                for( var i=0; i<$scope.shows.length; i++){
                    if($scope.shows[i]._id === id){
                        return $scope.shows[i];
                    }
                }
            };
        });
    }])

.controller('SeriesCtrl', ['$scope', '$ionicModal', '$sce', '$state', '$stateParams', '$rootScope', 'Series', 'Actors', 'Episodes', 'Posters', 'Subscription', '$ionicPopup', '$timeout', '$cordovaToast', '$ionicPlatform', '$cordovaLocalNotification', 'ActorsCount', 'PostersCount', function($scope, $ionicModal, $sce, $state, $stateParams, $rootScope, Series, Actors, Episodes, Posters, Subscription, $ionicPopup, $timeout, $cordovaToast, $ionicPlatform, $cordovaLocalNotification, ActorsCount, PostersCount){
        $scope.show = {};
        $scope.episodes = [];
        $scope.seasons = [];
        $scope.firstAired = [];
        $scope.posters = [];
        $scope.actors = [];
        $scope.isSubscribed = false;
        $scope.isInWatchlist = false;
        $scope.isInFavorites = false;
        $scope.count = 0;

        $scope.showImages = function(index) {
            $scope.activeSlide = index;
            $scope.showModal('templates/image-popover.html');
        }

        $scope.showModal = function(templateUrl) {
            $ionicModal.fromTemplateUrl(templateUrl, {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }

        /**
         * Close the closeModal
         */
        $scope.closeModal = function() {
            $scope.modal.hide();
            $scope.modal.remove();
        };

        // Get Actors for the series
        // Actors.query({seriesId: $stateParams.seriesId}, function(actors){
        //     $scope.actors = actors;
        // });

        ActorsCount.query({seriesId: $stateParams.seriesId}, function(count){
            $scope.count = count.result / 6;
            for (var i = 0; i < $scope.count; i++) {
                Actors.query({seriesId: $stateParams.seriesId, skip: i}, function(actors){
                    actors.forEach(function(element) {
                        $scope.actors.push(element);
                    }, this);
                });
            }
        });

        PostersCount.query({seriesId: $stateParams.seriesId}, function(count){
            $scope.count = count.result / 5;
            for(var i = 0; i < $scope.count; i++) {
                Posters.query({seriesId: $stateParams.seriesId, skip: i}, function(posters){
                    posters.forEach(function(element) {
                        $scope.posters.push(element);
                    }, this);
                });
            }
        }); 

        // Get Series details
        Series.query({ id: $stateParams.seriesId }, function(show) {
            $scope.show = show;

            // check if user has marked a show as his favorite
            if($scope.show.favorites.indexOf($rootScope.uid) !== -1){
                $scope.isInFavorites = true;
            }

            // check if user has added a show to his watch list
            if($scope.show.watchList.indexOf($rootScope.uid) !== -1){
                $scope.isInWatchlist = true;
            }

            // check if user has subscribed to a show
            if($scope.show.subscribers.indexOf($rootScope.uid) !== -1){
                $scope.isSubscribed = true;
            }
        });

        /**
         * Subscribe a user to a show
         */
        $scope.subscribe = function() {
            if($rootScope.currentUser){
                if($scope.isSubscribed){
                    Subscription.subscriptions($scope.show, $rootScope.uid).then(function(resp) {
                        if(resp.data === true){
                            $scope.isSubscribed = false;
                        }
                        $ionicPlatform.ready(function () {

                            $cordovaLocalNotification.schedule({
                                id: 1,
                                title: "Removed from Subscriptions",
                                text: $scope.show.seriesName
                            });

                            $cordovaToast
                              .show('Removed from Subscriptions '+$scope.show.seriesName, 'long', 'center')
                              .then(function (success) {
                                  // success
                              }, function (error) {
                                  // error
                            });
                        });
                        $state.go("app.series",{},{reload: "app.series"});
                    });
                }else{
                    Subscription.subscriptions($scope.show, $rootScope.uid).then(function(resp) {
                        if(resp.data === true){
                            $scope.isSubscribed = true;
                        }
                        $ionicPlatform.ready(function () {

                            $cordovaLocalNotification.schedule({
                                id: 1,
                                title: "Added to Subscriptions",
                                text: $scope.show.seriesName
                            });

                            $cordovaToast
                              .show('Added to Subscriptions '+$scope.show.seriesName, 'long', 'center')
                              .then(function (success) {
                                  // success
                                  console.log("T");
                              }, function (error) {
                                  // error
                                  console.log("T");
                            });
                        });
                        $state.go("app.series",{},{reload: "app.series"});
                        var now = new Date().getTime();
                        var _10SecondsFromNow = new Date(now + 10 * 1000);
                    });
                }
            }else{
                var alertPopup = $ionicPopup.alert({
                    title: 'Login In Required',
                    template: 'Log in to subscribe'
                });
            }
        };

        /**
         * Add a show to user's watch list
         */
        $scope.addToWatchlist = function() {
            if($rootScope.currentUser){
                if($scope.isInWatchlist){
                    Subscription.watchlist($scope.show, $rootScope.uid).then(function(resp) {
                        if(resp.data === true){
                            $scope.isInWatchlist = false;
                        }
                        $ionicPlatform.ready(function () {

                            $cordovaLocalNotification.schedule({
                                id: 1,
                                title: "Removed from Watch List",
                                text: $scope.show.seriesName
                            })

                            $cordovaToast
                                .show('Removed from Watch List '+$scope.show.seriesName, 'long', 'center')
                                .then(function (success) {
                                    // success
                                }, function (error) {
                                    // error
                            });
                        });

                        $state.go("app.series",{},{reload: "app.series"});
                    });

                }else{
                    Subscription.watchlist($scope.show, $rootScope.uid).then(function(resp) {
                        if(resp.data === true){
                            $scope.isInWatchlist = true;
                        }
                        $ionicPlatform.ready(function () {

                            $cordovaLocalNotification.schedule({
                                id: 1,
                                title: "Added to Watch List",
                                text: $scope.show.seriesName
                            })

                            $cordovaToast
                              .show('Added to Watch List '+$scope.show.seriesName, 'long', 'center')
                              .then(function (success) {
                                  // success
                              }, function (error) {
                                  // error
                            });
                        });
                        $state.go("app.series",{},{reload: "app.series"});
                    });
                }
            }else{
                var alertPopup = $ionicPopup.alert({
                    title: 'Login In Required',
                    template: 'Log in to add to watchlist'
                });
            }
        };

        /**
         * Add a show to user's favorites
         */
        $scope.addToFavorites = function() {
            if($rootScope.currentUser){
                if($scope.isInFavorites){
                    Subscription.favorites($scope.show, $rootScope.uid).then(function(resp) {
                        if(resp.data === true){
                            $scope.isInFavorites = false;
                        }
                        $ionicPlatform.ready(function () {

                            $cordovaLocalNotification.schedule({
                                id: 1,
                                title: "Removed from Favorites",
                                text: $scope.show.seriesName
                            });

                            $cordovaToast
                              .show('Removed from Favorites '+$scope.show.seriesName, 'long', 'center')
                              .then(function (success) {
                                  // success
                              }, function (error) {
                                  // error
                            });
                        });
                        $state.go("app.series",{},{reload: "app.series"});
                    });
                }else{
                    Subscription.favorites($scope.show, $rootScope.uid).then(function(resp) {
                        if(resp.data === true){
                            $scope.isInFavorites = true;
                        }
                        $ionicPlatform.ready(function () {

                            $cordovaLocalNotification.schedule({
                                id: 1,
                                title: "Added to Favorites",
                                text: $scope.show.seriesName
                            });

                            $cordovaToast
                              .show('Added to Favorites '+ $scope.show.seriesName, 'long', 'center')
                              .then(function (success) {
                                  // success
                              }, function (error) {
                                  // error
                            });
                        });
                        $state.go("app.series",{},{reload: "app.series"});
                    });
                }
            }else{
                var alertPopup = $ionicPopup.alert({
                    title: 'Login In Required',
                    template: 'Log in to add to favorites'
                });
            }
        };

        // Get episodes for a show based on series id
        Episodes.query({seriesId: $stateParams.seriesId}, function(episodes){
            $scope.episodes = episodes;
            var temp = [];
            for(let i = 0; i < $scope.episodes.length; i++){
                if($scope.episodes[i].airedSeason !== 0){
                    temp.push($scope.episodes[i].airedSeason);
                }
            }
            $scope.seasons = temp.unique();
            temp = [];
            for(let i = 0; i < $scope.episodes.length; i++){
                if($scope.episodes[i].airedSeason !== 0){
                    if($scope.episodes[i].firstAired !== null){
                        let year = $scope.episodes[i].firstAired.toString().substr(0,4);
                        temp.push(year);
                    }
                }
            }
            $scope.firstAired = temp.unique();
            temp = [];

            for(let i = 0; i < $scope.episodes.length; i++){
                var date = new Date($scope.episodes[i].firstAired);
                if(date.getTime() > Date.now())
                    if($scope.isSubscribed){
                    $ionicPlatform.ready(function () {
                        $cordovaLocalNotification.schedule({
                            id: 1,
                            title: "Show airs on " + date,
                            text: $scope.show.seriesName + ": " + $scope.episodes[i].episodeName,
                            at: new Date(date.getTime() - 3600*1000)
                        }).then(function () {
                        },
                        function () {
                        });
                    });
                }
            }
        });
    }])

.controller('EpisodeCtrl', ['$scope', '$state', '$stateParams', '$rootScope', 'Series', 'Episodes', 'commentFactory', '$ionicSlideBoxDelegate', function($scope, $state, $stateParams, $rootScope, Series, Episodes, commentFactory, $ionicSlideBoxDelegate){
        $scope.show = {};
        $scope.episodes = [];
        $scope.showEditForm = false;
        var sortBySeason = (function(a, b) {
            return parseFloat(a) - parseFloat(b);
        });

        $scope.options = {
          loop: false,
          effect: 'flip',
          speed: 500,
        }

        $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
          // data.slider is the instance of Swiper
          $scope.slider = data.slider;
        });

        $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
          // note: the indexes are 0-based
          $scope.activeIndex = data.slider.activeIndex;
          $scope.previousIndex = data.slider.previousIndex;
        });

        $ionicSlideBoxDelegate.update();

        // GET a show based on show id
        Series.query({ id: $stateParams.seriesId }, function(show) {
            $scope.show = show;

            /**
             * Change application state based on season number
             */
            $scope.changeStateSeason = function(season){
                $state.go('app.episode', {seriesId: show._id, season: season, year: null});
            };

            /**
             * Change application state based on year
             */
            $scope.changeStateYear = function(year){
                $state.go('app.episode', {seriesId: show._id, season: null, year: year});
            };
        });

        $scope.mycomment = {
            comment: ""
        };

        $scope.editcomment = {
            comment: ""
        }

        /**
         * Submit a comment on episode page of a show
         */
        $scope.submitComment = function (id) {

            commentFactory.save({id: id}, $scope.mycomment);

            $state.go($state.current, {}, {reload: true});

            $scope.commentForm.$setPristine();
        };

        /**
         * Edit a comment on episode page of a
         * show if comment belongs to user
         */
        $scope.editComment = function(id, commentId) {
            commentFactory.update({id: id, commentId: commentId}, $scope.editcomment);

            $state.go($state.current, {}, {reload: true});
        };

        /**
         * Delete a comment on episode page of a
         * show if comment belongs to user
         */
        $scope.deleteComment = function(id, commentId) {
            commentFactory.delete({id: id, commentId: commentId});

            $state.go($state.current, {}, {reload: true});
        };

        Episodes.query({seriesId: $stateParams.seriesId}, function(episodes){
            if($stateParams.season){
                for(let i = 0; i < episodes.length; i++){
                    if(episodes[i].airedSeason !== 0 &&
                        episodes[i].airedSeason == $stateParams.season){
                        $scope.episodes.push(episodes[i]);
                    }
                }
            }else if($stateParams.year){
                for(let i = 0; i < episodes.length; i++){
                    if(episodes[i].airedSeason !== 0 &&
                        episodes[i].firstAired.substr(0,4) == $stateParams.year){
                        $scope.episodes.push(episodes[i]);
                    }
                }
            }

            $scope.totalItems = $scope.episodes.length;
            $scope.currentPage = 1;
            $scope.itemsPerPage = 1;

            var temp = [];
            for(let i = 0; i < episodes.length; i++){
                if(episodes[i].airedSeason !== 0){
                    temp.push(episodes[i].airedSeason);
                }
            }
            $scope.seasons = temp.unique();
            temp = [];
            for(let i = 0; i < episodes.length; i++){
                if(episodes[i].airedSeason !== 0){
                    temp.push(episodes[i].firstAired.substr(0,4));
                }
            }
            $scope.firstAired = temp.unique();
            temp = [];
        });
    }])

.controller('SearchCtrl', ['$scope', 'Shows', 'filterFilter', 'HomeServices', function($scope, Shows, filterFilter, HomeServices){
    $scope.search = {};
    $scope.shows = [];

    /**
     * Reset filters for search
     */
    $scope.resetFilters = function () {
        // needs to be a function or it won't trigger a $watch
        $scope.search = {};
    };

    // get all shows
    Shows.query({}, function(resp){
        // Sorts the shows based on show rating
        temp = resp.sort(HomeServices.compare);
        $scope.shows = temp;
        $scope.headingTitle = 'All Shows';
        $scope.totalItems = temp.length;
        $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
        $scope.resetFilters();
    });

    /**
     * Register a watch on the 'search' variable
     */
    $scope.$watch('search', function (newVal, oldVal) {
        $scope.filtered = filterFilter($scope.shows, newVal);
        $scope.totalItems = $scope.filtered.length;
        $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
        $scope.currentPage = 1;
    }, true);

}])

.controller('UserCtrl', ['$scope', '$rootScope', 'Shows', 'HomeServices', function($scope, $rootScope, Shows, HomeServices){
    $scope.shows = [];
    Shows.query({}, function(resp) {
        // Sort shows by rating
        $scope.shows = resp.sort(HomeServices.compare);
    });

}]);