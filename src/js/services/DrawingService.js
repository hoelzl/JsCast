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
   return array[Math.floor(Math.random() * array.length)];
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

var MIN_CHANGE = 1e-8;

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
         height:          designHeight,
         width:           designWidth,
         backgroundColor: 'white'
      });

      fabricCanvas.on('object:modified', options => {
         this.updateDesignListener(options);
      });

      fabricCanvas.on('object:moving', options => {
         this.updateDesignListener(options);
      });

      fabricCanvas.on('object:scaling', options => {
         this.updateDesignListener(options);
      });

      fabricCanvas.on('object:rotating', options => {
         this.updateDesignListener(options);
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
      this.scale = 1.0;
      // this._canvasHeight = designHeight;
      // this._canvasWidth = designWidth;
      this._divBorder = divBorder;
      this._currentSlide = null;

      this._attributes = ['left', 'top', 'height', 'width', 'rx', 'ry',
                          'scaleX', 'scaleY', 'angle'];

      document.defaultView.addEventListener('resize', () => {
         this.invalidateLayout();
      });

      domReady(() => setTimeout(() => {
         this.invalidateLayout();
      }, 0));
   }

   updateDesignListener (options) {
      if (options && options.target) {
         this.setDesignFromCurrent(options.target);
      } else {
         console.log('Modified unknown object:', options);
      }
   }

   setDesignFromCurrent (object) {
      console.log('Setting design from current data', object.type);

      if (object.type === 'group') {
         _.forEach(object.objects, obj => {
            // this.setDesignFromCurrent(obj);
         });
      } else {
         var scale = this.scale;
         var design = object.design;

         // console.log('setDesignFromCurrent()', object, scale);
         _.forEach(this._attributes, (key) => {
            // console.log('Data:', key, 'design', design[key], 'object',
            //             object[key], 'scale', scale);
            var oldValue = design[key];
            var newValue;
            switch (key) {
               case 'left':
               case 'top':
               case 'height':
               case 'width':
               case 'rx':
               case 'ry':
                  newValue = object.get(key) / scale;
                  break;
               case 'scaleX':
               case 'scaleY':
                  if (object.type === 'path-group') {
                     newValue = object.get(key) / scale;
                  } else {
                     newValue = object.get(key);
                  }
                  break;
               default:
                  newValue = object.get(key);
            }
            // console.log('Data (after computation):', key, oldValue, newValue);
            if (!oldValue || Math.abs(oldValue - newValue) > MIN_CHANGE) {
               console.log(`Changing ${key} from ${oldValue} to ${newValue}`);
               design[key] = newValue;
            }
         });
      }
   }

   newObject (cont, kind = fabric.Rect, parameters = {}, defaults = {}) {
      parameters = mergeDefaultParameters(parameters, defaults);
      var obj = new kind(parameters);
      // This is to make sure that inconsistent values in the design are updated
      // before the object is passed to the application (e.g., rx != ry for
      // rectangles).
      this.setDesignFromCurrent(obj);
      cont(obj);
   }

   setCurrentFromDesign (object) {
      console.log('Setting current data from design:', object.type);
      var scale = this.scale;
      var design = object.design;
      _.forEach(this._attributes, (key) => {
         var oldValue = object[key];
         var newValue;
         switch (key) {
            case 'left':
            case 'top':
            case 'height':
            case 'width':
            case 'rx':
            case 'ry':
               newValue = design[key] * scale;
               break;
            case 'scaleX':
            case 'scaleY':
               if (object.type === 'path-group') {
                  newValue = design[key];
               } else {
                  newValue = object[key];
               }
               break;
            default:
               newValue = design[key];
         }
         if (newValue !== undefined &&
             (oldValue === undefined || Math.abs(oldValue - newValue) > MIN_CHANGE)) {
            console.log(`Changing ${key} from ${oldValue} to ${newValue}`);
            object.set(key, newValue);
         }
      });
      if (object.type === 'path-group') {
         object.scale(scale);
      }
   }

   generateDesign (parameters) {
      var result = {};
      for (var key in parameters) {
         var value = parameters[key];
         if (value[0] >= 0) {
            result[key] = value[0] * Math.random() + value[1];
         } else {
            value[0] = -value[0];
            result[key] = Math.random() > 0.5 ?
               value[0] * Math.random() + value[1] : 0;
         }
      }
      return result;
   }

   rectangleDefaults () {
      var design = this.generateDesign({
                                          height: [400, 100],
                                          width:  [600, 200],
                                          top:    [200, 0],
                                          left:   [300, 0],
                                          rx:     [-40, 0],
                                          ry:     [-40, 0],
                                          scaleX: [0, 1],
                                          scaleY: [0, 1],
                                          angle:  [0, 0]
                                       });
      design.top += design.height / 2;
      design.left += design.width / 2;
      var scale = this.scale;

      return {
         design: design,
         height: design.height * scale,
         width: design.width * scale,
         top: design.top * scale,
         left: design.left * scale,
         rx: design.rx * scale,
         ry: design.ry * scale,
         scaleX: design.scaleX,
         scaleY: design.scaleY,
         fill:   randomColor(colors)
      };
   }

   newRectangle (cont, parameters = {}) {
      this.newObject(cont, fabric.Rect, parameters, this.rectangleDefaults());
   }

   ellipseDefaults () {
      var design = this.generateDesign({
                                          height: [400, 100],
                                          width:  [600, 200],
                                          top:    [300, 0],
                                          left:   [400, 0],
                                          rx:     [200, 100],
                                          ry:     [200, 100],
                                          scaleX: [0, 1],
                                          scaleY: [0, 1],
                                          angle:  [0, 0]
                                       });
      var scale = this.scale;

      return {
         design: design,
         top: design.top * scale,
         left: design.left * scale,
         rx: design.rx * scale,
         ry: design.ry * scale,
         fill:   randomColor(colors)
      };
   }

   newEllipse (cont, parameters = {}) {
      this.newObject(cont, fabric.Ellipse, parameters, this.ellipseDefaults());
   }

   triangleDefaults () {
      var design = this.generateDesign({
                                          height: [600, 100],
                                          width:  [800, 200],
                                          top:    [400, 0],
                                          left:   [600, 0],
                                          scaleX: [0, 1],
                                          scaleY: [0, 1],
                                          angle:  [0, 0]
                                       });
      var scale = this.scale;

      return {
         design: design,
         height: design.height * scale,
         width: design.width * scale,
         top: design.top * scale,
         left: design.left * scale,
         fill:   randomColor(colors)
      };
   }

   newTriangle (cont, parameters = {}) {
      this.newObject(cont, fabric.Triangle, parameters,
                     this.triangleDefaults());
   }


   svgImageDefaults () {
      var design = this.generateDesign({
                                          top:    [200, 0],
                                          left:   [300, 0],
                                          scaleX: [0, 1],
                                          scaleY: [0, 1],
                                          angle:  [0, 0]
                                       });
      var scale = this.scale;

      return {
         design: design,
         top: design.top * scale,
         left: design.left * scale
      };
   }

   newSvgImage (cont, url = randomSvgImage(), parameters = {}) {
      parameters = mergeDefaultParameters(parameters, this.svgImageDefaults());
      // console.log('newSvgImage:', parameters.url);
      // TODO: Need to introduce error handling, etc.
      fabric.loadSVGFromURL(url, (objects, options) => {
         var scale = this.scale;
         options = mergeDefaultParameters(options, parameters);
         var group = fabric.util.groupSVGElements(objects, options);
         group.scale(scale);
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

         this.scale = scale;

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

         var fabricCanvas = this._fabricCanvas;
         fabricCanvas.discardActiveGroup();
         fabricCanvas.discardActiveObject();
         fabricCanvas.setDimensions(css);

         if (this._currentSlide) {
            var objects = this._currentSlide.objects;
            // console.log('resizeCanvas(): updating objects', objects);
            for (var i = 0, len = objects.length; i < len; i++) {
               this.setCurrentFromDesign(objects[i]);
            }
         }

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