import React, { PureComponent } from 'react';
import _extends from '@babel/runtime/helpers/esm/extends';
import _inheritsLoose from '@babel/runtime/helpers/esm/inheritsLoose';
import _assertThisInitialized from '@babel/runtime/helpers/esm/assertThisInitialized';
import { findDOMNode, createPortal } from 'react-dom';
import T from 'prop-types';
import { Manager, Reference, Popper } from 'react-popper';

var TooltipContext = React.createContext({});
var callAll = function callAll() {
  for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return fns.forEach(function (fn) {
      return fn && fn.apply(void 0, args);
    });
  };
};
var noop = function noop() {};

var MUTATION_OBSERVER_CONFIG = {
  childList: true,
  subtree: true
};
/**
 * @private
 */

var Tooltip =
/*#__PURE__*/
function (_PureComponent) {
  _inheritsLoose(Tooltip, _PureComponent);

  function Tooltip() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _PureComponent.call.apply(_PureComponent, [this].concat(args)) || this;

    _this._handleOutsideClick = function (e) {
      if (!findDOMNode(_assertThisInitialized(_assertThisInitialized(_this))).contains(e.target)) {
        var _this$props = _this.props,
            hideTooltip = _this$props.hideTooltip,
            clearScheduled = _this$props.clearScheduled,
            parentOutsideClickHandler = _this$props.parentOutsideClickHandler;
        clearScheduled();
        hideTooltip();
        parentOutsideClickHandler && parentOutsideClickHandler(e);
      }
    };

    _this._addOutsideClickHandler = function () {
      return document.addEventListener('click', _this._handleOutsideClick);
    };

    _this._removeOutsideClickHandler = function () {
      return document.removeEventListener('click', _this._handleOutsideClick);
    };

    _this.getArrowProps = function (props) {
      if (props === void 0) {
        props = {};
      }

      return _extends({}, props, {
        style: _extends({}, props.style, _this.props.arrowProps.style)
      });
    };

    _this.getTooltipProps = function (props) {
      if (props === void 0) {
        props = {};
      }

      var isHoverTriggered = _this.props.trigger === 'hover';
      return _extends({}, props, {
        style: _extends({}, props.style, _this.props.style),
        onMouseEnter: callAll(isHoverTriggered && _this.props.clearScheduled, props.onMouseEnter),
        onMouseLeave: callAll(isHoverTriggered && _this.props.hideTooltip, props.onMouseLeave)
      });
    };

    return _this;
  }

  var _proto = Tooltip.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var _this2 = this;

    var trigger = this.props.trigger;
    var observer = this.observer = new MutationObserver(function () {
      _this2.props.scheduleUpdate();
    });
    observer.observe(findDOMNode(this), MUTATION_OBSERVER_CONFIG);

    if (trigger === 'click' || trigger === 'right-click') {
      var removeParentOutsideClickHandler = this.props.removeParentOutsideClickHandler;
      document.addEventListener('click', this._handleOutsideClick);
      removeParentOutsideClickHandler && removeParentOutsideClickHandler();
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    var trigger = this.props.trigger;
    this.observer.disconnect();

    if (trigger === 'click' || trigger === 'right-click') {
      var addParentOutsideClickHandler = this.props.addParentOutsideClickHandler;
      document.removeEventListener('click', this._handleOutsideClick);
      this._handleOutsideClick = undefined;
      addParentOutsideClickHandler && addParentOutsideClickHandler();
    }
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    if (this.props.closeOnOutOfBoundaries && this.props.outOfBoundaries) {
      this.props.hideTooltip();
    }
  };

  _proto.render = function render() {
    var _this$props2 = this.props,
        arrowProps = _this$props2.arrowProps,
        placement = _this$props2.placement,
        tooltip = _this$props2.tooltip,
        innerRef = _this$props2.innerRef;
    return React.createElement(TooltipContext.Provider, {
      value: {
        addParentOutsideClickHandler: this._addOutsideClickHandler,
        removeParentOutsideClickHandler: this._removeOutsideClickHandler,
        parentOutsideClickHandler: this._handleOutsideClick
      }
    }, tooltip({
      getTooltipProps: this.getTooltipProps,
      getArrowProps: this.getArrowProps,
      tooltipRef: innerRef,
      arrowRef: arrowProps.ref,
      placement: placement
    }));
  };

  return Tooltip;
}(PureComponent);

