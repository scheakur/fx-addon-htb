import React from 'react';
import Htb from './components/htb.jsx';

self.port.on('show', (url, data) => {
  React.render(<Htb url={url} data={data}/>, document.body);
});
