import React from 'react';

export default class Header extends React.Component {

  hide() {
    self.port.emit('hide');
  }

  render() {
    return (
      <a className="info" target="_blank" href={this.props.hatenaUrl} onClick={this.hide}>
        <span className="symbol">B!</span>
        <span className="num">{this.props.num}</span>
        <span className="url">{this.props.url}</span>
      </a>
    );
  }

}
