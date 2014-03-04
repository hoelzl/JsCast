module.exports = function (broccoli) {
    var pickFiles = require('broccoli-static-compiler');
    var traceur = require('broccoli-traceur');
    // var filterTemplates = require('broccoli-template');
    
    var js = broccoli.makeTree('src/js');
    js = pickFiles(js, {
        srcDir: '/',
        destDir: 'js'
    });
    js = traceur(js, {
        modules: 'amd'
    });

    var vendor = broccoli.makeTree('src/vendor');
    vendor = pickFiles(vendor, {
        srcDir: '/',
        destDir: 'vendor'
    })

    var templates = broccoli.makeTree('src/templates');
    templates = pickFiles(templates, {
        srcDir: '/',
        destDir: '' 
    })

    return [js, vendor, templates];
}

