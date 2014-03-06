/**
 * Created by tc on 3/Mar/2014.
 */

import 'config';
import {app} from 'app';
module _ from 'lodash';
import Slide from 'Slide';

// console.log('loading JsCastController');

function getMainCanvas () {
    return document.getElementById('main-canvas');
}

function jsCastController ($scope, config) {

    $scope.appName = config.appName;

    $scope.slides = [
        new Slide('Slide 1', 'Some text for slide 1'),
        new Slide('Slide 2', 'A different text\nfor slide 2\nAs you can see!')
    ];

    $scope.current = {
        slideCounter: 3,
        _slide:       $scope.slides[0],
        get slide () {
            return this._slide;
        },
        set slide (newSlide) {
            this._slide = newSlide;
            if (newSlide) {
                // console.log('dirtying slide', newSlide.id);
                newSlide.dirty();
            }
        }
    };

    $scope.inspector = {
        visible: true
    };

    $scope.slideList = {
        visible: true
    };

    $scope.dirty = () => {
        var slide = $scope.current.slide;
        if (slide) {
            slide.dirty();
        }
    };

    $scope.toggle = (thing) => {
        thing.visible = !thing.visible;
        $scope.dirty();
    };

    $scope.newSlide = () => {
        var slideId = $scope.current.slideCounter++;
        var newSlide = new Slide();
        $scope.slides.push(newSlide);
        $scope.current.slide = newSlide;
    };

    $scope.findSlideIndex = (slide) => {
        return _.indexOf($scope.slides, slide);
    };

    $scope.insertAfterSlide = (originalSlide, newSlide) => {
        var slides = $scope.slides;
        if (newSlide) {
            if (originalSlide) {
                slides.splice(_.indexOf(slides, originalSlide) + 1, 0,
                              newSlide);
            } else {
                slides.push(newSlide);
            }
            $scope.current.slide = newSlide;
        } else {
            throw(Error("Trying to insert null as slide."));
        }
    };

    $scope.duplicateSlide = () => {
        var originalSlide = $scope.current.slide;
        var newSlide;
        if (originalSlide) {
            newSlide =
            new Slide('Duplicate of ' + originalSlide.title, originalSlide.text,
                      originalSlide.thumbnail);
        } else {
            newSlide = new Slide('Failed duplicate attempt');
        }
        $scope.insertAfterSlide(originalSlide, newSlide);
    };

    $scope.deleteSlide = () => {
        var slideIndex = $scope.findSlideIndex($scope.current.slide);
        var slides = $scope.slides;
        slides.splice(slideIndex, 1);
        if (slideIndex >= slides.length) {
            if (slides.length > 0) {
                $scope.current.slide = slides[slides.length - 1];
            } else {
                $scope.current.slide = null;
            }
        } else {
            $scope.current.slide = slides[slideIndex];
        }
        $scope.dirty();
    };

    $scope.drawContents = () => {
        // console.log('drawContents called');
        var slide = $scope.current.slide;
        var canvas = getMainCanvas();
        // Clear the canvas
        //noinspection SillyAssignmentJS
        canvas.width = canvas.width;
        if (slide) {
            var text = slide.text;
            if (text) {
                // console.log('drawing text');
                var lines = text.split('\n');
                var y = 100;
                var context = canvas.getContext('2d');
                context.font = 'italic 40pt Calibri';
                for (var line of lines) {
                    context.fillText(line, 50, y);
                    y += 60;
                }
            }
        }
    };

    $scope.$watch('current.slide.dirtyTick', () => {
        // console.log('dirty watch');
        setTimeout($scope.drawContents)
    });

};

export var controller = app.controller('JsCastController',
                                       ['$scope', 'config', jsCastController]);

export default controller;
