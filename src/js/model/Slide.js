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
      return new Slide(`Duplicate of ${this.title}`, this.text, this.thumbnail,
                       _.map(this.objects, obj => obj.clone(x => x)));
   }
}

export default Slide;