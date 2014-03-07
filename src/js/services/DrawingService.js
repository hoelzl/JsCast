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

      // TODO: Get these values from the configuration.§
      var mainCanvas = document.getElementById('main-canvas');
      var mainDiv = document.getElementById('main-div');
      var canvasHeight = 1000;
      var canvasWidth = 1600;
      var defaultFontSize = 48;
      var divBorder = 50;

      mainCanvas.height = canvasHeight;
      mainCanvas.width = canvasWidth;
      mainDiv.height = canvasHeight;
      mainDiv.width = canvasWidth;

      this._mainCanvas = mainCanvas;
      this._mainDiv = mainDiv;
      this._canvasHeight = canvasHeight;
      this._canvasWidth = canvasWidth;
      this._defaultFontSize = defaultFontSize;
      this._divBorder = divBorder;
      this._currentSlide = null;

      document.defaultView.addEventListener('resize', () => {
         this.invalidateLayout();
      });

      domReady(() => setTimeout(() => {
         this.invalidateLayout();
      }));
   }

   drawSlide (slide = this._currentSlide) {
      // console.log('drawContents called');
      this._currentSlide = slide;
      var canvas = this._mainCanvas;
      var div = this._mainDiv;
      // Clear the canvas
      //noinspection SillyAssignmentJS
      canvas.width = canvas.width;
      if (slide) {
         var text = slide.text;
         if (text) {
            // console.log('drawing text');
            // TODO: Maybe set HTML from markdown?
            div.innerText = text;
            var context = canvas.getContext('2d');
            context.beginPath();
            context.rect(200, 150, 400, 200);
            context.fillStyle = slide.backgroundColor;
            context.fill();
            context.lineWidth = 7;
            context.strokeStyle = slide.forgroundColor;
            context.stroke();
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

      // console.log('dimensions:', viewport.width(), offsetLeft, inspectorWidth,
      //             additionalOffset);

      return {
         top:  offsetTop,
         left: offsetLeft,
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
         scale:     scale,
         canvasCss: {
            position: 'absolute',
            top:      maxDimensions.top,
            left:     maxDimensions.left,
            height: canvasHeight * scale,
            width: canvasWidth * scale
         },
         divCss:    {
            position: 'absolute',
            top: maxDimensions.top + this._divBorder * scale,
            left: maxDimensions.left + this._divBorder * scale,
            height: (canvasHeight - 2 * this._divBorder) * scale,
            width: (canvasWidth - 2 * this._divBorder) * scale
         }}
   }

   resizeCanvas () {
      var mainCanvas = $('#main-canvas');
      var dimensions = this.computeScaledDimensions(mainCanvas);
      var css = dimensions.canvasCss;
      var divCss = dimensions.divCss;
      var scale = dimensions.scale;

      // console.log('resizing canvas', dimensions.height, dimensions.width);

      // Set the dimensions of the main drawing area and position it absolutely.
      var $mainCanvas = $(this._mainCanvas);
      var $mainDiv = $(this._mainDiv);
      $mainCanvas.css(css);
      $mainDiv.css(divCss);
      $mainDiv.css('font-size', this._defaultFontSize * scale);
      // Adjust the inspector and slide list as well.
      $('#slide-list').height(css.height);
      $('#inspector').height(css.height);
      this.emit('canvas-resized');
   }

   invalidateLayout () {
      // console.log('invalidateLayout()')
      setTimeout(() => {
         this.resizeCanvas();
         this.drawSlide();
      })
   }
}

app.service('DrawingService', DrawingService);

export default DrawingService;