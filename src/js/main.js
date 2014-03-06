/**
 * Created by tc on 4/Mar/2014.
 */

module domReady from 'domReady';
module app from 'app';

// console.log('loading main.js');



export var start = () => {
   domReady(() => {
      angular.bootstrap(document, ['app']);
      // document.defaultView.addEventListener('resize', resizeCanvas);

      $('body').removeClass('hidden');
      // var scope = angular.$rootScope;
      // scope.computeMaxDimensions = computeMaxDimensions;
      // scope.resizeCanvas = resizeCanvas;

      // resizeCanvas();
   });
};

