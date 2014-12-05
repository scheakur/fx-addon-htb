const container = new Vue({
  el: document.querySelector('.htb'),
  data: {
    bookmarks: [],
    url: '',
    hatena_url: '',
    num: 0
  },
  methods: {
    hide: hide
  },
});


function hide() {
  self.port.emit('hide');
}


function iconUrl(user) {
  return 'http://www.hatena.ne.jp/users/' + user.substr(0, 2) + '/' + user + '/profile_s.gif';
}


function bookmarkUrl(user, timestamp, eid) {
  var ymd = timestamp.split(' ')[0].replace(/\//g, '');
  return 'http://b.hatena.ne.jp/' + user + '/' + ymd + '#bookmark-' + eid;
}


self.port.on('show', function(url, data) {
  container.url = url;
  container.hatena_url = 'http://b.hatena.ne.jp/entry/' + url;

  if (data === null) {
    container.num = 0;
    container.bookmarks = [];
  } else {
    container.num = data.count;
    container.bookmarks = data.bookmarks.filter(function(b) {
      return b.comment.length > 0;
    }).map(function(d) {
      d.icon = iconUrl(d.user);
      d.link = bookmarkUrl(d.user, d.timestamp, data.eid);
      return d;
    });
  }
});
