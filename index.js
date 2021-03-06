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
  ],
  width: 600,
  height: 600,
  position: {
    top: 10,
  },
});


const keyToOpenPanel = require('sdk/hotkeys').Hotkey({
  combo: 'control-shift-b',
  onPress: () => {
    togglePanel();
  },
});


const IGNORE_LIST = [
  'about:blank', 'about:newtab'
];

let openPanelPreventer = null;
let currentUrl = null;
let currentRequestForDetail = null;
let currentRequestForNum = null;

const preventOpenTemporary = () => {
  if (openPanelPreventer !== null) {
    timers.clearTimeout(openPanelPreventer);
  }
  openPanelPreventer = timers.setTimeout(() => {
    openPanelPreventer = null;
  }, 300);
}


const openIsPrevented = () => {
  return openPanelPreventer !== null;
}


const breakPreventer = () => {
  timers.clearTimeout(openPanelPreventer);
  openPanelPreventer = null;
}


const openPanel = () => {
  panel.show();
}


const togglePanel = () => {
  if (panel.isShowing) {
    panel.hide();
  } else {
    panel.show();
  }
}


const buttonOff = () => {
  button.state('window', {
    checked: false
  });
}


const encode = (url) => {
  return encodeURIComponent(url);
}


const shouldIgnore = (url) => {
  return IGNORE_LIST.indexOf(url.toLowerCase()) >= 0;
}


const setIcon = (tab, num) => {
  button.state(tab, {
    badge: num || '',
  });
}


const update = (tab) => {
  tab.attach({
    contentScriptFile: data.url('urlgetter.js'),
    onMessage: (url) => {
      if (tabs.activeTab.id === tab.id && url !== currentUrl) {
        currentUrl = url;
        updateIcon(tab, url);
        updatePanel(tab, url);
      }
    },
  });
}


const updateIcon = (tab, url) => {
  const onComplete = (response) => {
    const num = parseInt(response.text) || 0;
    setIcon(tab, num);
    currentRequestForNum = null;
  };

  if (currentRequestForNum) {
    currentRequestForNum.off('complete', onComplete);
    currentRequestForNum = null;
  }

  if (shouldIgnore(url)) {
    setIcon(tab, 0);
    return;
  }

  const encoded = encode(url);
  currentRequestForNum = request.Request({
    url: 'http://api.b.st-hatena.com/entry.count?url=' + encoded,
  });
  currentRequestForNum.on('complete', onComplete);
  currentRequestForNum.get();
}


const updatePanel = (tab, url) => {
  const onComplete = (response) => {
    panel.port.emit('show', url, response.json);
    currentRequestForDetail = null;
  };

  if (currentRequestForDetail) {
    currentRequestForDetail.off('complete', onComplete);
    currentRequestForDetail = null;
  }

  if (shouldIgnore(url)) {
    panel.port.emit('show', url, null);
    return;
  }

  const encoded = encode(url);

  currentRequestForDetail = request.Request({
    url: 'http://b.hatena.ne.jp/entry/jsonlite/?url=' + encoded,
  });
  currentRequestForDetail.on('complete', onComplete);
  currentRequestForDetail.get();
}


const hide = () => {
  preventOpenTemporary();
  buttonOff();
};


const toggle = () => {
  if (openIsPrevented()) {
    breakPreventer();
    buttonOff();
    return;
  }
  if (state.checked) {
    openPanel();
  }
};


panel.on('hide', hide);
button.on('click', toggle);
tabs.on('ready', update);
tabs.on('pageshow', update);
tabs.on('activate', update);

panel.port.on('hide', () => {
  panel.hide();
});
