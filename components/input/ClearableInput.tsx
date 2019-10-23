import * as React from 'react';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import Icon from '../icon';
import { ConfigConsumer } from '../config-provider';
import { tuple } from '../_util/type';
import { InputProps } from './Input';

export function hasPrefixSuffix(props: InputProps | ClearableInputProps) {
  return !!('prefix' in props || props.suffix || props.allowClear);
}

const InputSizes = tuple('small', 'default', 'large');

const ClearableInputType = tuple('text', 'input');

function fixControlledValue<T>(value: T) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return value;
}

interface BasicProps {
  prefixCls: string;
  defaultValue?: any;
  value?: any;
  allowClear?: boolean;
  className?: string;
  disabled?: boolean;
  onChange?: Function;
  otherProps: Array<any>;
  style: any;
  type: (typeof ClearableInputType)[number];
}

interface ClearableInputTextAreaProps extends BasicProps {
  cls: string;
  resizeTextarea: Function;
}

interface ClearableInputProps extends BasicProps {
  size?: (typeof InputSizes)[number];
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export interface ClearableInputState {
  value: any;
}

class ClearableInput extends React.Component<
  ClearableInputTextAreaProps | ClearableInputProps,
  ClearableInputState
> {
  inputElement: HTMLInputElement | HTMLTextAreaElement;

  constructor(props: ClearableInputTextAreaProps | ClearableInputProps) {
    super(props);
    const value = typeof props.value === 'undefined' ? props.defaultValue : props.value;
    this.state = {
      value,
    };
  }

  saveInputElementRef = (inputElement: HTMLInputElement) => {
    this.inputElement = inputElement;
  };

  saveTextAreaElementRef = (inputElement: HTMLTextAreaElement) => {
    this.inputElement = inputElement;
  };

  handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const callback =
      this.props.type === ClearableInputType[0]
        ? () => {
            (this.props as ClearableInputTextAreaProps).resizeTextarea();
          }
        : () => {};
    this.setValue(e.target.value, e, callback);
  };

  setValue(
    value: string,
    e:
      | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
      | React.MouseEvent<HTMLElement, MouseEvent>,
    callback?: () => void,
  ) {
    if (!('value' in this.props) || this.props.value === undefined) {
      this.setState({ value }, callback);
    }
    const { onChange } = this.props as ClearableInputTextAreaProps;
    if (onChange) {
      let event = e;
      if (e.type === 'click') {
        // click clear icon
        event = Object.create(e);
        event.target = this.inputElement;
        event.currentTarget = this.inputElement;
        const originalInputValue = this.inputElement.value;
        // change target ref value cause e.target.value should be '' when clear input
        this.inputElement.value = '';
        onChange(event as React.ChangeEvent<HTMLTextAreaElement>);
        // reset target ref value
        this.inputElement.value = originalInputValue;
        return;
      }
      onChange(event as React.ChangeEvent<HTMLTextAreaElement>);
    }
  }

  getInputClassName(prefixCls: string) {
    const { size, disabled } = this.props as ClearableInputProps;
    return classNames(prefixCls, {
      [`${prefixCls}-sm`]: size === 'small',
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-disabled`]: disabled,
    });
  }

  renderTextAreaWithClearIcon(prefixCls: string, children: React.ReactElement<any>) {
    const { props } = this;
    const affixWrapperCls = classNames(props.className, `${prefixCls}-affix-wrapper`);
    return (
      <span className={affixWrapperCls} style={(props as ClearableInputTextAreaProps).style}>
        {React.cloneElement(children, {
          style: null,
        })}
        {this.renderClearIcon(prefixCls)}
      </span>
    );
  }

  focus() {
    this.inputElement.focus();
  }

  blur() {
    this.inputElement.blur();
  }

  select() {
    this.inputElement.select();
  }

  handleReset = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const callback =
      this.props.type === ClearableInputType[0]
        ? () => {
            (this.props as ClearableInputTextAreaProps).resizeTextarea();
          }
        : () => {};
    this.setValue('', e, () => {
      callback();
      this.focus();
    });
  };

  renderClearIcon(prefixCls: string) {
    const { allowClear, disabled } = this.props;
    const { value } = this.state;
    if (!allowClear || disabled || value === undefined || value === null || value === '') {
      return null;
    }
    return (
      <Icon
        type="close-circle"
        theme="filled"
        onClick={this.handleReset}
        className={`${prefixCls}-textarea-clear-icon`}
        role="button"
      />
    );
  }

  // handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  //   const { onPressEnter, onKeyDown } = this.props as ClearableInputTextAreaProps;
  //   if (e.keyCode === 13 && onPressEnter) {
  //     onPressEnter(e);
  //   }
  //   if (onKeyDown) {
  //     onKeyDown(e);
  //   }
  // };

  renderSuffix(prefixCls: string) {
    const { suffix, allowClear } = this.props as ClearableInputProps;
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

  renderLabeledInput(prefixCls: string, children: React.ReactElement<any>) {
    const { addonBefore, addonAfter, style, size, className } = this.props as ClearableInputProps;
    // Not wrap when there is not addons
    if (!addonBefore && !addonAfter) {
      return children;
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
          {React.cloneElement(children, { style: null })}
          {addonAfterNode}
        </span>
      </span>
    );
  }

  renderLabeledIcon(prefixCls: string, children: React.ReactElement<any>) {
    const props = this.props as ClearableInputProps;
    const suffix = this.renderSuffix(prefixCls);

    if (!hasPrefixSuffix(props)) {
      return children;
    }

    const prefix = props.prefix ? (
      <span className={`${prefixCls}-prefix`}>{props.prefix}</span>
    ) : null;

    const affixWrapperCls = classNames(props.className, `${prefixCls}-affix-wrapper`, {
      [`${prefixCls}-affix-wrapper-sm`]: props.size === 'small',
      [`${prefixCls}-affix-wrapper-lg`]: props.size === 'large',
      [`${prefixCls}-affix-wrapper-with-clear-btn`]:
        props.suffix && props.allowClear && this.state.value,
    });
    return (
      <span className={affixWrapperCls} style={props.style}>
        {prefix}
        {React.cloneElement(children, {
          style: null,
          className: this.getInputClassName(prefixCls),
        })}
        {suffix}
      </span>
    );
  }

  renderTextArea = () => {
    const { value } = this.state;
    const { prefixCls, cls, style, otherProps } = this.props as ClearableInputTextAreaProps;
    return this.renderTextAreaWithClearIcon(
      prefixCls,
      <textarea
        {...otherProps}
        value={fixControlledValue(value)}
        className={cls}
        style={style}
        onChange={this.handleTextareaChange}
        ref={this.saveTextAreaElementRef}
      />,
    );
  };

  renderInput = (prefixCls: string) => {
    const { value } = this.state;
    const { className, addonBefore, addonAfter, otherProps } = this.props as ClearableInputProps;
    return this.renderLabeledIcon(
      prefixCls,
      <input
        {...otherProps}
        value={fixControlledValue(value)}
        onChange={this.handleTextareaChange}
        className={classNames(this.getInputClassName(prefixCls), {
          [className!]: className && !addonBefore && !addonAfter,
        })}
        ref={this.saveInputElementRef}
      />,
    );
  };

  renderComponent = () => {
    const { prefixCls } = this.props;
    return this.props.type === ClearableInputType[0]
      ? this.renderTextArea()
      : this.renderLabeledInput(prefixCls, this.renderInput(prefixCls));
  };

  render() {
    return <ConfigConsumer>{this.renderComponent}</ConfigConsumer>;
  }
}

polyfill(ClearableInput);

export default ClearableInput;
