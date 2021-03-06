/**
 * Created by tc on 6/Mar/2014.
 */

module _ from 'lodash';
module angular from 'angular';
import {app} from 'app';
import Slide from 'Slide';


export class SlideService {
   constructor ($sce) {
      console.log('Creating new SlideService:', $sce);
      this._slides = [];
      this._revision = 0;
      this.$sce = $sce;
      var service = this;

      this._current = {
         _slide:         null,
         _dirtyListener: () => service.dirty(),

         get slide () {
            return this._slide;
         },

         set slide (newSlide) {
            var oldSlide = this._slide;
            if (oldSlide) {
               oldSlide.removeListener('dirty', this._dirtyListener);
            }
            this._slide = newSlide;
            if (newSlide) {
               newSlide.on('dirty', this._dirtyListener);
            }
            service.dirty();
         }
      };
   }

   get slides () {
      return this._slides;
   }

   set slides (newValue) {
      this._slides = newValue;
      this.dirty();
   }

   get current () {
      return this._current;
   }

   dirty () {
      // console.log('dirty()', this.current.slide);
      this._revision++;
   }

   get (start, count, callback) {
      var array = this._slides.slice(start, start + count - 1);
      callback(array);
   }

   revision () {
      return this._revision;
   }

   findSlideIndex (slide) {
      return _.indexOf(this.slides, slide);
   }

   insertAfterSlide (originalSlide, newSlide) {
      var slides = this.slides;
      if (newSlide) {
         if (originalSlide) {
            slides.splice(_.indexOf(slides, originalSlide) + 1, 0, newSlide);
         } else {
            slides.push(newSlide);
         }
         this.current.slide = newSlide;
      } else {
         throw(Error('Trying to insert null as slide.'));
      }
   }

   newSlide () {
      var newSlide = new Slide();
      newSlide.textSanitizor = this.$sce.trustAsHtml;
      this.insertAfterSlide(this.current.slide, newSlide);
      return newSlide;
   }

   duplicateSlide (postCallback) {
      var originalSlide = this.current.slide;
      var newSlide;
      if (originalSlide) {
         newSlide = originalSlide.duplicate(postCallback);
      } else {
         newSlide = new Slide('Failed duplicate attempt');
      }
      this.insertAfterSlide(originalSlide, newSlide);
      return newSlide;
   }

   deleteSlide () {
      var deletedSlide = this.current.slide;
      if (deletedSlide) {
         var slideIndex = this.findSlideIndex(deletedSlide);
         var slides = this.slides;
         if (slideIndex >= 0) {
            slides.splice(slideIndex, 1);
            if (slideIndex >= slides.length) {
               if (slides.length > 0) {
                  this.current.slide = slides[slides.length - 1];
               } else {
                  this.current.slide = null;
               }
            } else {
               this.current.slide = slides[slideIndex];
            }
            this.dirty();
         } else {
            console.log('Trying to delete non-existent slide.')
         }
      }
      return deletedSlide;
   }

   addObject (object, slide) {
      if (slide) {
         slide.addObject(object);
         slide.dirty();
      }
   }
}

app.service('SlideService', SlideService);

export default SlideService;
