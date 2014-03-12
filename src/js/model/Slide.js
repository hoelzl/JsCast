/**
 * Created by tc on 4/Mar/2014.
 */

import EventEmitter from 'EventEmitter';

var currentId = 1;

function defaultText (slideId) {
   return `<h1>Slide ${slideId}</h1>
   The slide text can contain <b>any</b> kind of <i>Markup</i>
   <ul>
     <li>Even lists</li>
     <li>With multiple items</li>
     <li>They could be <span style="color: red;">numbered</span>, too...</li>
   </ul>
   (However I still need to update the resizing behavior for headings and other
    non-paragraph text.)
   `
}

export class Slide extends EventEmitter {
   constructor (title = `Slide ${currentId}`,
                text = defaultText(currentId),
                thumbnail = `[thumbnail ${currentId}]`,
                objects = [], textSanitizer = null) {
      super();
      this.title = title;
      this._text = text;
      this.objects = objects;
      this.thumbnail = thumbnail;
      this.id = currentId++;
      this.textSanitizer = textSanitizer;
   }

   toObject () {
      return { //
         title: this.title,
         _text: this.text,
         objects: _.map(this.objects, obj => obj.toObject(['design'])),
         thumbnail: this.thumbnail,
         id: this.id
      }
   }

   toJson () {
      return JSON.stringify(this.toObject());
   }

   static fromObject(obj) {
      var slide = new Slide(obj.title, obj._text, obj.thumbnail);
      slide.id = obj.id;
      fabric.util.enlivenObjects(obj.objects, objs => {
         slide.objects = objs;
      });
      return slide;
   }

   static fromJson (json) {
      return Slide.fromObject(JSON.parse(json));
   }

   dirty () {
      this.emit('dirty', this);
   }

   get text () {
      return this._text;
   }

   set text (newText) {
      this._text = newText;
      this.dirty();
   }

   get sanitizedText () {
      if (this.textSanitizor) {
         return this.textSanitizor(this._text);
      } else {
         return this._text;
      }
   }

   addObject (obj) {
      this.objects.push(obj);
   }

   duplicate (callback) {
      var objects = this.objects;
      // console.log('duplicate()', this, objects, objects.length);

      // Need to populate objects in this convoluted manner since #clone may be
      // async, and the result for async objects is undefined, whereas the
      // callback is not invoked for objects for which clone is synchronous.
      var clonedObjects = [];
      var newSlide = new Slide(`Duplicate of ${this.title}`, this.text, this.thumbnail,
                               clonedObjects, this.textSanitizor);

      for (var i = 0, len = objects.length; i < len; i++) {
         var newObj = objects[i].clone(c => {
            // console.log('Cloned', c);
            clonedObjects.push(c);
            newSlide.dirty();
            if (callback) {
               callback();
            }
         }, ['design']);
         if (newObj) {
            clonedObjects.push(newObj);
         }
      }

      return  newSlide;
   }
}

export default Slide;