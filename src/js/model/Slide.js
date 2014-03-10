/**
 * Created by tc on 4/Mar/2014.
 */

import EventEmitter from 'EventEmitter';

var currentId = 1;

export class Slide extends EventEmitter {
   constructor (title = `Slide ${currentId}`,
                text = `Default text ${currentId}`,
                thumbnail = `[thumbnail ${currentId}]`, objects = []) {
      super();
      this.title = title;
      this._text = text;
      this.objects = objects;
      this.thumbnail = thumbnail;
      this.id = currentId++;
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

   addObject (obj) {
      this.objects.push(obj);
   }

   duplicate () {
      var objects = this.objects;
      // console.log('duplicate()', this, objects, objects.length);

      // Need to populate objects in this convoluted manner since #clone may be
      // async, and the result for async objects is undefined, whereas the
      // callback is not invoked for objects for which clone is synchronous.
      var clonedObjects = [];

      for (var i = 0, len = objects.length; i < len; i++) {
         var newObj = objects[i].clone(c => {
            clonedObjects.push(c);
         });
         if (newObj) {
            clonedObjects.push(newObj);
         }
      }

      return new Slide(`Duplicate of ${this.title}`, this.text, this.thumbnail,
                       clonedObjects);
   }
}

export default Slide;