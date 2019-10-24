import * as React from 'react';
import * as PropTypes from 'prop-types';
import { polyfill } from 'react-lifecycles-compat';
import classNames from 'classnames';
import omit from 'omit.js';
import Group from './Group';
import Search from './Search';
import TextArea from './TextArea';
import Password from './Password';
import { Omit, tuple } from '../_util/type';
import ClearableInput from './ClearableInput';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';

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

  clearableInput: ClearableInput;

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  select() {
    this.input.select();
  }

  saveClearableInput = (input: ClearableInput) => {
    this.clearableInput = input;
  };

  saveInput = (input: HTMLInputElement) => {
    console.log(input, 'dsaaaaaaaaaaaaa');
    this.input = input;
  };

  getInputClassName(prefixCls: string) {
    const { size, disabled } = this.props;
    return classNames(prefixCls, {
      [`${prefixCls}-sm`]: size === 'small',
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-disabled`]: disabled,
    });
  }

  renderInput = (prefixCls: string) => {
    const { className, addonBefore, addonAfter } = this.props;
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
    return (
      <input
        {...otherProps}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
        className={classNames(this.getInputClassName(prefixCls), {
          [className!]: className && !addonBefore && !addonAfter,
        })}
        ref={this.saveInput}
      />
    );
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.clearableInput.setValue(e.target.value, e);
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onPressEnter, onKeyDown } = this.props;
    if (e.keyCode === 13 && onPressEnter) {
      onPressEnter(e);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  getRef = () => {
    return this.input;
  };

  renderComponent = ({ getPrefixCls }: ConfigConsumerProps) => {
    const { value, defaultValue, disabled, className, onChange, suffix, allowClear } = this.props;
    const { prefixCls: customizePrefixCls } = this.props;
    const prefixCls = getPrefixCls('input', customizePrefixCls);
    return (
      <ClearableInput
        prefixCls={prefixCls}
        inputType="text"
        suffix={suffix}
        value={value}
        defaultValue={defaultValue}
        allowClear={allowClear}
        element={this.renderInput(prefixCls)}
        onChange={onChange}
        disabled={disabled}
        className={className}
        ref={this.saveClearableInput}
        focus={this.focus}
        getRef={this.getRef}
      />
    );
  };

  render() {
    return <ConfigConsumer>{this.renderComponent}</ConfigConsumer>;
  }
}

polyfill(Input);

export default Input;
