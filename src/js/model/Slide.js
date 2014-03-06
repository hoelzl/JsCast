/**
 * Created by tc on 4/Mar/2014.
 */

var currentId = 1;

export class Slide {
    constructor (title = 'Slide ' + currentId,
                 text = 'Default text ' + currentId,
                 thumbnail = '[thumbnail ' + currentId + ']') {
        this.title = title;
        this._text = text;
        this.thumbnail = thumbnail;
        this.id = currentId++;
        this.dirtyTick = Math.random();
    }

    dirty () {
        this.dirtyTick++;
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