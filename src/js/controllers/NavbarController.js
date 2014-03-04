/**
 * Created by tc on 2/Mar/2014.
 */

import {app} from '../app';
import '../config';

// console.log('loading NavbarController');

var controller = app.controller('NavbarController',
                                ['$scope', 'config', function ($scope, config) {
    $scope.appName = config.appName;
}]);

export default controller;
