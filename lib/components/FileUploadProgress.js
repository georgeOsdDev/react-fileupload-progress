'use strict';

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.parse-int");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _events = require("events");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _objectAssign = _interopRequireDefault(require("object-assign"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var styles = {
  progressWrapper: {
    height: '10px',
    marginTop: '10px',
    width: '400px',
    "float": 'left',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    WebkitBoxShadow: 'inset 0 1px 2px rgba(0,0,0,.1)',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,.1)'
  },
  progressBar: {
    "float": 'left',
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
    "float": 'left',
    fontSize: '21px',
    fontWeight: 700,
    lineHeight: 1,
    color: '#000',
    textShadow: '0 1px 0 #fff',
    filter: 'alpha(opacity=20)',
    opacity: '.2'
  }
};

var FileUploadProgress =
/*#__PURE__*/
function (_React$Component) {
  _inherits(FileUploadProgress, _React$Component);

  function FileUploadProgress(props) {
    var _this;

    _classCallCheck(this, FileUploadProgress);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FileUploadProgress).call(this, props));
    _this.proxy = new _events.EventEmitter();
    _this.state = {
      progress: -1,
      hasError: false
    };
    return _this;
  }

  _createClass(FileUploadProgress, [{
    key: "cancelUpload",
    value: function cancelUpload() {
      this.proxy.emit('abort');
      this.setState({
        progress: -1,
        hasError: false
      });
    }
  }, {
    key: "onSubmit",
    value: function onSubmit(e) {
      e.preventDefault();
      this.setState({
        progress: 0,
        hasError: false
      }, this._doUpload);
    }
  }, {
    key: "render",
    value: function render() {
      var formElement = this.props.formRenderer(this.onSubmit.bind(this));
      var progessElement = this.props.progressRenderer(this.state.progress, this.state.hasError, this.cancelUpload.bind(this));
      return _react["default"].createElement("div", null, formElement, progessElement);
    }
  }, {
    key: "_getFormData",
    value: function _getFormData() {
      if (this.props.formGetter) {
        return this.props.formGetter();
      }

      return new FormData(_reactDom["default"].findDOMNode(this.refs.form));
    }
  }, {
    key: "_doUpload",
    value: function _doUpload() {
      var _this2 = this;

      var form = this._getFormData();

      var req = new XMLHttpRequest();
      req.open(this.props.method, this.props.url);
      req.addEventListener('load', function (e) {
        _this2.proxy.removeAllListeners(['abort']);

        var newState = {
          progress: 100
        };

        if (req.status >= 200 && req.status <= 299) {
          _this2.setState(newState, function () {
            _this2.props.onLoad(e, req);
          });
        } else {
          newState.hasError = true;

          _this2.setState(newState, function () {
            _this2.props.onError(e, req);
          });
        }
      }, false);
      req.addEventListener('error', function (e) {
        _this2.setState({
          hasError: true
        }, function () {
          _this2.props.onError(e, req);
        });
      }, false);
      req.upload.addEventListener('progress', function (e) {
        var progress = 0;

        if (e.total !== 0) {
          progress = parseInt(e.loaded / e.total * 100, 10);
        }

        _this2.setState({
          progress: progress
        }, function () {
          _this2.props.onProgress(e, req, progress);
        });
      }, false);
      req.addEventListener('abort', function (e) {
        _this2.setState({
          progress: -1
        }, function () {
          _this2.props.onAbort(e, req);
        });
      }, false);
      this.proxy.once('abort', function () {
        req.abort();
      });
      this.props.beforeSend(req).send(this.props.formCustomizer(form));
    }
  }]);

  return FileUploadProgress;
}(_react["default"].Component);

FileUploadProgress.propTypes = {
  url: _propTypes["default"].string.isRequired,
  method: _propTypes["default"].string.isRequired,
  formGetter: _propTypes["default"].func,
  formRenderer: _propTypes["default"].func,
  progressRenderer: _propTypes["default"].func,
  formCustomizer: _propTypes["default"].func,
  beforeSend: _propTypes["default"].func,
  onProgress: _propTypes["default"].func,
  onLoad: _propTypes["default"].func,
  onError: _propTypes["default"].func,
  onAbort: _propTypes["default"].func
};
FileUploadProgress.defaultProps = {
  formRenderer: function formRenderer(onSubmit) {
    return _react["default"].createElement("form", {
      className: "_react_fileupload_form_content",
      ref: "form",
      method: "post",
      onSubmit: onSubmit
    }, _react["default"].createElement("div", null, _react["default"].createElement("input", {
      type: "file",
      name: "file"
    })), _react["default"].createElement("input", {
      type: "submit"
    }));
  },
  progressRenderer: function progressRenderer(progress, hasError, cancelHandler) {
    if (hasError || progress > -1) {
      var barStyle = (0, _objectAssign["default"])({}, styles.progressBar);
      barStyle.width = "".concat(progress, "%");

      var message = _react["default"].createElement("span", null, "Uploading ...");

      if (hasError) {
        barStyle.backgroundColor = '#d9534f';
        message = _react["default"].createElement("span", {
          style: {
            color: '#a94442'
          }
        }, "Failed to upload ...");
      } else if (progress === 100) {
        message = _react["default"].createElement("span", null, "Successfully uploaded");
      }

      return _react["default"].createElement("div", {
        className: "_react_fileupload_progress_content"
      }, _react["default"].createElement("div", {
        style: styles.progressWrapper
      }, _react["default"].createElement("div", {
        className: "_react_fileupload_progress_bar",
        style: barStyle
      })), _react["default"].createElement("button", {
        className: "_react_fileupload_progress_cancel",
        style: styles.cancelButton,
        onClick: cancelHandler
      }, _react["default"].createElement("span", null, "\xD7")), _react["default"].createElement("div", {
        style: {
          clear: 'left'
        }
      }, message));
    }

    return '';
  },
  formCustomizer: function formCustomizer(form) {
    return form;
  },
  beforeSend: function beforeSend(request) {
    return request;
  },
  onProgress: function onProgress(e, request, progress) {},
  onLoad: function onLoad(e, request) {},
  onError: function onError(e, request) {},
  onAbort: function onAbort(e, request) {}
};
var _default = FileUploadProgress;
exports["default"] = _default;