'use strict';

import {EventEmitter} from 'events';
import React from 'react';

const styles = {
  progressWrapper: {
    height: '10px',
    marginTop: '10px',
    width: '90%',
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
    backgroundColor: '#337ab7',
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
    float: 'right',
    fontSize: '21px',
    fontWeight: 700,
    lineHeight: 1,
    color: '#000',
    textShadow: '0 1px 0 #fff',
    filter: 'alpha(opacity=20)',
    opacity: '.2'
  }
};

class FileUploadProgress extends React.Component {
  constructor(props) {
    super(props);
    this.proxy = new EventEmitter();
    this.state = {
      progress: -1,
      hasError: false
    };
  }

  cancelUpload() {
    this.proxy.emit('abort');
    this.setState({
      progress: -1,
      hasError: false
    });
  }

  getFormData() {
    return new FormData(React.findDOMNode(this.refs.form));
  }

  onSubmit(e){
    e.preventDefault();
    this.setState({
      progress:0,
      hasError: false
    }, this._doUpload);
  }

  renderProgressBar() {
    if (this.state.hasError || this.state.progress > -1 ) {
      let barStyle = Object.assign({}, styles.progressBar);
      barStyle.width = this.state.progress + '%';

      let message = (<span>Uploading ...</span>);
      if (this.state.hasError) {
        barStyle.backgroundColor = '#d9534f';
        message = (<span style={{'color': '#a94442'}}>Failed to upload ...</span>);
      }
      if (this.state.progress === 100){
        message = (<span >Successfully uploaded</span>);
      }

      return (
        <div>
          <div style={styles.progressWrapper}>
            <div style={barStyle}></div>
          </div>
          <button style={styles.cancelButton} onClick={this.cancelUpload.bind(this)}>
            <span>&times;</span>
          </button>
          <div style={{'clear':'left'}}>
            {message}
          </div>
        </div>
      );
    }
  }

  render() {
    let form = this.props.formElement ? this.props.formElement : (
      <form ref='form' method='post' action={this.props.url} onSubmit={this.onSubmit.bind(this)}>
        <div style={{width: '400px'}}>
          <input type='file' name='file' />
          {this.renderProgressBar.bind(this)()}
        </div>
        <input type='submit' />
      </form>
    );

    return (
      <div>
        {form}
      </div>
    );
  }

  _doUpload() {
    let form = this.getFormData();
    let req = new XMLHttpRequest();
    req.open('POST', this.props.url);

    req.addEventListener('load', (e) =>{
      this.proxy.removeAllListeners(['abort']);
      let newState = {progress: 100};
      if (req.status !== 200) {
        newState.hasError = true;
        this.setState(newState, () => {
          this.props.onError(e, req);
        });
      } else {
        this.setState(newState, () => {
          this.props.onLoad(e, req);
        });
      }
    }, false);

    req.addEventListener('error', (e) =>{
      this.setState({
        hasError: true
      }, () => {
        this.props.onError(e, req);
      });
    }, false);

    req.upload.addEventListener('progress', (e) => {
      let progress = 0;
      if (e.total !== 0) {
        progress = parseInt((e.loaded / e.total) * 100);
      }
      this.setState({
        progress: progress
      }, () => {
        this.props.onProgress(e, req, progress);
      });
    }, false);

    req.addEventListener('abort', (e) => {
      this.setState({
        progress: -1
      }, () => {
        this.props.onAbort(e, req);
      })
    }, false);

    this.proxy.once('abort', () => {
      req.abort();
    });

    this.props.beforeSend(req)
              .send(this.props.formCustomeizer(form));
  }
}

FileUploadProgress.propTypes = {
  url: React.PropTypes.string.isRequired,
  formElement: React.PropTypes.element,
  formCustomeizer: React.PropTypes.func,
  beforeSend: React.PropTypes.func,
  onProgress: React.PropTypes.func,
  onLoad: React.PropTypes.func,
  onError: React.PropTypes.func,
  onAbort: React.PropTypes.func
};

FileUploadProgress.defaultProps = {
  formCustomeizer: (form) => {return form;},
  beforeSend: (request) => {return request;},
  onProgress: (e, request, progress) => {},
  onLoad: (e, request) => {},
  onError: (e, request) => {},
  onAbort: (e, request) => {}
};

export default FileUploadProgress;
