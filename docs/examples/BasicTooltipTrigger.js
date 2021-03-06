import React from 'react';
import TooltipTrigger from '../../src';
import '../../src/styles.css';

const BasicTooltipTrigger = ({ tooltip, children, ...props }) => (
  <TooltipTrigger
    {...props}
    tooltip={({
      getTooltipProps,
      getArrowProps,
      tooltipRef,
      arrowRef,
      placement
    }) => (
      <span
        {...getTooltipProps({
          ref: tooltipRef,
          className: 'tooltip-container'
        })}
      >
        <span
          {...getArrowProps({
            ref: arrowRef,
            'data-placement': placement,
            className: 'tooltip-arrow'
          })}
        />
        {tooltip}
      </span>
    )}
  >
    {({ getTriggerProps, triggerRef }) => (
      <span
        {...getTriggerProps({
          ref: triggerRef
        })}
      >
        {children}
      </span>
    )}
  </TooltipTrigger>
);

export default BasicTooltipTrigger;
