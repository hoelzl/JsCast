/**
 * Created by tc on 4/Mar/2014.
 */

import EventEmitter from 'EventEmitter';

var currentId = 1;
var colors = ['yellow', 'red', 'blue', 'green', 'violet', 'magenta', 'cyan',
              'lightblue', 'lightgoldenrodyellow', 'lightcoral', 'coral',
              'darkblue', 'gray', 'lightgray', 'darkgray'];

export function randomColor() {
   return colors[Math.round(Math.random() * colors.length)];
}

export class Slide extends EventEmitter {
   constructor (title = `Slide ${currentId}`,
                text = `Default text ${currentId}`,
                thumbnail = `[thumbnail ${currentId}]`) {
      super();
      this.title = title;
      this.forgroundColor = randomColor();
      this.backgroundColor = randomColor();
      this._text = text;
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
}

export default Slide;