(() => {
  const elementInfo = {};

  const getXpathByElementNode = node => {
    let n = node;
    if (n instanceof Array) n = node[0];
    if (n.nodeType !== 1) {
      // throw new Error(`type: ${node.nodeType} name: ${node.nodeName}`);
    }
    const stack = [];
    while (n !== null && n.nodeName !== '#document') {
      let count = 0;
      let point = 1;
      let name = n.nodeName.toLowerCase();
      if (n.parentNode.children.length > 1) {
        for (let i = 0; i < n.parentNode.children.length; i++) {
          if (n.nodeName === n.parentNode.children[i].nodeName) {
            count++;
            if (n === n.parentNode.children[i]) point = count;
          }
        }
      }
      name += `[${point}]`;
      stack.unshift(name);
      n = n.parentNode;
    }
    return `${stack.join('/')}`;
  };

  const getMouseXYInElement = (e = window.event, el) => {
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
    const { left, top } = el.getBoundingClientRect();
    return {
      x: e.clientX - left, //+ (position === 'fixed' ? 0 : window.pageXOffset),
      y: e.clientY - top, // + (position === 'fixed' ? 0 : window.pageYOffset),
    }
  }

  const updateElementsInfo = () => {
    const elements = document.querySelectorAll('*');
    for (let i = 0; i < elements.length; i++) {
      const xpath = getXpathByElementNode(elements[i]);
      // For test
      // it is unnnessesary to implement capture server logic
      const position = window.getComputedStyle(elements[i], null).getPropertyValue("position");
      console.log(position)
      elementInfo[xpath] = {
        width: elements[i].offsetWidth,
        height: elements[i].offsetHeight,
        // Support scroll
        top: elements[i].getBoundingClientRect().top + (position === 'fixed' ? 0 : window.pageYOffset),
        left: elements[i].getBoundingClientRect().left + (position === 'fixed' ? 0 :  window.pageXOffset),
      };
    }
  };

  window.addEventListener('resize', updateElementsInfo);
  updateElementsInfo();
  console.dir(elementInfo);

  const renderPoint = (xpath, x, y) => {
    console.log(xpath)
    const e = elementInfo[xpath];
    if (!e) return;
    console.log(e);
    const absX = e.width * x + e.left;
    const absY = e.height * y + e.top;
    console.log('absolute position', absX, absY);

    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = `${absY - 5}px`;
    div.style.left = `${absX - 5}px`;
    div.style.width = '10px';
    div.style.height = '10px';
    div.style.backgroundColor = '#fff';
    div.style.borderRadius = '50%';
    div.style.zIndex = 999999;
    document.body.appendChild(div);
  };

  document.addEventListener('mousedown', e => {
    console.time('xpath');
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const { x, y } = getMouseXYInElement(e, el);
    const xpath = getXpathByElementNode(el);
    console.timeEnd('xpath');
    console.log('y',y)
    console.log('height', el.offsetHeight)
    console.log(xpath, x / el.offsetWidth, y / el.offsetHeight);
    renderPoint(xpath, x / el.offsetWidth, y / el.offsetHeight);
  });
})();


