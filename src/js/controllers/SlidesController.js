/**
 * Created by tc on 3/Mar/2014.
 */

import {app} from '../app';
import '../config';

// console.log('loading SlidesController');

export var controller = app.controller('SlidesController', ['$scope', 'config',
    function ($scope, config) {
        $scope.appName = config.appName;
    }]);

export default controller;