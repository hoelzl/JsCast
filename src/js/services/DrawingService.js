/**
 * Created by tc on 6/Mar/2014.
 */

module _ from 'lodash';
module domReady from 'domReady';
module fabric from 'fabric'

import {app} from 'app';
import {Slide} from 'Slide';

import EventEmitter from 'EventEmitter';

// To make WebStorm happy...
var domReady;

var colors = ['yellow', 'red', 'blue', 'green', 'violet', 'magenta', 'cyan',
              'lightblue', 'lightgoldenrodyellow', 'lightcoral', 'coral',
              'darkblue', 'gray', 'lightgray', 'darkgray'];

export function randomColor () {
   return colors[Math.round(Math.random() * colors.length)];
}


export class DrawingService extends EventEmitter {

   constructor () {
      super();
      // console.log('Creating new DrawingService');

      // TODO: Get these values from the configuration.
      var mainCanvas = document.getElementById('main-canvas');
      var containerDiv = document.getElementById('container-div');
      var mainDiv = document.getElementById('main-div');
      var canvasHeight = 1000;
      var canvasWidth = 1600;
      var fabricCanvas = new fabric.Canvas('main-canvas', {
         height: canvasHeight,
         width: canvasWidth
      });

      var defaultFontSize = 48;
      var divBorder = 50;
      if (mainCanvas) {
         mainCanvas.height = canvasHeight;
         mainCanvas.width = canvasWidth;
      }
      if (mainDiv) {
         mainDiv.height = canvasHeight;
         mainDiv.width = canvasWidth;
      }

      this._mainCanvas = mainCanvas;
      this._fabricCanvas = fabricCanvas;
      this._containerDiv = containerDiv;
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

   newRectangle () {
      var rect = new fabric.Rect({ width: 200 * Math.random() + 50,
                                height: 200 * Math.random() + 50,
                                top: 200 * Math.random() + 50,
                                left: 200 * Math.random() + 50,
                                fill:       randomColor() });
      rect.set('selectable', true);
      return rect;
   }

   drawSlide (slide = this._currentSlide) {
      // console.log('drawContents called');
      this._currentSlide = slide;
      if (!slide) return;

      var canvas = this._mainCanvas;
      var div = this._mainDiv;
      // Clear the canvas
      //noinspection SillyAssignmentJS
      canvas.width = canvas.width;
      if (div) {
         var text = slide.text;
         if (text) {
            console.log('drawing text');
            // TODO: Maybe set HTML from markdown?
            div.innerText = text;
         }
      }
      var fabricCanvas = this._fabricCanvas;
      if (fabricCanvas) {
         fabricCanvas.deactivateAll();
         fabricCanvas.clear();
         for (var i = 0, len = slide.objects.length; i < len; i++) {
            fabricCanvas.add(slide.objects[i]);
         }
         fabricCanvas.renderAll();
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

      var maxDimensions = this.computeMaxDimensions(canvas);
      var canvasHeight = this._canvasHeight;
      var canvasWidth = this._canvasWidth;

      var scaleHeight = maxDimensions.height / canvasHeight;
      var scaleWidth = maxDimensions.width / canvasWidth;
      var scale = Math.min(scaleWidth, scaleHeight);

      return {
         scale:     scale,
         maxHeight: maxDimensions.height,
         canvasCss: {
            position: 'absolute',
            top:      maxDimensions.top,
            left:     maxDimensions.left,
            height: canvasHeight * scale,
            width: canvasWidth * scale
         },
         divCss:    {
            position: 'absolute',
            top: this._divBorder * scale,
            left: this._divBorder * scale,
            height: (canvasHeight - 2 * this._divBorder) * scale,
            width: (canvasWidth - 2 * this._divBorder) * scale
         }}
   }

   resizeCanvas () {
      if (this._mainCanvas) {
         var mainCanvas = this._mainCanvas;
         var dimensions = this.computeScaledDimensions(mainCanvas);
         var css = dimensions.canvasCss;
         var divCss = dimensions.divCss;
         var scale = dimensions.scale;

         // console.log('resizing canvas', dimensions.height, dimensions.width);

         // Set the dimensions of the main drawing area and position it absolutely.

         mainCanvas.height = css.height;
         mainCanvas.width = css.width;
         var $containerDiv = $(this._containerDiv);
         var $mainCanvas = $(mainCanvas);
         var $mainDiv = $(this._mainDiv);
         $containerDiv.css(css);

         // Children of the main canvas have to positioned relative to the
         // canvas, not the page...
         css.left = 0;
         css.top = 0;
         $mainCanvas.css(css);
         $mainDiv.css(divCss);
         $mainDiv.css('font-size', this._defaultFontSize * scale);
         this._fabricCanvas.setDimensions(css);

         // Adjust the inspector and slide list as well.
         $('#slide-list').height(dimensions.maxHeight);
         $('#inspector').height(dimensions.maxHeight);
         this.emit('canvas-resized');
      }
   }

   invalidateLayout () {
      // console.log('invalidateLayout()')
      setTimeout(() => {
         this.resizeCanvas();
         setTimeout(() => this.drawSlide());
      })
   }
}

app.service('DrawingService', DrawingService);

export default DrawingService;