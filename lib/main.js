var tabs = require('sdk/tabs');
var panels = require('sdk/panel');
var request = require('sdk/request');
var data = require('sdk/self').data;

var button = require('sdk/ui/button/toggle').ToggleButton({
  id: 'htb',
  label: 'Show comments on Hatena Bookmark',
  icon: {
    '16': './icon-16.png',
    '32': './icon-32.png',
    '64': './icon-64.png'
  },
  onChange: handleChange,
});

var panel = panels.Panel({
  contentURL: data.url('comments.html'),
  contentScriptFile: [
    data.url('vue.min.js'),
    data.url('htb.js'),
  ],
  onShow: handleShow,
  onHide: handleHide,
});


function handleChange(state) {
  if (state.checked) {
    panel.show({
      width: 600,
      height: 600,
      position: {
        top: 10,
        right: 10
      }
    });
  }
}


function handleShow() {
  updateComment(tabs.activeTab);
}


function handleHide() {
  button.state('window', {
    checked: false,
  });
}


tabs.on('activate', function(tab) {
  if (panel.isShowing) {
    updateComment(tab);
  }
});


function canonicalUrl(tab) {
  return tab.url.replace(/\?.*/, '');
}


function updateComment(tab) {
  var url = canonicalUrl(tab);
  request.Request({
    url: 'http://b.hatena.ne.jp/entry/jsonlite/' + url,
    onComplete: function(response) {
      panel.port.emit('show', url, response.json);
    },
  }).get();
}
