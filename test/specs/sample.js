const assert = require('power-assert');

describe('DuckDuckGo search', function() {
  it('searches for WebdriverIO', function() {
    browser.url('http://b.hatena.ne.jp/');
    //browser.setValue('#search_form_input_homepage', 'WebdriverIO');
    //browser.click('#search_button_homepage');
    var title = browser.getTitle();
    console.log('Title is: ' + title);
    // outputs: "Title is: WebdriverIO (Software) at DuckDuckGo"
    assert.equal(title, 'はてなブックマーク')
  });
});
