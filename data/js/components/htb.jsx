import React from 'react';
import Header from './header.jsx';
import Bookmarks from './bookmarks.jsx';

export default class Htb extends React.Component {

  render() {
    let url = this.props.url;
    let hatenaUrl = `http://b.hatena.ne.jp/entry/${url}`;

    if (!this.props.data) {
      return (
      <div className="htb">
        <Header url={url} hatenaUrl={hatenaUrl} num={0}/>
      </div>
      );
    }

    return (
      <div className="htb">
        <Header url={url} hatenaUrl={hatenaUrl} num={this.props.data.count}/>
        <Bookmarks bookmarks={this.props.data.bookmarks} eid={this.props.data.eid}/>
      </div>
    );
  }
}
