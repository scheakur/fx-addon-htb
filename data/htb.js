var container = document.querySelector('.htb');

var container = new Vue({
  el: container,
  data: {
    bookmarks: [],
  },
});


self.port.on('show', function(url, data) {
  container.$data.url = url;

  if (data === null) {
    container.$data.num = 0;
    container.$data.bookmarks = [];
  } else {
    container.$data.num = data.count;
    container.$data.bookmarks = data.bookmarks.filter(function(b) {
      return b.comment.length > 0;
    });
  }
});
