/**
 * @author Mohsin Ul Haq <mohsinulhaq01@gmail.com>
 */
import React, { PureComponent } from 'react';
import { createPortal } from 'react-dom';
import T from 'prop-types';
import { Manager, Reference, Popper } from 'react-popper';
import Tooltip from './Tooltip';
import { TooltipContext, callAll, noop } from './utils';

const DEFAULT_MODIFIERS = {
  preventOverflow: {
    boundariesElement: 'viewport',
    padding: 0
  }
};

export default class TooltipTrigger extends PureComponent {
  static propTypes = {
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
    portalContainer:
      typeof HTMLElement !== 'undefined' ? T.instanceOf(HTMLElement) : T.object,
    /**
     * modifiers passed directly to the underlying popper.js instance
     * For more information, refer to Popper.js’ modifier docs:
     * @link https://popper.js.org/popper-documentation.html#modifiers
     */
    modifiers: T.object
  };

  static defaultProps = {
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

  state = {
    tooltipShown: this._isControlled() ? false : this.props.defaultTooltipShown
  };

  _isControlled() {
    return this.props.tooltipShown !== undefined;
  }

  _getState() {
    return this._isControlled()
      ? this.props.tooltipShown
      : this.state.tooltipShown;
  }

  _setTooltipState = state => {
    const cb = () => this.props.onVisibilityChange(state);

    if (this._isControlled()) {
      cb();
    } else {
      this.setState({ tooltipShown: state }, cb);
    }
  };

  _clearScheduled = () => {
    clearTimeout(this._hideTimeout);
    clearTimeout(this._showTimeout);
  };

  _showTooltip = (delay = this.props.delayShow) => {
    this._clearScheduled();
    this._showTimeout = setTimeout(() => this._setTooltipState(true), delay);
  };

  _hideTooltip = (delay = this.props.delayHide) => {
    this._clearScheduled();
    this._hideTimeout = setTimeout(() => this._setTooltipState(false), delay);
  };

  _toggleTooltip = delay => {
    const action = this._getState() ? '_hideTooltip' : '_showTooltip';
    this[action](delay);
  };

  _contextMenuToggle = event => {
    event.preventDefault();
    this._toggleTooltip();
  };

  componentWillUnmount() {
    this._clearScheduled();
  }

  getTriggerProps = (props = {}) => {
    const isClickTriggered = this.props.trigger === 'click';
    const isHoverTriggered = this.props.trigger === 'hover';
    const isRightClickTriggered = this.props.trigger === 'right-click';

    return {
      ...props,
      onClick: callAll(isClickTriggered && this._toggleTooltip, props.onClick),
      onContextMenu: callAll(
        isRightClickTriggered && this._contextMenuToggle,
        props.onContextMenu
      ),
      onMouseEnter: callAll(
        isHoverTriggered && this._showTooltip,
        props.onMouseEnter
      ),
      onMouseLeave: callAll(
        isHoverTriggered && this._hideTooltip,
        props.onMouseLeave
      )
    };
  };

  render() {
    const {
      children,
      tooltip,
      placement,
      trigger,
      modifiers,
      closeOnOutOfBoundaries,
      usePortal,
      portalContainer
    } = this.props;

    const popper = (
      <Popper
        placement={placement}
        modifiers={{ ...DEFAULT_MODIFIERS, ...modifiers }}
      >
        {({
          ref,
          style,
          placement,
          arrowProps,
          outOfBoundaries,
          scheduleUpdate
        }) => (
          <TooltipContext.Consumer>
            {({
              addParentOutsideClickHandler,
              removeParentOutsideClickHandler,
              parentOutsideClickHandler
            }) => (
              <Tooltip
                {...{
                  style,
                  arrowProps,
                  placement,
                  trigger,
                  closeOnOutOfBoundaries,
                  tooltip,
                  addParentOutsideClickHandler,
                  removeParentOutsideClickHandler,
                  parentOutsideClickHandler,
                  outOfBoundaries,
                  scheduleUpdate
                }}
                innerRef={ref}
                hideTooltip={this._hideTooltip}
                clearScheduled={this._clearScheduled}
              />
            )}
          </TooltipContext.Consumer>
        )}
      </Popper>
    );

    return (
      <Manager>
        <Reference>
          {({ ref }) =>
            children({ getTriggerProps: this.getTriggerProps, triggerRef: ref })
          }
        </Reference>
        {this._getState() &&
          (usePortal ? createPortal(popper, portalContainer) : popper)}
      </Manager>
    );
  }
}
