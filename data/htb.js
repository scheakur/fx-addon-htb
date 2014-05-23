var container = document.querySelector('.htb');

var container = new Vue({
  el: container,
  data: {
    bookmarks: [],
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


self.port.on('show', function(url, data) {
  container.$data.url = url;
  container.$data.hatena_url = 'http://b.hatena.ne.jp/entry/' + url;

  if (data === null) {
    container.$data.num = 0;
    container.$data.bookmarks = [];
  } else {
    container.$data.num = data.count;
    container.$data.bookmarks = data.bookmarks.filter(function(b) {
      return b.comment.length > 0;
    }).map(function(d) {
      d.icon = iconUrl(d.user);
      return d;
    });
  }
});
