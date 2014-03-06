/**
 * Created by tc on 3/Mar/2014.
 */

import {app} from 'app';
import 'config';

// console.log('loading SlidesController');

function slidesController ($scope, config) {
   $scope.appName = config.appName;
}

export var controller = app.controller('SlidesController',
                                       ['$scope', 'config', slidesController]);

export default controller;