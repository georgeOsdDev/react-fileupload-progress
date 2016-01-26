'use strict';
import React from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import chai from 'chai';
import sinon from 'sinon';
let expect = chai.expect;
import FileUploadProgress from '../../src/components/FileUploadProgress';

describe('Test of FileUploadProgress', () => {
  let component;

  it('should have default properties', () => {
    component = TestUtils.renderIntoDocument(
      <FileUploadProgress url='https://localhost.com/api' />);

    expect(component.props.onProgress).to.be.a('function');
    expect(component.props.onLoad).to.be.a('function');
    expect(component.props.onError).to.be.a('function');
    expect(component.props.onAbort).to.be.a('function');
    expect(component.props.formGetter).to.be.a('undefined');
    expect(component.props.formRenderer).to.be.a('function');
    expect(component.props.progressRnederer).to.be.a('function');
    expect(component.props.formCustomizer).to.be.a('function');
    expect(component.props.beforeSend).to.be.a('function');
  });

  describe('Test of rendered components', () => {
    it('use builtin renderer by default', () => {
      component = TestUtils.renderIntoDocument(
        <FileUploadProgress url='https://localhost.com/api' />);

        /* Default rendered from*/

        // <div>
        //   <form ref='form' method='post' onSubmit={onSubmit}>
        //     <div>
        //       <input type='file' name='file' />
        //     </div>
        //     <input type='submit' />
        //   </form>
        // </div>

        let form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
        expect(ReactDom.findDOMNode(form).method).to.be.eql('post');

        let inputContent = TestUtils.scryRenderedDOMComponentsWithTag(component, 'input');
        expect(inputContent.length).to.be.eql(2);
        expect(ReactDom.findDOMNode(inputContent[0]).type).to.be.eql('file');
        expect(ReactDom.findDOMNode(inputContent[1]).type).to.be.eql('submit');
    });

    it('use provided form renderer when specified', () => {

      let customFormRenderer = (onSubmit) => {
        return (
          <form id='customForm' method='get'>
            <button type='button' onClick={onSubmit}>Upload</button>
          </form>
        );
      }

      component = TestUtils.renderIntoDocument(
        <FileUploadProgress url='https://localhost.com/api'
                            formRenderer={customFormRenderer} />);

        let form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
        expect(ReactDom.findDOMNode(form).method).to.be.eql('get');
        expect(ReactDom.findDOMNode(form).id).to.be.eql('customForm');

        let inputContent = TestUtils.scryRenderedDOMComponentsWithTag(component, 'input');
        expect(inputContent.length).to.be.eql(0);

        let buttonContent = TestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
        expect(buttonContent.length).to.be.eql(1);
    });
  });

  describe('Test of xhr events handler', () => {
    let requests;
    let onProgressSpy;
    let onLoadSpy;
    let onErrorSpy;
    let onAbortSpy;

    beforeEach(() => {
      onProgressSpy = sinon.spy();
      onLoadSpy= sinon.spy();
      onErrorSpy= sinon.spy();
      onAbortSpy= sinon.spy();

			sinon.useFakeXMLHttpRequest();
    	requests = [];
			sinon.FakeXMLHttpRequest.onCreate = function (xhr) {
    		requests.push(xhr);
    	};

      component = TestUtils.renderIntoDocument(
        <FileUploadProgress url='https://localhost.com/api'
          onProgress={onProgressSpy}
          onLoad={onLoadSpy}
          onError={onErrorSpy}
          onAbort={onAbortSpy}
          />);
      let form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
      TestUtils.Simulate.submit(form);
    });

    afterEach(() => {
      sinon.FakeXMLHttpRequest.restore();
    });

    describe('onProgress handler', () => {
      it('should handle xhr progress events', () => {
        requests[0].uploadProgress({
          total: 100,
          loaded: 20
        });
        requests[0].uploadProgress({
          total: 100,
          loaded: 40
        });

        expect(onProgressSpy.calledTwice).to.be.eql(true);
        let arg0 = onProgressSpy.args[0];
        let arg1 = onProgressSpy.args[1];
        expect(arg0.length).to.be.eql(3);
        expect(arg0[2]).to.be.eql(20);
        expect(arg1[2]).to.be.eql(40);

        expect(onLoadSpy.called).to.be.not.equal(true)
        expect(onErrorSpy.called).to.be.not.equal(true)
        expect(onAbortSpy.called).to.be.not.equal(true)
      });
    });

    describe('onLoad handler', () => {
      it('should handle xhr load event', () => {
        requests[0].respond(200,
                            { 'Content-Type': 'application/json' },
                            '[{ "error": 0}]')

        expect(onProgressSpy.calledOnce).to.be.equal(true)
        let progress = onProgressSpy.args[0][2];
        expect(progress).to.be.eql(100);

        // expect(onLoadSpy.calledOnce).to.be.equal(true);
        let event = onLoadSpy.args[0][0];
        let request = onLoadSpy.args[0][1];
        expect(event.type).to.be.eql('load');
        expect(request.status).to.be.eql(200);

        // expect(onErrorSpy.called).to.be.not.equal(true)
        // expect(onAbortSpy.called).to.be.not.equal(true)
      });
    });

    describe('onError handler', () => {
      it('should handle xhr error event', () => {
        requests[0].dispatchEvent(new sinon.Event('error', false, false, this));

        expect(onErrorSpy.calledOnce).to.be.equal(true);
        let event = onErrorSpy.args[0][0];
        let request = onErrorSpy.args[0][1];

        expect(event.type).to.be.eql('error');
        expect(request.readyState).to.be.eql(sinon.FakeXMLHttpRequest.OPENED);

        expect(onProgressSpy.called).to.be.not.equal(true)
        expect(onLoadSpy.called).to.be.not.equal(true)
        expect(onAbortSpy.called).to.be.not.equal(true)
      });

    });

    describe('onAbort handler', () => {
      it('should handle xhr abort event', () => {
        requests[0].abort();

        // FakeXMLHttpRequest respond progress event on abort
        // https://github.com/sinonjs/sinon/blob/master/lib/sinon/util/fake_xml_http_request.js#L454
        expect(onProgressSpy.calledOnce).to.be.equal(true)
        let progress = onProgressSpy.args[0][2];
        expect(progress).to.be.eql(100);

        expect(onAbortSpy.calledOnce).to.be.equal(true);
        let event = onAbortSpy.args[0][0];
        let request = onAbortSpy.args[0][1];

        expect(event.type).to.be.eql('abort');
        expect(request.readyState).to.be.eql(sinon.FakeXMLHttpRequest.UNSENT);

        // onError also called
        // https://github.com/sinonjs/sinon/blob/master/lib/sinon/util/fake_xml_http_request.js#L547
        expect(onErrorSpy.calledOnce).to.be.equal(true);
        let event2 = onErrorSpy.args[0][0];
        let request2 = onErrorSpy.args[0][1];

        expect(event2.type).to.be.eql('load');
        expect(request2.readyState).to.be.eql(sinon.FakeXMLHttpRequest.UNSENT);

        expect(onLoadSpy.called).to.be.not.equal(true)
      });
    });

  });

  describe('Test of xhr custom hook', () => {
    let requests;
    let formCustomizerSpy;
    let beforeSendSpy;

    beforeEach(() => {
      formCustomizerSpy = sinon.spy();
      let formCustomizer = (form) => {
        formCustomizerSpy(form);
        form.append('customeForm', 'myCustomForm')
        return form;
      };
      beforeSendSpy = sinon.spy();
      let beforeSend = (request) => {
        beforeSendSpy(request);
        request.setRequestHeader('customHeader', 'myCustomHeader');
        return request;
      };

			sinon.useFakeXMLHttpRequest();
    	requests = [];
			sinon.FakeXMLHttpRequest.onCreate = function (xhr) {
    		requests.push(xhr);
    	};

      component = TestUtils.renderIntoDocument(
        <FileUploadProgress url='https://localhost.com/api'
          beforeSend={beforeSend}
          formCustomizer={formCustomizer}
          />);
      let form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
      TestUtils.Simulate.submit(form);
    });

    afterEach(() => {
      sinon.FakeXMLHttpRequest.restore();
    });


    it('call custom form hook before sending xhr', () => {
      expect(formCustomizerSpy.calledOnce).to.be.equal(true)
      let form = formCustomizerSpy.args[0][0];
      expect(typeof form).to.be.eql('object');
    });

    it('call custom request hook before sending xhr', () => {
      expect(beforeSendSpy.calledOnce).to.be.equal(true)
      let request = beforeSendSpy.args[0][0];
      expect(typeof request).to.be.eql('object');
    });

  });

  describe('Test of xhr progress component', () => {
    describe('use builtin renderer by default', () => {
      let requests;
      let onAbortSpy;

      beforeEach(() => {
        onAbortSpy= sinon.spy();
  			sinon.useFakeXMLHttpRequest();
      	requests = [];
  			sinon.FakeXMLHttpRequest.onCreate = function (xhr) {
      		requests.push(xhr);
      	};

        component = TestUtils.renderIntoDocument(
          <FileUploadProgress url='https://localhost.com/api'
            onAbort={onAbortSpy}/>);
      });

      afterEach(() => {
        sinon.FakeXMLHttpRequest.restore();
      });

      describe('before submit', () => {
        it('it render nothing when progress is 0', () => {
          let progressBarContent = TestUtils.scryRenderedDOMComponentsWithClass(component, '_react_fileupload_progress_content');
          expect(progressBarContent.length).to.be.eql(0);
        });
      });

      describe('after submit', () => {
        it('change bar width depends on progress', () => {
          let form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
          TestUtils.Simulate.submit(form);
          requests[0].uploadProgress({
            total: 100,
            loaded: 20
          });
          let progressBarContent = TestUtils.scryRenderedDOMComponentsWithClass(component, '_react_fileupload_progress_content');
          expect(progressBarContent.length).to.be.eql(1);
          let progressBar = TestUtils.findRenderedDOMComponentWithClass(component, '_react_fileupload_progress_bar');
          expect(ReactDom.findDOMNode(progressBar).style.width).to.be.eql('20%');
        });
      });

      describe('provides abort helper', () => {
        it('stop uploading when cancel button clicked', () => {
          let form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
          TestUtils.Simulate.submit(form);
          requests[0].uploadProgress({
            total: 100,
            loaded: 20
          });
          let progressBarContent = TestUtils.scryRenderedDOMComponentsWithClass(component, '_react_fileupload_progress_content');
          let cancelButton = progressBarContent[0].querySelector('._react_fileupload_progress_cancel');
          TestUtils.Simulate.click(cancelButton);
          expect(onAbortSpy.calledOnce).to.be.equal(true);
          let event = onAbortSpy.args[0][0];
          let request = onAbortSpy.args[0][1];

          expect(event.type).to.be.eql('abort');
          expect(request.readyState).to.be.eql(sinon.FakeXMLHttpRequest.UNSENT);
        });
      });
    });

    describe('use custome progress rendere when specified', () => {
      let requests;
      let rendererSpy;
      let onAbortSpy;
      let customProgressRenderer;


      beforeEach(() => {
        rendererSpy= sinon.spy();
        onAbortSpy= sinon.spy();

        customProgressRenderer = (progress, hasError, cancelHandler) => {
          rendererSpy(progress, hasError, cancelHandler);
          return (
            <div className='customProgress' >
              <button className='canceler' onClick={cancelHandler}></button>
            </div>
          );
        }
  			sinon.useFakeXMLHttpRequest();
      	requests = [];
  			sinon.FakeXMLHttpRequest.onCreate = function (xhr) {
      		requests.push(xhr);
      	};

        component = TestUtils.renderIntoDocument(
          <FileUploadProgress url='https://localhost.com/api'
            onAbort={onAbortSpy}
            progressRnederer={customProgressRenderer}/>);
      });

      afterEach(() => {
        sinon.FakeXMLHttpRequest.restore();
      });

      describe('before submit', () => {
        it('use provided form renderer when specified', () => {
          let customProgress = TestUtils.scryRenderedDOMComponentsWithClass(component, 'customProgress');
          expect(customProgress.length).to.be.eql(1);
        });
      });

      describe('after submit', () => {
        it('pass progress parameter to custom renderer', (done) => {
          let form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
          TestUtils.Simulate.submit(form);
          requests[0].uploadProgress({
            total: 100,
            loaded: 20
          });
          requests[0].uploadProgress({
            total: 100,
            loaded: 40
          });
          let customProgress = TestUtils.scryRenderedDOMComponentsWithClass(component, 'customProgress');
          expect(customProgress.length).to.be.eql(1);
          expect(rendererSpy.callCount).to.be.equal(4);
          let arg0 = rendererSpy.args[0];
          let arg1 = rendererSpy.args[1];
          let arg2 = rendererSpy.args[2];
          let arg3 = rendererSpy.args[3];

          expect(arg0.length).to.be.eql(3);
          expect(arg0[0]).to.be.eql(-1);
          expect(arg0[1]).to.be.eql(false);
          expect(typeof arg0[2]).to.be.eql('function');

          expect(arg1[0]).to.be.eql(0);

          expect(arg2[0]).to.be.eql(20);

          expect(arg3[0]).to.be.eql(40);
          done();
        });
      });

      describe('on error', () => {
        it('pass hasError parameter to custom renderer', (done) => {
          let form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
          TestUtils.Simulate.submit(form);
          requests[0].dispatchEvent(new sinon.Event('error', false, false, this));

          let customProgress = TestUtils.scryRenderedDOMComponentsWithClass(component, 'customProgress');
          expect(customProgress.length).to.be.eql(1);
          expect(rendererSpy.callCount).to.be.equal(3);
          let arg0 = rendererSpy.args[0];
          let arg1 = rendererSpy.args[1];
          let arg2 = rendererSpy.args[2];

          expect(arg0.length).to.be.eql(3);
          expect(arg0[0]).to.be.eql(-1);
          expect(arg0[1]).to.be.eql(false);
          expect(typeof arg0[2]).to.be.eql('function');

          expect(arg1[0]).to.be.eql(0);

          expect(arg2[1]).to.be.eql(true);
          done();
        });
      });

      describe('provides abort helper', () => {
        it('stop uploading when cancel button clicked', () => {
          let form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
          TestUtils.Simulate.submit(form);
          requests[0].uploadProgress({
            total: 100,
            loaded: 20
          });
          let progressBarContent = TestUtils.scryRenderedDOMComponentsWithClass(component, 'customProgress');
          let cancelButton = progressBarContent[0].querySelector('.canceler');
          TestUtils.Simulate.click(cancelButton);
          expect(onAbortSpy.calledOnce).to.be.equal(true);
          let event = onAbortSpy.args[0][0];
          let request = onAbortSpy.args[0][1];

          expect(event.type).to.be.eql('abort');
          expect(request.readyState).to.be.eql(sinon.FakeXMLHttpRequest.UNSENT);

          expect(rendererSpy.callCount).to.be.equal(4);
          let arg0 = rendererSpy.args[0];
          let arg1 = rendererSpy.args[1];
          let arg2 = rendererSpy.args[2];
          let arg3 = rendererSpy.args[3];

          expect(arg0.length).to.be.eql(3);
          expect(arg0[0]).to.be.eql(-1);
          expect(arg0[1]).to.be.eql(false);
          expect(typeof arg0[2]).to.be.eql('function');

          expect(arg1[0]).to.be.eql(0);

          expect(arg2[0]).to.be.eql(20);

          expect(arg3[0]).to.be.eql(-1);
          expect(arg3[1]).to.be.eql(false);
        });
      });
    });
  });

});
