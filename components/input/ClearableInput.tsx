import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import omit from 'omit.js';
import classNames from 'classnames';
import Icon from '../icon';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import { tuple } from '../_util/type';
import { InputProps } from './Input';
import { TextAreaProps } from './TextArea';

const ClearableInputType = tuple('text', 'input');

export function hasPrefixSuffix(props: InputProps | ClearableInputProps) {
  return !!('prefix' in props || props.suffix || props.allowClear);
}

function fixControlledValue<T>(value: T) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return value;
}

interface ClearableInputTextAreaProps extends TextAreaProps {
  textareaStyles?: React.CSSProperties;
  resizeTextarea: Function;
  resizing?: boolean;
  type: (typeof ClearableInputType)[number];
}

interface ClearableInputProps extends InputProps {
  type: (typeof ClearableInputType)[number];
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

  static getDerivedStateFromProps(nextProps: InputProps | TextAreaProps) {
    if ('value' in nextProps) {
      return {
        value: nextProps.value,
      };
    }
    return null;
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
    const { allowClear, disabled, type } = this.props;
    const { value } = this.state;
    if (!allowClear || disabled || value === undefined || value === null || value === '') {
      return null;
    }
    const className =
      type === ClearableInputType[0]
        ? `${prefixCls}-textarea-clear-icon`
        : `${prefixCls}-clear-icon`;
    return (
      <Icon
        type="close-circle"
        theme="filled"
        onClick={this.handleReset}
        className={className}
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

    if (!hasPrefixSuffix(props as ClearableInputProps)) {
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

  renderTextArea = (prefixCls: string) => {
    const { value } = this.state;
    const { className, disabled, textareaStyles, resizing } = this
      .props as ClearableInputTextAreaProps;
    const otherProps = omit(this.props, [
      'prefixCls',
      'onPressEnter',
      'autoSize',
      'autosize',
      'defaultValue',
      'allowClear',
      'textareaStyles',
      'resizeTextarea',
      'resizing',
    ]);
    const cls = classNames(prefixCls, className, {
      [`${prefixCls}-disabled`]: disabled,
    });
    // Fix https://github.com/ant-design/ant-design/issues/6776
    // Make sure it could be reset when using form.getFieldDecorator
    if ('value' in otherProps) {
      otherProps.value = otherProps.value || '';
    }
    const style = {
      ...this.props.style,
      ...textareaStyles,
      ...(resizing ? { overflow: 'hidden' } : null),
    };
    return (
      <textarea
        {...otherProps}
        value={fixControlledValue(value)}
        className={cls}
        style={style}
        onChange={this.handleTextareaChange}
        ref={this.saveTextAreaElementRef}
      />
    );
  };

  renderInput = (prefixCls: string) => {
    const { value } = this.state;
    const { className, addonBefore, addonAfter } = this.props as ClearableInputProps;
    // Fix https://fb.me/react-unknown-prop
    const otherProps = omit(this.props, [
      'prefixCls',
      'onPressEnter',
      'addonBefore',
      'addonAfter',
      'prefix',
      'suffix',
      'allowClear',
      // Input elements must be either controlled or uncontrolled,
      // specify either the value prop, or the defaultValue prop, but not both.
      'defaultValue',
      'size',
      'resizeTextarea',
      'resizing',
    ]);
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

  renderComponent = ({ getPrefixCls }: ConfigConsumerProps) => {
    const { prefixCls: customizePrefixCls } = this.props;
    const prefixCls = getPrefixCls('input', customizePrefixCls);
    return this.props.type === ClearableInputType[0]
      ? this.renderTextAreaWithClearIcon(prefixCls, this.renderTextArea(prefixCls))
      : this.renderLabeledInput(prefixCls, this.renderInput(prefixCls));
  };

  render() {
    return <ConfigConsumer>{this.renderComponent}</ConfigConsumer>;
  }
}

polyfill(ClearableInput);

export default ClearableInput;