Tooltip.propTypes = {
  innerRef: T.func,
  style: T.object,
  arrowProps: T.object,
  placement: T.string,
  trigger: T.string,
  clearScheduled: T.func,
  tooltip: T.func,
  hideTooltip: T.func,
  parentOutsideClickHandler: T.func,
  scheduleUpdate: T.func,
  removeParentOutsideClickHandler: T.func,
  addParentOutsideClickHandler: T.func,
  closeOnOutOfBoundaries: T.bool,
  outOfBoundaries: T.bool
};

var DEFAULT_MODIFIERS = {
  preventOverflow: {
    boundariesElement: 'viewport',
    padding: 0
  }
};

var TooltipTrigger =
/*#__PURE__*/
function (_PureComponent) {
  _inheritsLoose(TooltipTrigger, _PureComponent);

  function TooltipTrigger() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _PureComponent.call.apply(_PureComponent, [this].concat(args)) || this;
    _this.state = {
      tooltipShown: _this._isControlled() ? false : _this.props.defaultTooltipShown
    };

    _this._setTooltipState = function (state) {
      var cb = function cb() {
        return _this.props.onVisibilityChange(state);
      };

      if (_this._isControlled()) {
        cb();
      } else {
        _this.setState({
          tooltipShown: state
        }, cb);
      }
    };

    _this._clearScheduled = function () {
      clearTimeout(_this._hideTimeout);
      clearTimeout(_this._showTimeout);
    };

    _this._showTooltip = function (delay) {
      if (delay === void 0) {
        delay = _this.props.delayShow;
      }

      _this._clearScheduled();

      _this._showTimeout = setTimeout(function () {
        return _this._setTooltipState(true);
      }, delay);
    };

    _this._hideTooltip = function (delay) {
      if (delay === void 0) {
        delay = _this.props.delayHide;
      }

      _this._clearScheduled();

      _this._hideTimeout = setTimeout(function () {
        return _this._setTooltipState(false);
      }, delay);
    };

    _this._toggleTooltip = function (delay) {
      var action = _this._getState() ? '_hideTooltip' : '_showTooltip';

      _this[action](delay);
    };

    _this._contextMenuToggle = function (event) {
      event.preventDefault();

      _this._toggleTooltip();
    };

    _this.getTriggerProps = function (props) {
      if (props === void 0) {
        props = {};
      }

      var isClickTriggered = _this.props.trigger === 'click';
      var isHoverTriggered = _this.props.trigger === 'hover';
      var isRightClickTriggered = _this.props.trigger === 'right-click';
      return _extends({}, props, {
        onClick: callAll(isClickTriggered && _this._toggleTooltip, props.onClick),
        onContextMenu: callAll(isRightClickTriggered && _this._contextMenuToggle, props.onContextMenu),
        onMouseEnter: callAll(isHoverTriggered && _this._showTooltip, props.onMouseEnter),
        onMouseLeave: callAll(isHoverTriggered && _this._hideTooltip, props.onMouseLeave)
      });
    };

    return _this;
  }

  var _proto = TooltipTrigger.prototype;

  _proto._isControlled = function _isControlled() {
    return this.props.tooltipShown !== undefined;
  };

  _proto._getState = function _getState() {
    return this._isControlled() ? this.props.tooltipShown : this.state.tooltipShown;
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this._clearScheduled();
  };

  _proto.render = function render() {
    var _this2 = this;

    var _this$props = this.props,
        children = _this$props.children,
        tooltip = _this$props.tooltip,
        placement = _this$props.placement,
        trigger = _this$props.trigger,
        modifiers = _this$props.modifiers,
        closeOnOutOfBoundaries = _this$props.closeOnOutOfBoundaries,
        usePortal = _this$props.usePortal,
        portalContainer = _this$props.portalContainer;
    var popper = React.createElement(Popper, {
      placement: placement,
      modifiers: _extends({}, DEFAULT_MODIFIERS, modifiers)
    }, function (_ref) {
      var ref = _ref.ref,
          style = _ref.style,
          placement = _ref.placement,
          arrowProps = _ref.arrowProps,
          outOfBoundaries = _ref.outOfBoundaries,
          scheduleUpdate = _ref.scheduleUpdate;
      return React.createElement(TooltipContext.Consumer, null, function (_ref2) {
        var addParentOutsideClickHandler = _ref2.addParentOutsideClickHandler,
            removeParentOutsideClickHandler = _ref2.removeParentOutsideClickHandler,
            parentOutsideClickHandler = _ref2.parentOutsideClickHandler;
        return React.createElement(Tooltip, _extends({
          style: style,
          arrowProps: arrowProps,
          placement: placement,
          trigger: trigger,
          closeOnOutOfBoundaries: closeOnOutOfBoundaries,
          tooltip: tooltip,
          addParentOutsideClickHandler: addParentOutsideClickHandler,
          removeParentOutsideClickHandler: removeParentOutsideClickHandler,
          parentOutsideClickHandler: parentOutsideClickHandler,
          outOfBoundaries: outOfBoundaries,
          scheduleUpdate: scheduleUpdate
        }, {
          innerRef: ref,
          hideTooltip: _this2._hideTooltip,
          clearScheduled: _this2._clearScheduled
        }));
      });
    });
    return React.createElement(Manager, null, React.createElement(Reference, null, function (_ref3) {
      var ref = _ref3.ref;
      return children({
        getTriggerProps: _this2.getTriggerProps,
        triggerRef: ref
      });
    }), this._getState() && (usePortal ? createPortal(popper, portalContainer) : popper));
  };

  return TooltipTrigger;
}(PureComponent);

