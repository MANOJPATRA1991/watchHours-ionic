angular.module('starter.controllers', ['ngResource', 'ngCordova'])

.controller('AppCtrl', ['$scope', '$state', '$rootScope', 'Shows', '$http', 
  '$location', '$localStorage', 'HomeServices', 'AuthFactory',
  '$ionicModal', '$ionicSideMenuDelegate', '$ionicPopup', '$timeout',
  function ($scope, $state, $rootScope, Shows, $http, 
    $location, $localStorage, HomeServices,
    AuthFactory, $ionicModal, $ionicSideMenuDelegate, $ionicPopup, $timeout) {
    console.log("Hello");
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

   // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    $scope.reservation = {};
    $scope.registration = {};
    $rootScope.currentUser = false;
    $rootScope.username = '';
    $rootScope.admin = false;
    $rootScope.uid = '';
    $rootScope.isVerified = false;
    
    if(AuthFactory.isAuthenticated()) {
      $rootScope.currentUser = true;
      $rootScope.username = AuthFactory.getUsername();
      $rootScope.admin = AuthFactory.isAdmin();
      $rootScope.isVerified = AuthFactory.isVerified();
      $rootScope.uid = AuthFactory.uid();
    }
    
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // For login via facebook retrieve username, token and id from url
    if($location.search().user){
        AuthFactory.storeCredentials({username: $location.search().user,
                                      token: $location.search().token,
                                      _id: $location.search()._id,
                                      isVerified: $location.search().isVerified});
        $rootScope.$broadcast('login:Successful');
    }

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);
        $localStorage.storeObject('userinfo',$scope.loginData);
        AuthFactory.login($scope.loginData);
        $scope.closeLogin();
    };
    
    $scope.logout = function() {
        AuthFactory.logout();
        $rootScope.currentUser = false;
        $rootScope.username = '';
        $rootScope.admin = false;
        $rootScope.isVerified = false;
        $rootScope.uid = '';
        $state.go("app.home");
    };
      
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
         template: 'Check username or password'
       });

       alertPopup.then(function(res) {
         console.log('Wrong username/password');
       });
    });

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    // Open the login modal
    $scope.register = function() {
        $scope.registerform.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doRegister = function() {
        if($scope.loginData.password === $scope.loginData.repeat_password){  
            console.log('Doing registration', $scope.loginData);   
            AuthFactory.register($scope.loginData);
        }else{
            var alertPopup = $ionicPopup.alert({
             title: 'Password mismatch',
             template: 'Passwords don\'t match'
           });

           alertPopup.then(function(res) {
             console.log('Wrong username/password');
           });
        }
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };

    // On successful registration
    $rootScope.$on('registration:Successful', function () {
        $rootScope.currentUser = AuthFactory.isAuthenticated();
        $rootScope.username = AuthFactory.getUsername();
        $rootScope.admin = AuthFactory.isAdmin();
        $rootScope.uid = AuthFactory.uid();
        $rootScope.isVerified = AuthFactory.isVerified();
    });

    $rootScope.$on('registration:Unsuccessful', function(){
       var alertPopup = $ionicPopup.alert({
         title: 'Sign up Error',
         template: 'Try again!'
       });

       alertPopup.then(function(res) {
         console.log('Wrong username/password');
       });
    });

    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
      };
}])

.controller('HomeCtrl', ['$scope', 'Shows', 'Episodes', 'HomeServices', function($scope, Shows, Episodes, HomeServices){
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

.controller('SeriesCtrl', ['$scope', '$ionicModal', '$sce', '$state', '$stateParams', '$rootScope', 'Series', 'Actors', 'Episodes', 'Posters', 'Subscription', '$ionicPopup', '$timeout', '$cordovaToast', '$ionicPlatform', '$cordovaLocalNotification', function($scope, $ionicModal, $sce, $state, $stateParams, $rootScope, Series, Actors, Episodes, Posters, Subscription, $ionicPopup, $timeout, $cordovaToast, $ionicPlatform, $cordovaLocalNotification){
        $scope.show = {};
        $scope.episodes = [];
        $scope.seasons = [];
        $scope.firstAired = [];
        $scope.posters = [];
        $scope.actors = [];
        $scope.isSubscribed = false;
        $scope.isInWatchlist = false;
        $scope.isInFavorites = false;

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
     
        // Close the modal
        $scope.closeModal = function() {
            $scope.modal.hide();
            $scope.modal.remove();
        };

        // Get Actors for the series
        Actors.query({seriesId: $stateParams.seriesId}, function(actors){
            $scope.actors = actors;
        });

        // Get Posters for the series
        Posters.query({seriesId: $stateParams.seriesId}, function(posters){
            $scope.posters = posters;
            $scope.currentPage = 1;
            $scope.totalItems = $scope.posters.length;
            $scope.entryLimit = 14; // items per page
            $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
        });

        // Get Series details
        Series.query({ id: $stateParams.seriesId }, function(show) {
            $scope.show = show;
            console.log(show.firstAired);

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
                            }).then(function () {
                                console.log('Removed from subscriptions '+$scope.show.seriesName);
                            },
                            function () {
                                console.log('Failed to remove from subscriptions ');
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
                            }).then(function () {
                                console.log('Added to subscriptions '+$scope.show.seriesName);
                            },
                            function () {
                                console.log('Failed to add to subscriptions ');
                            });
                        
                            $cordovaToast
                              .show('Added to Subscriptions '+$scope.show.seriesName, 'long', 'center')
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
                    template: 'Log in to subscribe'
                });

               alertPopup.then(function(res) {
                    console.log('Login In Required');
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
                            }).then(function () {
                                console.log('Removed from Watch List '+$scope.show.seriesName);
                            },
                            function () {
                                console.log('Failed to remove from watchlist ');
                            });
                        
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
                            }).then(function () {
                                console.log('Added to Watch List '+$scope.show.seriesName);
                            },
                            function () {
                                console.log('Failed to add to watchlist ');
                            });
                        
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

               alertPopup.then(function(res) {
                    console.log('Login In Required');
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
                            }).then(function () {
                                console.log('Removed from favorites '+$scope.show.seriesName);
                            },
                            function () {
                                console.log('Failed to remove from Favorites ');
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
                            }).then(function () {
                                console.log('Added to Favorites '+$scope.show.seriesName);
                            },
                            function () {
                                console.log('Failed to add to Favorites ');
                            });
                        
                            $cordovaToast
                              .show('Added to Favorites '+$scope.show.seriesName, 'long', 'center')
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

               alertPopup.then(function(res) {
                    console.log('Login In Required');
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
                    temp.push($scope.episodes[i].firstAired.substr(0,4));
                }
            }
            $scope.firstAired = temp.unique();
            temp = [];

            for(let i = 0; i < $scope.episodes.length; i++){
                var date = new Date($scope.episodes[i].firstAired);
                    if($scope.isSubscribed){
                    $ionicPlatform.ready(function () {

                        $cordovaLocalNotification.schedule({
                            id: 1,
                            title: "Show starts in " + date,
                            text: $scope.show.seriesName + ": " + $scope.episodes[i].episodeName,
                            at: date.setHours(date.getHours() - 2)
                        }).then(function () {
                            console.log('Removed from favorites '+$scope.show.seriesName);
                        },
                        function () {
                            console.log('Failed to remove from Favorites ');
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

        $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
          console.log('Slide change is beginning');
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