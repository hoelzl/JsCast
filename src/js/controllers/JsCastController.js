/**
 * Created by tc on 3/Mar/2014.
 */

import 'config';
import 'SlideService';
import {app} from 'app';
import Slide from 'Slide';

// console.log('loading JsCastController');

function jsCastController ($scope, config, drawingService, slideService) {

   function makeObjectAdder (creator) {
      return () => {
         var slide = slideService.current.slide;
         drawingService[creator](obj => {
            $scope.safeApply(() => slideService.addObject(obj, slide))
         });
      }
   }

   // TODO: Maybe this should be a dedicated service?
   $scope.safeApply = (fn) => {
      var phase = $scope.$root.$$phase;
      if (phase == '$apply' || phase == '$digest') {
         if (fn && typeof(fn) === 'function') {
            // console.log('Not calling apply');
            fn();
         }
      } else {
         // console.log('Calling apply');
         $scope.$apply(fn);
      }
   };

   $scope.appName = config.appName;

   $scope.dirty = () => slideService.dirty;

   Object.defineProperty($scope, 'slides', {
      get: () => slideService.slides
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
      return slideService.duplicateSlide($scope.safeApply);
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
      drawingService.invalidateLayout();
   };

   $scope.redraw = () => {
      // console.log('redrawing');
      drawingService.drawSlide(slideService.current.slide);
   };

   $scope.addRectangle = makeObjectAdder('newRectangle');

   $scope.addEllipse = makeObjectAdder('newEllipse');

   $scope.addTriangle = makeObjectAdder('newTriangle');

   $scope.addSvgImage = makeObjectAdder('newSvgImage');

   $scope.addPngImage = makeObjectAdder('newPngImage');

   $scope.$watch('revision()', () => {
      // console.log('Dirty watch');
      drawingService.drawSlide(slideService.current.slide);
   });

}

export var controller = app.controller('JsCastController',
                                       ['$scope', 'config', 'DrawingService',
                                        'SlideService', jsCastController]);

export default controller;