TooltipTrigger.propTypes = {
  /**
   * trigger
   */
  children: T.func.isRequired,

  /**
   * tooltip
   */
  tooltip: T.func.isRequired,

  /**
   * whether tooltip is shown by default
   */
  defaultTooltipShown: T.bool,

  /**
   * use to create controlled tooltip
   */
  tooltipShown: T.bool,

  /**
   * сalled when the visibility of the tooltip changes
   */
  onVisibilityChange: T.func,

  /**
   * delay in showing the tooltip
   */
  delayShow: T.number,

  /**
   * delay in hiding the tooltip
   */
  delayHide: T.number,

  /**
   * Popper’s placement. Valid placements are:
   *  - auto
   *  - top
   *  - right
   *  - bottom
   *  - left
   * Each placement can have a variation from this list:
   *  -start
   *  -end
   */
  placement: T.string,

  /**
   * the event that triggers the tooltip
   */
  trigger: T.oneOf(['click', 'hover', 'right-click', 'none']),

  /**
   * whether to close the tooltip when it's trigger is out of the boundary
   */
  closeOnOutOfBoundaries: T.bool,

  /**
   * whether to use React.createPortal for creating tooltip
   */
  usePortal: T.bool,

  /**
   * element to be used as portal container
   */
  portalContainer: typeof HTMLElement !== 'undefined' ? T.instanceOf(HTMLElement) : T.object,

  /**
   * modifiers passed directly to the underlying popper.js instance
   * For more information, refer to Popper.js’ modifier docs:
   * @link https://popper.js.org/popper-documentation.html#modifiers
   */
  modifiers: T.object
};
TooltipTrigger.defaultProps = {
  delayShow: 0,
  delayHide: 0,
  defaultTooltipShown: false,
  placement: 'right',
  trigger: 'hover',
  closeOnOutOfBoundaries: true,
  onVisibilityChange: noop,
  usePortal: true,
  portalContainer: typeof document !== 'undefined' ? document.body : null
};

export default TooltipTrigger;
