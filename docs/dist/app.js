'use strict';

(function () {
  var elementInfo = {};

  var getXpathByElementNode = function getXpathByElementNode(node) {
    var n = node;
    if (n instanceof Array) n = node[0];
    if (n.nodeType !== 1) {
      // throw new Error(`type: ${node.nodeType} name: ${node.nodeName}`);
    }
    var stack = [];
    while (n !== null && n.nodeName !== '#document') {
      var count = 0;
      var point = 1;
      var name = n.nodeName.toLowerCase();
      if (n.parentNode.children.length > 1) {
        for (var i = 0; i < n.parentNode.children.length; i++) {
          if (n.nodeName === n.parentNode.children[i].nodeName) {
            count++;
            if (n === n.parentNode.children[i]) point = count;
          }
        }
      }
      name += '[' + point + ']';
      stack.unshift(name);
      n = n.parentNode;
    }
    return '' + stack.join('/');
  };

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
    var position = window.getComputedStyle(el, null).getPropertyValue("position");
    console.log(el.getBoundingClientRect().top + (position === 'fixed' ? 0 : window.pageYOffset));
    console.log(el.getBoundingClientRect().left + (position === 'fixed' ? 0 : window.pageXOffset));
    console.log(e);
    return {
      x: e.clientX - el.getBoundingClientRect().left, //+ (position === 'fixed' ? 0 : window.pageXOffset),
      y: e.clientY - el.getBoundingClientRect().top };
  };

  var updateElementsInfo = function updateElementsInfo() {
    var elements = document.querySelectorAll('*');
    for (var i = 0; i < elements.length; i++) {
      var xpath = getXpathByElementNode(elements[i]);
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
    div.style.backgroundColor = '#fff';
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

    var xpath = getXpathByElementNode(el);
    console.timeEnd('xpath');
    console.log('y', y);
    console.log('height', el.offsetHeight);
    console.log(xpath, x / el.offsetWidth, y / el.offsetHeight);
    renderPoint(xpath, x / el.offsetWidth, y / el.offsetHeight);
  });
})();