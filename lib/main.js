const tabs = require('sdk/tabs');
const request = require('sdk/request');
const data = require('sdk/self').data;
const timers = require('sdk/timers');

const button = require('sdk/ui/button/toggle').ToggleButton({
  id: 'htb',
  label: 'Hatebu Comments',
  icon: {
    '16': './icon/htb-16.png',
    '32': './icon/htb-32.png',
    '64': './icon/htb-64.png',
  },
});

const panel = require('sdk/panel').Panel({
  contentURL: data.url('bookmarks.html'),
  contentScriptFile: [
    data.url('vue.min.js'),
    data.url('htb.js'),
  ]
});

const IGNORE_LIST = [
  'about:blank', 'about:newtab'
];

let openPanelPreventer = null;
let currentRequestForDetail = null;
let currentRequestForNum = null;

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

tabs.on('pageshow', function(tab) {
  if (tabs.activeTab.id === tab.id) {
    updateIcon(tab);
    updatePanel(tab);
  }
});

tabs.on('activate', function(tab) {
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
  for (let n of [1000, 100, 10, 5, 1]) {
    if (num >= n) {
      return 'htb' + n;
    }
  }
  return 'htb';
}


function equalsCurrentIcon(tab, iconPrefix) {
  return button.state(tab).icon['16'] === './icon/' + iconPrefix + '-16.png';
}


function shouldIgnore(url) {
  return IGNORE_LIST.indexOf(url.toLowerCase()) >= 0;
}


function setIcon(tab, prefix) {
  button.state(tab, {
    icon: {
      '16': './icon/' + prefix + '-16.png',
      '32': './icon/' + prefix + '-32.png',
      '64': './icon/' + prefix + '-64.png',
    }
  });
}


function updateIcon(tab) {
  let url = tab.url;

  function onComplete(response) {
    let num = parseInt(response.text) || 0;
    let prefix = selectIconPrefix(num);
    if (!equalsCurrentIcon(tab, prefix)) {
      setIcon(tab, prefix);
    }
    currentRequestForNum = null;
  }

  if (currentRequestForNum) {
    currentRequestForNum.off('complete', onComplete);
    currentRequestForNum = null;
  }

  if (shouldIgnore(url)) {
    setIcon(tab, 'htb');
    return;
  }

  let encoded = encode(url);
  currentRequestForNum = request.Request({
    url: 'http://api.b.st-hatena.com/entry.count?url=' + encoded,
  });
  currentRequestForNum.on('complete', onComplete);
  currentRequestForNum.get();
}


function updatePanel(tab) {
  let url = tab.url;

  function onComplete(response) {
    panel.port.emit('show', url, response.json);
    currentRequestForDetail = null;
  }

  if (currentRequestForDetail) {
    currentRequestForDetail.off('complete', onComplete);
    currentRequestForDetail = null;
  }

  if (shouldIgnore(url)) {
    panel.port.emit('show', url, null);
    return;
  }

  let encoded = encode(url);

  currentRequestForDetail = request.Request({
    url: 'http://b.hatena.ne.jp/entry/jsonlite/?url=' + encoded,
  });
  currentRequestForDetail.on('complete', onComplete);
  currentRequestForDetail.get();
}

