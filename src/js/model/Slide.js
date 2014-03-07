/**
 * Created by tc on 4/Mar/2014.
 */

import EventEmitter from 'EventEmitter';

var currentId = 1;

export class Slide extends EventEmitter {
   constructor (title = `Slide ${currentId}`,
                text = `Default text ${currentId}`,
                thumbnail = `[thumbnail ${currentId}]`) {
      super();
      this.title = title;
      this._text = text;
      this.objects = [];
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
}

export default Slide;