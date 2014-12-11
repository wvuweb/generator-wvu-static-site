/*global describe, beforeEach, it*/
'use strict';

var path    = require('path');
var helpers = require('yeoman-generator').test;


describe('wvu-static-site generator', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }
      this.app = helpers.createGenerator('wvu-static-site:app', [
        '../../app'
      ]);
      done();
    }.bind(this));
  });

  it('creates expected files', function (done) {
    var expected = [
      // add files you expect to exist here.
      'bower.json',
      'package.json',
      'gulpfile.js',
      '.gitignore',
      '.gitattributes',
      'README.md',
      'build/handlebars/index.hbs',
      'build/handlebars/data/index.json'
    ];

    helpers.mockPrompt(this.app, {
      'author_name': 'John Doe'
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });
});