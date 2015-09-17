'use strict';

import React from 'react/addons';
import FileUploadProgress  from '../index';

//allow react dev tools work
window.React = React;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {

    return (
      <div>
        <FileUploadProgress url='http://localhost:3000/api/upload'
          onProgress={(e, request, progress) => {console.log('progress', e, request, progress);}}
          onLoad={ (e, request) => {console.log('load', e, request);}}
          onError={ (e, request) => {console.log('error', e, request);}}
          onAbort={ (e, request) => {console.log('abort', e, request);}}
          />
      </div>
    )
  }
};

React.render(<App/>, document.getElementById('out'));
