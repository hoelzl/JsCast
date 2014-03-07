/**
 * Created by tc on 6/Mar/2014.
 */

module _ from 'lodash';
module domReady from 'domReady';
import {app} from 'app';
import {Slide} from 'Slide';

import EventEmitter from 'EventEmitter';

export class DrawingService extends EventEmitter {

   constructor () {
      super();
      // console.log('Creating new DrawingService');

      var mainCanvas = document.getElementById('main-canvas');
      var canvasHeight = 1000;
      var canvasWidth = 1600;
      mainCanvas.height = canvasHeight;
      mainCanvas.width = canvasWidth;

      this._mainCanvas = mainCanvas;
      this._canvasHeight = canvasHeight;
      this._canvasWidth = canvasWidth;
      this._currentSlide = null;

      document.defaultView.addEventListener('resize', () => {
         this.invalidateLayout();
      });

      domReady(() => setTimeout(() => {
         this.invalidateLayout();
      }));
   }

   drawSlide (slide) {
      // console.log('drawContents called');
      if (slide) {
         this._currentSlide = slide;
      } else {
         slide = this._currentSlide;
      }
      var canvas = this._mainCanvas;
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
   }

   computeMaxDimensions (canvas = this._mainCanvas) {
      canvas = $(canvas);
      var slideList = $('#slide-list');

      if (slideList.length > 0) {
         var offsetLeft = slideList.offset().left + slideList.outerWidth(true);
         var offsetTop = slideList.offset().top;
      } else {
         offsetLeft = 0;
         offsetTop = canvas.offset().top;
      }

      var inspector = $('#inspector');
      var inspectorWidth = inspector.outerWidth(true) || 0;

      var additionalOffset = canvas.outerWidth(true) - canvas.outerWidth();
      var viewport = $(document.defaultView);

      console.log('dimensions:', viewport.width(), offsetLeft, inspectorWidth,
                  additionalOffset);

      return {
         height: viewport.height() - offsetTop - 10,
         width: viewport.width() - offsetLeft - inspectorWidth -
                additionalOffset
      }
   }

   computeScaledDimensions (canvas = this._mainCanvas) {
      canvas = $(canvas);

      var maxDimensions = this.computeMaxDimensions(canvas)
      var canvasHeight = this._canvasHeight;
      var canvasWidth = this._canvasWidth;

      var scaleHeight = maxDimensions.height / canvasHeight;
      var scaleWidth = maxDimensions.width / canvasWidth;
      var scale = Math.min(scaleWidth, scaleHeight);

      return {
         height: canvasHeight * scale,
         width: canvasWidth * scale
      }
   }

   resizeCanvas () {
      var mainCanvas = $('#main-canvas');
      var dimensions = this.computeScaledDimensions(mainCanvas);

      console.log('resizing canvas', dimensions.height, dimensions.width);

      var $mainCanvas = $(this._mainCanvas);
      $mainCanvas.height(dimensions.height);
      $mainCanvas.width(dimensions.width);
      // And adjust the inspector and slide list as well.  But use the CSS height here.
      $('#slide-list').height(dimensions.height);
      $('#inspector').height(dimensions.height);
      this.emit('canvas-resized');
   }

   redrawSlide () {
      if (this._currentSlide) {
         this.drawSlide(this._currentSlide);
      }
   }

   invalidateLayout () {
      setTimeout(() => {
         this.resizeCanvas();
         this.redrawSlide();
      })
   }
}

app.service('DrawingService', DrawingService);

export default DrawingService;