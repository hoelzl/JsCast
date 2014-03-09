/**
 * Created by tc on 6/Mar/2014.
 */

var paths = {
   'domReady':       'vendor/requirejs-domready/domReady',
   'fabric':         'vendor/fabric/dist/fabric.require',
   'jquery':         'vendor/jquery/dist/jquery',
   'lodash':         'vendor/lodash/dist/lodash',
   'traceurRuntime': 'vendor/traceur-runtime/traceur-runtime',

   'angular':      'vendor/angular/angular',
   'angularRoute': 'vendor/angular-route/angular-route',
   'ui.bootstrap': 'vendor/angular-bootstrap/ui-bootstrap-tpls',
   'ui.utils':     'vendor/angular-ui-utils/ui-utils',

   'NavbarController':    'js/controllers/NavbarController',
   'SlidesController':    'js/controllers/SlidesController',
   'JsCastController':    'js/controllers/JsCastController',
   'InspectorController': 'js/controllers/InspectorController',

   'DrawingService': 'js/services/DrawingService',
   'SlideService':   'js/services/SlideService',

   'EventEmitter': 'js/model/EventEmitter',
   'Slide':        'js/model/Slide',

   'app':         'js/app',
   'config':      'js/config',
   'controllers': 'js/controllers',
   'main':        'js/main',
   'routes':      'js/routes'
};

// The configuration is kept in a variable because IntelliJ does a better job of
// auto-indenting it this way.
var requirejsConfig = {
   baseUrl: '/',
   paths:   paths,
   shim:    {
      'jquery':       {
         exports: 'jQuery'
      },
      'angular':      {
         deps:    [ 'jquery' ],
         exports: 'angular'
      },
      'angularRoute': {
         deps: [ 'angular' ]
      },
      'ui.bootstrap': {
         deps: [ 'jquery', 'angular' ]
      },
      'ui.utils':     {
         deps: [ 'angular']
      }
   }
};

requirejs.config(requirejsConfig);
var $traceurRuntime;

require(['traceurRuntime'], function () {
   function registerModule (name) {
      $traceurRuntime.ModuleStore.registerModule(name, paths[name]);
   }

   var modules = ['domReady', 'jquery', 'angular', 'angularRoute',
                  'ui.bootstrap', 'ui.utils', 'NavbarController',
                  'SlidesController', 'JsCastController', 'InspectorController',
                  'DrawingService', 'SlideService'];
   for (var i = 0; i < modules.length; i++) {
      registerModule(modules[i]);
   }

   require(modules, function (domReady) {
      domReady(function () {
         angular.bootstrap(document, ['app']);
      });
   });
});
