import * as React from 'react';
import * as PropTypes from 'prop-types';
import { polyfill } from 'react-lifecycles-compat';
import Group from './Group';
import Search from './Search';
import TextArea from './TextArea';
import Password from './Password';
import { Omit, tuple } from '../_util/type';
import warning from '../_util/warning';
import ClearableInput, { hasPrefixSuffix } from './ClearableInput';
import classNames from 'classnames';
import omit from 'omit.js';

export const InputSizes = tuple('small', 'default', 'large');

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  prefixCls?: string;
  size?: (typeof InputSizes)[number];
  onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  allowClear?: boolean;
}

class Input extends React.Component<InputProps, any> {
  static Group: typeof Group;

  static Search: typeof Search;

  static TextArea: typeof TextArea;

  static Password: typeof Password;

  static defaultProps = {
    type: 'text',
  };

  static propTypes = {
    type: PropTypes.string,
    id: PropTypes.string,
    size: PropTypes.oneOf(InputSizes),
    maxLength: PropTypes.number,
    disabled: PropTypes.bool,
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    className: PropTypes.string,
    addonBefore: PropTypes.node,
    addonAfter: PropTypes.node,
    prefixCls: PropTypes.string,
    onPressEnter: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    allowClear: PropTypes.bool,
  };

  input: HTMLInputElement;

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  select() {
    this.input.select();
  }

  getInputClassName(prefixCls: string) {
    const { size, disabled } = this.props as ClearableInputProps;
    return classNames(prefixCls, {
      [`${prefixCls}-sm`]: size === 'small',
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-disabled`]: disabled,
    });
  }

  renderInputWithLabel(prefixCls: string, children: React.ReactElement<any>) {
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

  saveInput = (input: ClearableInput) => {
    if (input && input.inputElement) {
      this.input = input.inputElement as HTMLInputElement;
    }
  };

  renderInput = () => {
    const { props } = this;
    return <ClearableInput {...props} inputType="input" ref={this.saveInput} />;
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
      'inputType',
    ]);
    return this.renderLabeledIcon(
      prefixCls,
      <input
        {...otherProps}
        value={fixControlledValue(value)}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
        className={classNames(this.getInputClassName(prefixCls), {
          [className!]: className && !addonBefore && !addonAfter,
        })}
        ref={this.saveInputElementRef}
      />,
    );
  };

  render() {
    return this.renderInput();
  }
}

polyfill(Input);

export default Input;
