/**
 * Created by tc on 3/Mar/2014.
 */

import 'config';
import 'SlideService';
import {app} from 'app';
import Slide from 'Slide';

// console.log('loading JsCastController');

function getMainCanvas () {
   return document.getElementById('main-canvas');
}

function jsCastController ($scope, config, slideService) {

   $scope.appName = config.appName;

   $scope.dirty = slideService.dirty;
   Object.defineProperty($scope, 'slides', {
      get: () => slideService.slides,
   });

   Object.defineProperty($scope, 'current', {
      get: () => slideService.current,
      set: (newSlide) => slideService.current = newSlide
   });

   $scope.revision = () => {
      return slideService.revision();
   };
   $scope.newSlide = () => {
      return slideService.newSlide();
   };
   $scope.duplicateSlide = () => {
      return slideService.duplicateSlide();
   };
   $scope.deleteSlide = () => {
      return slideService.deleteSlide();
   };

   $scope.inspector = {
      visible: true
   };

   $scope.slideList = {
      visible: true
   };

   $scope.toggle = (thing) => {
      thing.visible = !thing.visible;
      $scope.dirty();
   };

   // TODO: This should not be here!
   $scope.drawContents = () => {
      // console.log('drawContents called');
      var slide = slideService.current.slide;
      var canvas = getMainCanvas();
      // Clear the canvas
      //noinspection SillyAssignmentJS
      canvas.width = canvas.width;
      if (slide) {
         var text = slide.text;
         if (text) {
            // console.log('drawing text');
            var lines = text.split('\n');
            var y = 100;
            var context = canvas.getContext('2d');
            context.font = 'italic 40pt Calibri';
            for (var line of lines) {
               context.fillText(line, 50, y);
               y += 60;
            }
         }
      }
   };

   $scope.$watch('revision()', () => {
      console.log('Dirty watch');
      setTimeout($scope.drawContents)
   });

}

export var controller = app.controller('JsCastController',
                                       ['$scope', 'config', 'SlideService', jsCastController]);

export default controller;
