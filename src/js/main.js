/**
 * Created by tc on 4/Mar/2014.
 */

module domReady from 'domReady';
module app from 'app';

// console.log('loading main.js');

export var computeMaxDimensions = (canvas) => {
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

    // console.log(viewport.width(), offsetLeft, inspectorWidth, additionalOffset);

    return {
        height: viewport.height() - offsetTop - 10,
        width: viewport.width() - offsetLeft - inspectorWidth - additionalOffset
    }
};

export var resizeCanvas = () => {
    var mainCanvas = $('#main-canvas');
    var dimensions = computeMaxDimensions(mainCanvas);

    // Note: set the height and width of the underlying canvas element.  Using
    // the jQuery height and with leads to a CSS transform of the canvas in its
    // original size.  Maybe combine these two things to achieve scaling to
    // the screen proportions.
    // console.log('resizing canvas', dimensions.height, dimensions.width);
    var canvasDom = mainCanvas.get(0);
    canvasDom.height = dimensions.height;
    canvasDom.width = dimensions.width;
};

export var start = () => {
    domReady(() => {
        angular.bootstrap(document, ['app']);
        document.defaultView.addEventListener('resize', resizeCanvas);

        $('body').removeClass('hidden');
        // var scope = angular.$rootScope;
        // scope.computeMaxDimensions = computeMaxDimensions;
        // scope.resizeCanvas = resizeCanvas;

        resizeCanvas();
    });
};

