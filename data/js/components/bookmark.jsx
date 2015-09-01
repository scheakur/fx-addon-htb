import React from 'react';

function iconUrl(user) {
  let category = user.substr(0, 2);
  return `http://www.hatena.ne.jp/users/${category}/${user}/profile_s.gif`;
}


function bookmarkUrl(user, time, eid) {
  let ymd = time.replace(/\//g, '');
  return `http://b.hatena.ne.jp/${user}/${ymd}#bookmark-${eid}`;
}


function hide() {
  self.port.emit('hide');
}


export default class Bookmark extends React.Component {

  render() {
    let b = this.props.bookmark;
    let icon = iconUrl(b.user);
    let time = b.timestamp.split(' ')[0];
    let link = bookmarkUrl(b.user, time, this.props.eid);

    return (
      <div className="bookmark">
        <img className="icon" src={icon}/>
        <a className="user" target="_blank" onClick={hide} href={link}>{b.user}</a>
        <span className="comment">{b.comment}</span>
        <span className="timestamp">{time}</span>
      </div>
    );
  }

}
