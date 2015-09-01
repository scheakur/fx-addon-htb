import React from 'react';

function hide() {
  self.port.emit('hide');
}


export default class Header extends React.Component {

  render() {
    return (
      <a className="info" target="_blank" href={this.props.hatenaUrl} onClick={hide}>
        <span className="symbol">B!</span>
        <span className="num">{this.props.num}</span>
        <span className="url">{this.props.url}</span>
      </a>
    );
  }

}
