var tabs = require('sdk/tabs');
var request = require('sdk/request');
var data = require('sdk/self').data;
var timers = require('sdk/timers');

var button = require('sdk/ui/button/toggle').ToggleButton({
  id: 'htb',
  label: 'Hatebu Comments',
  icon: {
    '16': './htb-16.png',
    '32': './htb-32.png',
    '64': './htb-64.png',
  },
});

var panel = require('sdk/panel').Panel({
  contentURL: data.url('bookmarks.html'),
  contentScriptFile: [
    data.url('vue.min.js'),
    data.url('htb.js'),
  ]
});

const IGNORE_LIST = [
  'about:blank', 'about:newtab'
];

var openPanelPreventer = null;

panel.on('hide', function(state) {
  preventOpenTemporary();
  buttonOff();
});

button.on('click', function(state) {
  if (openIsPrevented()) {
    breakPreventer();
    buttonOff();
    return;
  }
  if (state.checked) {
    openPanel();
  }
});

tabs.on('activate', function(tab) {
  updatePanel(tab);
});

tabs.on('ready', function(tab) {
  updateIcon(tab);
  updatePanel(tab);
});

panel.port.on('hide', function() {
  panel.hide();
});


function preventOpenTemporary() {
  if (openPanelPreventer !== null) {
    timers.clearTimeout(openPanelPreventer);
  }
  openPanelPreventer = timers.setTimeout(function() {
    openPanelPreventer = null;
  }, 300);
}


function openIsPrevented() {
  return openPanelPreventer !== null;
}


function breakPreventer() {
  timers.clearTimeout(openPanelPreventer);
  openPanelPreventer = null;
}


function openPanel() {
  panel.show({
    width: 600,
    height: 600,
    position: {
      top: 10,
      right: 10,
    },
  });
}


function buttonOff() {
  button.state('window', {
    checked: false
  });
}


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
      var num = parseInt(response.text) || 0;
      var prefix = selectIconPrefix(num);
      if (!equalsCurrentIcon(tab, prefix)) {
        setIcon(tab, prefix);
      }
    },
  }).get();
}


function updatePanel(tab) {
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
