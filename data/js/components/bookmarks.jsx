import React from 'react';
import Bookmark from './bookmark.jsx';

export default class Bookmarks extends React.Component {

  render() {
    let bookmarks = this.props.bookmarks.filter((b) => {
      return b.comment.length > 0;
    }).map((b) => {
      return (
        <Bookmark key={b.user} bookmark={b} eid={this.props.eid}/>
      );
    });

    return (
      <div className="bookmarks">{bookmarks}</div>
    );
  }

}
