'use strict';

import React from 'react/addons';
import FileUploadProgress  from '../index';

//allow react dev tools work
window.React = React;

const styles = {
  progressWrapper: {
    height: '50px',
    marginTop: '10px',
    width: '400px',
    float:'left',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    WebkitBoxShadow: 'inset 0 1px 2px rgba(0,0,0,.1)',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,.1)'
  },
  progressBar: {
    float: 'left',
    width: '0',
    height: '100%',
    fontSize: '12px',
    lineHeight: '20px',
    color: '#fff',
    textAlign: 'center',
    backgroundColor: '#5cb85c',
    WebkitBoxShadow: 'inset 0 -1px 0 rgba(0,0,0,.15)',
    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,.15)',
    WebkitTransition: 'width .6s ease',
    Otransition: 'width .6s ease',
    transition: 'width .6s ease'
  },
  cancelButton: {
    marginTop: '5px',
    WebkitAppearance: 'none',
    padding: 0,
    cursor: 'pointer',
    background: '0 0',
    border: 0,
    float: 'left',
    fontSize: '21px',
    fontWeight: 700,
    lineHeight: 1,
    color: '#000',
    textShadow: '0 1px 0 #fff',
    filter: 'alpha(opacity=20)',
    opacity: '.2'
  },

  bslabel: {
    display: 'inline-block',
    maxWidth: '100%',
    marginBottom: '5px',
    fontWeight: 700
  },

  bsHelp: {
    display: 'block',
    marginTop: '5px',
    marginBottom: '10px',
    color: '#737373'
  },

  bsButton: {
    padding: '1px 5px',
    fontSize: '12px',
    lineHeight: '1.5',
    borderRadius: '3px',
    color: '#fff',
    backgroundColor: '#337ab7',
    borderColor: '#2e6da4',
    display: 'inline-block',
    padding: '6px 12px',
    marginBottom: 0,
    fontWeight: 400,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    touchAction: 'manipulation',
    cursor: 'pointer',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    userSelect: 'none',
    backgroundImage: 'none',
    border: '1px solid transparent'
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  getFormData(){
    let d = document.getElementById('customForm');
    let f = new FormData(document.getElementById('customForm'));
    console.log(d, f);
    return f;
  }

  customFormRenderer(onSubmit){
    return (
      <form id='customForm' style={{marginBottom: '15px'}}>
        <label style={styles.bslabel} htmlFor="exampleInputFile">File input</label>
        <input style={{display: 'block'}} type="file" name='file' id="exampleInputFile" />
        <p style={styles.bsHelp}>This is custom form.</p>
        <button type="button" style={styles.bsButton} onClick={onSubmit}>Upload</button>
      </form>
    );
  }

  customProgressRenderer(progress, hasError, cancelHandler) {
    if (hasError || progress > -1 ) {
      let barStyle = Object.assign({}, styles.progressBar);
      barStyle.width = progress + '%';

      let message = (<span>{barStyle.width}</span>);
      if (hasError) {
        barStyle.backgroundColor = '#d9534f';
        message = (<span style={{'color': '#a94442'}}>Failed to upload ...</span>);
      }
      if (progress === 100){
        message = (<span >Done</span>);
      }

      return (
        <div>
          <div style={styles.progressWrapper}>
            <div style={barStyle}></div>
          </div>
          <button style={styles.cancelButton} onClick={cancelHandler}>
            <span>&times;</span>
          </button>
          <div style={{'clear':'left'}}>
            {message}
          </div>
        </div>
      );
    } else {
      return;
    }
  }

  render() {

    return (
      <div>

        <h3>Default style</h3>

        <FileUploadProgress key='ex1' url='http://localhost:3000/api/upload'
          onProgress={(e, request, progress) => {console.log('progress', e, request, progress);}}
          onLoad={ (e, request) => {console.log('load', e, request);}}
          onError={ (e, request) => {console.log('error', e, request);}}
          onAbort={ (e, request) => {console.log('abort', e, request);}}
          />

        <hr style={{marginTop: '80px'}}/>

        <h3>Custome rederer</h3>

        <FileUploadProgress key='ex2' url='http://localhost:3000/api/upload'
          onProgress={(e, request, progress) => {console.log('progress', e, request, progress);}}
          onLoad={ (e, request) => {console.log('load', e, request);}}
          onError={ (e, request) => {console.log('error', e, request);}}
          onAbort={ (e, request) => {console.log('abort', e, request);}}
          getFormData={this.getFormData.bind(this)}
          formRnederer={this.customFormRenderer.bind(this)}
          progressRnederer={this.customProgressRenderer.bind(this)}
          />

      </div>
    )
  }
};

React.render(<App/>, document.getElementById('out'));
