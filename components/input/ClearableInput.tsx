import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import classNames from 'classnames';
import Icon from '../icon';
import { tuple } from '../_util/type';
import { InputProps, InputSizes } from './Input';
import { TextAreaProps } from './TextArea';

const ClearableInputType = tuple('text', 'input');

export function hasPrefixSuffix(props: InputProps | ClearableInputProps) {
  return !!('prefix' in props || props.suffix || props.allowClear);
}

export function fixControlledValue<T>(value: T) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return value;
}

interface ClearableInputProps {
  prefixCls: string;
  inputType: (typeof ClearableInputType)[number];
  suffix?: React.ReactNode;
  value?: any;
  defaultValue?: any;
  allowClear?: boolean;
  element: React.ReactElement<any>;
  handleReset: any;
  onChange?: Function;
  resizeTextarea?: Function;
  disabled?: boolean;
  className?: string;
  style?: object;
  size?: (typeof InputSizes)[number];
  prefix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  focus: Function;
}

export interface ClearableInputState {
  currentValue: any;
}

class ClearableInput extends React.Component<ClearableInputProps, ClearableInputState> {
  constructor(props: ClearableInputProps) {
    super(props);
    const currentValue = typeof props.value === 'undefined' ? props.defaultValue : props.value;
    this.state = {
      currentValue,
    };
  }

  input: HTMLTextAreaElement | HTMLInputElement;

  static getDerivedStateFromProps(nextProps: InputProps | TextAreaProps) {
    if ('value' in nextProps) {
      return {
        value: nextProps.value,
      };
    }
    return null;
  }

  setValue(
    value: string,
    target: HTMLInputElement | HTMLTextAreaElement,
    e:
      | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
      | React.MouseEvent<HTMLElement, MouseEvent>,
    callback?: () => void,
  ) {
    this.setState({ currentValue: value }, callback);
    const { onChange } = this.props;
    if (onChange) {
      let event = e;
      if (e.type === 'click') {
        // click clear icon
        event = Object.create(e);
        event.target = target;
        event.currentTarget = target;
        const originalInputValue = target.value;
        // change target ref value cause e.target.value should be '' when clear input
        target.value = '';
        onChange(event);
        // reset target ref value
        target.value = originalInputValue;
        return;
      }
      onChange(event);
    }
  }

  renderClearIcon(prefixCls: string) {
    const { allowClear, disabled, inputType, handleReset } = this.props;
    const { currentValue } = this.state;
    if (
      !allowClear ||
      disabled ||
      currentValue === undefined ||
      currentValue === null ||
      currentValue === ''
    ) {
      return null;
    }
    const className =
      inputType === ClearableInputType[0]
        ? `${prefixCls}-textarea-clear-icon`
        : `${prefixCls}-clear-icon`;
    return (
      <Icon
        type="close-circle"
        theme="filled"
        onClick={handleReset}
        className={className}
        role="button"
      />
    );
  }

  renderClearableInput() {
    const { prefixCls, inputType, element } = this.props;
    if (inputType === ClearableInputType[0]) {
      return this.renderTextAreaWithClearIcon(prefixCls, element);
    }
    return this.renderInputWithLabel(prefixCls, this.renderLabeledIcon(prefixCls, element));
  }

  renderSuffix(prefixCls: string) {
    const { suffix, allowClear } = this.props;
    if (suffix || allowClear) {
      return (
        <span className={`${prefixCls}-suffix`}>
          {this.renderClearIcon(prefixCls)}
          {suffix}
        </span>
      );
    }
    return null;
  }

  getInputClassName(prefixCls: string) {
    const { size, disabled } = this.props;
    return classNames(prefixCls, {
      [`${prefixCls}-sm`]: size === 'small',
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-disabled`]: disabled,
    });
  }

  renderLabeledIcon(prefixCls: string, element: React.ReactElement<any>) {
    let { currentValue } = this.state;
    const props = this.props as ClearableInputProps;
    const suffix = this.renderSuffix(prefixCls);
    currentValue = fixControlledValue(currentValue);
    if (!hasPrefixSuffix(props as ClearableInputProps)) {
      return element;
    }

    const prefix = props.prefix ? (
      <span className={`${prefixCls}-prefix`}>{props.prefix}</span>
    ) : null;

    const affixWrapperCls = classNames(props.className, `${prefixCls}-affix-wrapper`, {
      [`${prefixCls}-affix-wrapper-sm`]: props.size === 'small',
      [`${prefixCls}-affix-wrapper-lg`]: props.size === 'large',
      [`${prefixCls}-affix-wrapper-with-clear-btn`]:
        props.suffix && props.allowClear && this.state.currentValue,
    });
    return (
      <span className={affixWrapperCls} style={props.style}>
        {prefix}
        {React.cloneElement(element, {
          style: null,
          value: currentValue,
          className: this.getInputClassName(prefixCls),
        })}
        {suffix}
      </span>
    );
  }

  renderInputWithLabel(prefixCls: string, labeledElement: React.ReactElement<any>) {
    const { addonBefore, addonAfter, style, size, className } = this.props;
    // Not wrap when there is not addons
    if (!addonBefore && !addonAfter) {
      return labeledElement;
    }

    const wrapperClassName = `${prefixCls}-group`;
    const addonClassName = `${wrapperClassName}-addon`;
    const addonBeforeNode = addonBefore ? (
      <span className={addonClassName}>{addonBefore}</span>
    ) : null;
    const addonAfterNode = addonAfter ? <span className={addonClassName}>{addonAfter}</span> : null;

    const mergedWrapperClassName = classNames(`${prefixCls}-wrapper`, {
      [wrapperClassName]: addonBefore || addonAfter,
    });

    const mergedGroupClassName = classNames(className, `${prefixCls}-group-wrapper`, {
      [`${prefixCls}-group-wrapper-sm`]: size === 'small',
      [`${prefixCls}-group-wrapper-lg`]: size === 'large',
    });

    // Need another wrapper for changing display:table to display:inline-block
    // and put style prop in wrapper
    return (
      <span className={mergedGroupClassName} style={style}>
        <span className={mergedWrapperClassName}>
          {addonBeforeNode}
          {React.cloneElement(labeledElement, { style: null })}
          {addonAfterNode}
        </span>
      </span>
    );
  }

  renderTextAreaWithClearIcon(prefixCls: string, element: React.ReactElement<any>) {
    let { currentValue } = this.state;
    const { className, style } = this.props;
    const affixWrapperCls = classNames(className, `${prefixCls}-affix-wrapper`);
    currentValue = fixControlledValue(currentValue);
    return (
      <span className={affixWrapperCls} style={style}>
        {React.cloneElement(element, {
          style: null,
          value: currentValue,
        })}
        {this.renderClearIcon(prefixCls)}
      </span>
    );
  }

  render() {
    return this.renderClearableInput();
  }
}

polyfill(ClearableInput);

export default ClearableInput;
