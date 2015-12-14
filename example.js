'use strict';

var diff = require('./');
var templates = require('templates');
var app = templates();

app.engine('text', require('engine-base'));
app.onLoad(/./, diff.view('diffWords'));

app.use(diff());
app.create('posts', {engine: 'text'});

app.post('foo', {content: 'This is <%= name %> and {{rank}}!'})
  .render({name: 'Foo'}, function(err, res) {
    if (err) return console.log(err);
    res.diff();
  });
