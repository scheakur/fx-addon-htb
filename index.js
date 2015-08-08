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
  badge: '',
  badgeColor: '#00838f',
});

const panel = require('sdk/panel').Panel({
  contentURL: data.url('html/htb.html'),
  contentScriptFile: [
    data.url('bundle.js'),
  ]
});

const IGNORE_LIST = [
  'about:blank', 'about:newtab'
];

let openPanelPreventer = null;
let currentUrl = null;
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

tabs.on('ready', update);

tabs.on('pageshow', update);

tabs.on('activate', update);

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


function shouldIgnore(url) {
  return IGNORE_LIST.indexOf(url.toLowerCase()) >= 0;
}


function setIcon(tab, num) {
  button.state(tab, {
    badge: num || '',
  });
}


function update(tab) {
  tab.attach({
    contentScriptFile: data.url('urlgetter.js'),
    onMessage: function(url) {
      if (tabs.activeTab.id === tab.id && url !== currentUrl) {
        currentUrl = url;
        updateIcon(tab, url);
        updatePanel(tab, url);
      }
    },
  });
}


function updateIcon(tab, url) {
  function onComplete(response) {
    let num = parseInt(response.text) || 0;
    setIcon(tab, num);
    currentRequestForNum = null;
  }

  if (currentRequestForNum) {
    currentRequestForNum.off('complete', onComplete);
    currentRequestForNum = null;
  }

  if (shouldIgnore(url)) {
    setIcon(tab, 0);
    return;
  }

  let encoded = encode(url);
  currentRequestForNum = request.Request({
    url: 'http://api.b.st-hatena.com/entry.count?url=' + encoded,
  });
  currentRequestForNum.on('complete', onComplete);
  currentRequestForNum.get();
}


function updatePanel(tab, url) {
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
