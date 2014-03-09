/**
 * Created by tc on 6/Mar/2014.
 */

module _ from 'lodash';
module domReady from 'domReady';
module fabric from 'fabric';
module jQuery from 'jquery';

import {app} from 'app';
import {Slide} from 'Slide';

import EventEmitter from 'EventEmitter';

// To make WebStorm happy...
var domReady;

var colors = ['yellow', 'red', 'blue', 'green', 'violet', 'magenta', 'cyan',
              'lightblue', 'lightgoldenrodyellow', 'lightcoral', 'coral',
              'darkblue', 'gray', 'lightgray', 'darkgray'];

function randomElement (array) {
   return array[Math.round(Math.random() * array.length)];
}

export function randomColor () {
   return randomElement(colors);
}

var svgImages = ['assets/10-kg-weight.svg', 'assets/bird-1.svg',
                 'assets/happy-bird.svg', 'assets/tiger-1.svg',
                 'assets/wanderer.svg'];

export function randomSvgImage () {
   return randomElement(svgImages);
}


function mergeDefaultParameters (parameters, defaults) {
   return jQuery.extend(parameters || {}, defaults);
}

export class DrawingService extends EventEmitter {

   constructor () {
      super();
      // console.log('Creating new DrawingService');

      var mainCanvas = document.getElementById('main-canvas');
      var containerDiv = document.getElementById('container-div');
      var mainDiv = document.getElementById('main-div');
      // TODO: Get these values from the configuration.
      var designHeight = 1000;
      var designWidth = 1600;
      var fabricCanvas = new fabric.Canvas('main-canvas', {
         height: designHeight,
         width:  designWidth
      });

      var defaultFontSize = 48;
      var divBorder = 50;
      if (mainCanvas) {
         mainCanvas.height = designHeight;
         mainCanvas.width = designWidth;
      }
      if (mainDiv) {
         mainDiv.height = designHeight;
         mainDiv.width = designWidth;
      }

      this._mainCanvas = mainCanvas;
      this._fabricCanvas = fabricCanvas;
      this._containerDiv = containerDiv;
      this._mainDiv = mainDiv;
      this._designHeight = designHeight;
      this._designWidth = designWidth;
      this._designFontSize = defaultFontSize;
      this._scale = 1.0;
      this._canvasHeight = designHeight;
      this._canvasWidth = designWidth;
      this._divBorder = divBorder;
      this._currentSlide = null;

      document.defaultView.addEventListener('resize', () => {
         this.invalidateLayout();
      });

      domReady(() => setTimeout(() => {
         this.invalidateLayout();
      }, 0));
   }

   newObject (cont, kind = fabric.Rect, parameters = {}, defaults = {}) {
      parameters = mergeDefaultParameters(parameters, defaults);
      var obj = new kind(parameters);
      obj.set('selectable', true);
      cont(obj);
   }

   rectangleDefaults () {
      var result = {
         width: 200 * Math.random() + 50,
         height: 200 * Math.random() + 50,
         top: 200 * Math.random() + 50,
         left: 200 * Math.random() + 50,
         rx:   Math.random() > 0.5 ? 20 * Math.random() : 0,
         ry:   Math.random() > 0.5 ? 20 * Math.random() : 0,
         fill: randomColor(colors)
      };
      return result;
   }

   newRectangle (cont, parameters = {}) {
      this.newObject(cont, fabric.Rect, parameters, this.rectangleDefaults());
   }

   ellipseDefaults () {
      var result = {
         top: 200 * Math.random() + 50,
         left: 200 * Math.random() + 50,
         rx: 100 * Math.random() + 50,
         ry: 100 * Math.random() + 50,
         fill: randomColor(colors) };
      return result;
   }

   newEllipse (cont, parameters = {}) {
      this.newObject(cont, fabric.Ellipse, parameters, this.ellipseDefaults());
   }

   triangleDefaults () {
      var result = {
         width: 200 * Math.random() + 50,
         height: 200 * Math.random() + 50,
         top: 200 * Math.random() + 50,
         left: 200 * Math.random() + 50,
         fill: randomColor(colors) };

      return result;
   }

   newTriangle (cont, parameters = {}) {
      this.newObject(cont, fabric.Triangle, parameters,
                     this.triangleDefaults());
   }

   svgImageDefaults () {
      var result = {
         url: randomSvgImage(),
         width: 200 * Math.random() + 50,
         height: 200 * Math.random() + 50,
         top: 200 * Math.random() + 50,
         left: 200 * Math.random() + 50 };

      return result;
   }

   newSvgImage (cont, parameters = {}) {
      parameters = mergeDefaultParameters(parameters, this.svgImageDefaults());
      // TODO: Need to introduce error handling, etc.
      fabric.loadSVGFromURL(parameters.url, (objects, options) => {
         var group = fabric.util.groupSVGElements(objects, options);
         cont(group);
      });
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
            // console.log('drawing text');
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
      var designHeight = this._designHeight;
      var designWidth = this._designWidth;

      var scaleHeight = maxDimensions.height / designHeight;
      var scaleWidth = maxDimensions.width / designWidth;
      var scale = Math.min(scaleWidth, scaleHeight);

      return {
         scale:     scale,
         designScale: scaleHeight / this._designHeight,
         maxHeight: maxDimensions.height,
         canvasCss: {
            position: 'absolute',
            top:      maxDimensions.top,
            left:     maxDimensions.left,
            height: designHeight * scale,
            width: designWidth * scale
         },
         divCss:    {
            position: 'absolute',
            top: this._divBorder * scale,
            left: this._divBorder * scale,
            height: (designHeight - 2 * this._divBorder) * scale,
            width: (designWidth - 2 * this._divBorder) * scale
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

         this._scale = scale;

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
         $mainDiv.css('font-size', this._designFontSize * scale);
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