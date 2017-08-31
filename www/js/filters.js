angular.module('starter.filters', [])
    .filter('fromNow', function() {
        return function(date) {
            return moment(date).fromNow();
        }
    })

    .filter('startFrom', function () {
        return function (input, start) {
            if (input) {
                start = +start;
                return input.slice(start);
            }
            return [];
        };
    })

    .filter('subscribers', ['$rootScope', function($rootscope){
        return function(input){
            var out = [];
            for (var i = 0; i < input.length; i++) {
                if(input[i].subscribers.indexOf($rootscope.uid) !== -1){
                    out.push(input[i]);
                }
            }
            return out;
        }
    }])

    .filter('watchList', ['$rootScope', function($rootscope){
        return function(input){
            var out = [];
            for (var i = 0; i < input.length; i++) {
                if(input[i].watchList.indexOf($rootscope.uid) !== -1){
                    out.push(input[i]);
                }
            }
            return out;
        }
    }])

    .filter('favorites', ['$rootScope', function($rootscope){
        return function(input){
            var out = [];
            for (var i = 0; i < input.length; i++) {
                if(input[i].favorites.indexOf($rootscope.uid) !== -1){
                    out.push(input[i]);
                }
            }
                return out;
        }
    }]);