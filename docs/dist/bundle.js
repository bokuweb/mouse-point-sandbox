(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.find = function(expression, relativeTo) {
  var snapshot = document.evaluate(
    expression,
    relativeTo || document.body,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  return snapshot.snapshotItem(0);
};

exports.findAll = function(expression, relativeTo) {
  var snapshot = document.evaluate(
    expression,
    relativeTo || document.body,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  var nodes = [];
  for(var i = 0; i < snapshot.snapshotLength; i++){
      nodes.push(snapshot.snapshotItem(i));
  }

  return nodes;
};

exports.getUniqueXPath = function(node, relativeTo){
  return exports.getXPath(node, relativeTo, true);
};

exports.getXPath = function(node, relativeTo, unique) {
  relativeTo = relativeTo || document.body;
  var lookBreaker = 0;
  var path = '';
  while(node !== relativeTo){
    if(lookBreaker++ > 1000){
      throw new Error('Got to maximum traversal level without reaching the root node.');
    }
    var position = 1;
    
    if (node.parentNode === undefined || node.parentNode === null)
      break;
    
    var siblings = node.parentNode.children;
    for (var i = 0; i < siblings.length; i++) {
      if(siblings[i] === node){
        break;
      }
      if(siblings[i].nodeName === node.nodeName){
        position++;
      }
    }
    var pos;
    if(unique){
      pos = "[" + position + "]";
    }else{
      pos = position > 1 ? "[" + position + "]" : '';
    }
    path = node.nodeName + pos + '/' + path;
    node = node.parentNode;
  }

  // remove the trailing slash
  path = path.slice(0, -1);

  return path.toLowerCase();
};

},{}],2:[function(require,module,exports){
'use strict';

var _xpathDom = require('xpath-dom');

(function () {
  var elementInfo = {};

  var getMouseXYInElement = function getMouseXYInElement() {
    var e = arguments.length <= 0 || arguments[0] === undefined ? window.event : arguments[0];
    var el = arguments[1];

    // if (e.targetTouches) {
    //   const { target, targetTouches } = e;
    //   return {
    //     x: targetTouches[0].pageX - target.offsetLeft,
    //     y: targetTouches[0].pageY - target.offsetTop,
    //   };
    // }
    // if (document.all || 'all' in document) {
    //   return { x: e.offsetX, y: e.offsetY };
    // }
    // return { x: e.layerX, y: e.layerY };
    var _el$getBoundingClient = el.getBoundingClientRect();

    var left = _el$getBoundingClient.left;
    var top = _el$getBoundingClient.top;

    return {
      x: e.clientX - left, //+ (position === 'fixed' ? 0 : window.pageXOffset),
      y: e.clientY - top };
  };

  var updateElementsInfo = function updateElementsInfo() {
    var elements = document.querySelectorAll('*');
    var ng = ['HTML', 'HEAD', 'META', 'TITLE', 'LINK', 'STYLE', 'SCRIPT'];
    for (var i = 0; i < elements.length; i++) {
      if (ng.indexOf(elements[i].tagName) !== -1) continue;
      console.log(elements[i].tagName);
      var xpath = (0, _xpathDom.getXPath)(elements[i]);
      // For test
      // it is unnnessesary to implement capture server logic
      var position = window.getComputedStyle(elements[i], null).getPropertyValue("position");
      console.log(position);
      elementInfo[xpath] = {
        width: elements[i].offsetWidth,
        height: elements[i].offsetHeight,
        // Support scroll
        top: elements[i].getBoundingClientRect().top + (position === 'fixed' ? 0 : window.pageYOffset),
        left: elements[i].getBoundingClientRect().left + (position === 'fixed' ? 0 : window.pageXOffset)
      };
    }
  };

  window.addEventListener('resize', updateElementsInfo);
  updateElementsInfo();
  console.dir(elementInfo);

  var renderPoint = function renderPoint(xpath, x, y) {
    console.log(xpath);
    var e = elementInfo[xpath];
    if (!e) return;
    console.log(e);
    var absX = e.width * x + e.left;
    var absY = e.height * y + e.top;
    console.log('absolute position', absX, absY);

    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = absY - 5 + 'px';
    div.style.left = absX - 5 + 'px';
    div.style.width = '10px';
    div.style.height = '10px';
    div.style.backgroundColor = 'white';
    div.style.borderRadius = '50%';
    div.style.zIndex = 999999;
    document.body.appendChild(div);
  };

  document.addEventListener('mousedown', function (e) {
    console.time('xpath');
    var el = document.elementFromPoint(e.clientX, e.clientY);

    var _getMouseXYInElement = getMouseXYInElement(e, el);

    var x = _getMouseXYInElement.x;
    var y = _getMouseXYInElement.y;

    var xpath = (0, _xpathDom.getXPath)(el);
    console.timeEnd('xpath');
    console.log('y', y);
    console.log('height', el.offsetHeight);
    console.log(xpath, x / el.offsetWidth, y / el.offsetHeight);
    renderPoint(xpath, x / el.offsetWidth, y / el.offsetHeight);
  });
})();

},{"xpath-dom":1}]},{},[2]);
