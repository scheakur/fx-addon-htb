var tabs = require('sdk/tabs');
var panels = require('sdk/panel');
var request = require('sdk/request');
var data = require('sdk/self').data;

var button = require('sdk/ui/button/toggle').ToggleButton({
  id: 'htb',
  label: 'Show comments on Hatena Bookmark',
  icon: {
    '16': './htb-16.png',
    '32': './htb-32.png',
    '64': './htb-64.png'
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


const IGNORE_LIST = [
  'about:blank', 'about:newtab'
];

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
  // updateComment(tabs.activeTab);
}


function handleHide() {
  button.state('window', {
    checked: false,
  });
}


tabs.on('activate', function(tab) {
  updateComment(tab);
});


tabs.on('ready', function(tab) {
  updateIcon(tab);
  updateComment(tab);
});


function encode(url) {
  return encodeURIComponent(url);
}


function selectIconPrefix(num) {
  for (var n of [1000, 100, 10, 5, 1]) {
    if (num >= n) {
      return 'htb' + n;
    }
  }
  return 'htb';
}


function equalsCurrentIcon(tab, iconPrefix) {
  return button.state(tab).icon['16'] === './' + iconPrefix + '-16.png';
}


function shouldIgnore(url) {
  return IGNORE_LIST.indexOf(url.toLowerCase()) >= 0;
}


function setIcon(tab, prefix) {
  button.state(tab, {
    icon: {
      '16': './' + prefix + '-16.png',
      '32': './' + prefix + '-32.png',
      '64': './' + prefix + '-64.png',
    }
  });
}


function updateIcon(tab) {
  var url = tab.url;
  if (shouldIgnore(url)) {
    setIcon(tab, 'htb');
    return;
  }

  var encoded = encode(url);
  request.Request({
    url: 'http://api.b.st-hatena.com/entry.count?url=' + encoded,
    onComplete: function(response) {
      var num = Number(response.text);
      var prefix = selectIconPrefix(num);
      if (!equalsCurrentIcon(tab, prefix)) {
        setIcon(tab, prefix);
      }
    },
  }).get();
}


function updateComment(tab) {
  var url = tab.url;
  if (shouldIgnore(url)) {
    panel.port.emit('show', url, null);
    return;
  }

  var encoded = encode(url);

  request.Request({
    url: 'http://b.hatena.ne.jp/entry/jsonlite/?url=' + encoded,
    onComplete: function(response) {
      panel.port.emit('show', url, response.json);
    },
  }).get();
}
