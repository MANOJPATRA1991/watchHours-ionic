// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'starter.filters'])

.run(function($ionicPlatform, $state, $rootScope, $ionicLoading, $cordovaSplashscreen, $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  // to toggle menu bars
  $rootScope.scrolling = false;

  $rootScope.$on('loading:show', function () {
      $ionicLoading.show({
          template: '<ion-spinner></ion-spinner> Loading ...'
      })
  });

  $rootScope.$on('loading:hide', function () {
      $ionicLoading.hide();
  });

  $rootScope.$on('$stateChangeStart', function () {
      $rootScope.$broadcast('loading:show');
  });

  $rootScope.$on('$stateChangeSuccess', function () {
      $rootScope.$broadcast('loading:hide');
  });

  Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
  };

  Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
  };
})

.config(function($stateProvider, $urlRouterProvider,
        $ionicConfigProvider, $cordovaInAppBrowserProvider) {

  var defaultOptions = {
    location: 'yes',
    clearcache: 'no',
    toolbar: 'no'
  };

  document.addEventListener("deviceready", function () {
    $cordovaInAppBrowserProvider.setDefaultOptions(defaultOptions);

  }, false);

  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.tabs.style('standard');
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

    .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
        controller: 'SearchCtrl'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })

    .state('app.series', {
      url: '/series/:seriesId',
      views: {
        'menuContent': {
          templateUrl: 'templates/series.html',
          controller: 'SeriesCtrl'
        }
      }
    })

    .state('app.episode', {
        url: '/series/:seriesId/episodes?season&year',
        views: {
            // Absolutely targets the 'content' view in the 'app' state
            'menuContent': {
                templateUrl: 'templates/episode.html',
                controller: 'EpisodeCtrl'
            }
        }
    })

    .state('app.user', {
        url: 'user/:id',
        views: {
            // Absolutely targets the 'content' view in the 'app' state
            'menuContent': {
                templateUrl: 'templates/user.html',
                controller: 'UserCtrl'
            }
        }
    });
  $urlRouterProvider.otherwise('/app/home');
});