var fixtures = require('./fixtures')('bemhtml');
var test = fixtures.test;
var assert = require('assert');
var bemxjst = require('../').bemhtml;

describe('Modes jsAttr', function() {
  it('should throw error when args passed to jsAttr mode', function() {
    assert.throws(function() {
      bemxjst.compile(function() {
        block('b1').jsAttr('blah');
      });
    });
  });

  it('should use `data-bem` js attribute name by default', function() {
    test(function() {},
    {
      block: 'link',
      js: true
    },
    '<div class="link i-bem" data-bem=\'{"link":{}}\'></div>');
  });

  it('should change js attribute name', function() {
    test(function() {
      block('link').jsAttr()('onclick');
    },
    { block: 'link', js: true },
    '<div class="link i-bem" onclick=\'{"link":{}}\'></div>');
  });
});
