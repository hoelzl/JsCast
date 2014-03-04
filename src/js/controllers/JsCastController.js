/**
 * Created by tc on 3/Mar/2014.
 */

import {app} from '../app';
import '../config';

// console.log('loading JsCastController');

function getMainCanvas() {
    return document.getElementById('main-canvas');
}

export var controller = app.controller('JsCastController', ['$scope', 'config',
    ($scope, config) => {
        var currentSlideCounter = 3;

        $scope.appName = config.appName;

        $scope.inspector = {
            visible: true
        };

        $scope.slideList = {
            visible: true
        };

        $scope.toggle = (thing) => {
            thing.visible = !thing.visible;
        };

        $scope.slides = [
            { id: 1, thumbnail: '[thumbnail 1]',
                title: 'Slide 1', contents: { text: 'Some text' }},
            {id: 2, thumbnail: '[thumbnail 2]',
                title: 'Slide 2', contents: { text: 'Another text' }}
        ];

        $scope._currentSlide = [null];

        Object.defineProperty($scope, 'currentSlide', {
            get: () => $scope._currentSlide[0],
            set: (slide) => {
                $scope._currentSlide[0] = slide;
                $scope.drawContents();
            }
        });

        $scope.setCurrentSlide = (slide) => {
            $scope.currentSlide = slide;
        };

        $scope.newSlide = () => {
            var slideId = currentSlideCounter++;
            var newSlide = {
                id: slideId,
                thumbnail: '[thumbnail ' + slideId + ']',
                title: 'Slide ' + slideId,
                contents: { text: (Math.random() * 0xffffffffff).toString(36) }
            };
            $scope.slides.push(newSlide);
            $scope.currentSlide = newSlide;
        };

        $scope.findSlideIndex = (slide) => {
            return _.indexOf($scope.slides, slide);
        };

        $scope.insertAfterSlide = (originalSlide, newSlide) => {
            var slides = $scope.slides;
            if (newSlide) {
                if (originalSlide) {
                    slides.splice(_.indexOf(slides, originalSlide) + 1, 0, newSlide);
                } else {
                    slides.push(newSlide);
                }
                $scope.currentSlide = newSlide;
            } else {
                throw(Error("Trying to insert null as slide."));
            }
        };

        $scope.duplicateSlide = () => {
            var originalSlide = $scope.currentSlide;
            var newSlideId = currentSlideCounter++;
            var newSlide;
            if (originalSlide) {
                newSlide = {
                    id: newSlideId,
                    thumbnail: originalSlide.thumbnail,
                    title: 'Slide ' + newSlideId + ' (-> ' + originalSlide.id + ')',
                    contents: originalSlide.contents
                };
            } else {
                newSlide = {
                    id: newSlideId,
                    thumbnail: '[thumbnail ' + newSlideId + ']',
                    title: 'Slide ' + newSlideId + ' (not cloned)',
                    contents: 'Missing Contents'
                };
            }
            $scope.insertAfterSlide(originalSlide, newSlide);
        };

        $scope.deleteSlide = () => {
            var slideIndex = $scope.findSlideIndex($scope.currentSlide);
            var slides = $scope.slides;
            slides.splice(slideIndex, 1);
            if (slideIndex >= slides.length) {
                if (slides.length > 0) {
                    $scope.currentSlide = slides[slides.length - 1];
                } else {
                    $scope.currentSlide = null;
                }
            } else {
                $scope.currentSlide = slides[slideIndex];
            }
        };

        $scope.drawContents = () => {
            // console.log('drawing contents');
            var slide = $scope.currentSlide;
            var canvas = getMainCanvas();
            // Clear the canvas
            //noinspection SillyAssignmentJS
            canvas.width = canvas.width;
            if (slide) {
                var text = slide.contents.text;
                if (text) {
                    var context = canvas.getContext('2d');
                    context.font = 'italic 40pt Calibri';
                    context.fillText(slide.contents.text, 150, 100);
                }
            }
        };

    }]);

export default controller;
