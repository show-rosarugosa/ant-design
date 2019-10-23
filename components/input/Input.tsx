import * as React from 'react';
import * as PropTypes from 'prop-types';
import omit from 'omit.js';
import { polyfill } from 'react-lifecycles-compat';
import Group from './Group';
import Search from './Search';
import TextArea from './TextArea';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import Password from './Password';
import { Omit, tuple } from '../_util/type';
import warning from '../_util/warning';
import ClearableInput from './ClearableInput';

function hasPrefixSuffix(props: InputProps) {
  return !!('prefix' in props || props.suffix || props.allowClear);
}

const InputSizes = tuple('small', 'default', 'large');

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

  // Since polyfill `getSnapshotBeforeUpdate` need work with `componentDidUpdate`.
  // We keep an empty function here.
  componentDidUpdate() {}

  getSnapshotBeforeUpdate(prevProps: InputProps) {
    if (hasPrefixSuffix(prevProps) !== hasPrefixSuffix(this.props)) {
      warning(
        this.input !== document.activeElement,
        'Input',
        `When Input is focused, dynamic add or remove prefix / suffix will make it lose focus caused by dom structure change. Read more: https://ant.design/components/input/#FAQ`,
      );
    }
    return null;
  }

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  select() {
    this.input.select();
  }

  saveInput = (input: ClearableInput) => {
    this.input = input.inputElement as HTMLInputElement;
  };

  renderInput(prefixCls: string) {
    const {
      className,
      addonBefore,
      style,
      value,
      addonAfter,
      allowClear,
      prefix,
      suffix,
      disabled,
      defaultValue,
    } = this.props;
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
    ]);

    return (
      <ClearableInput
        style={style}
        type="input"
        defaultValue={defaultValue}
        value={value}
        disabled={disabled}
        suffix={suffix}
        prefix={prefix}
        allowClear={allowClear}
        otherProps={otherProps}
        prefixCls={prefixCls}
        addonBefore={addonBefore}
        addonAfter={addonAfter}
        className={className}
        ref={this.saveInput}
      />
    );
  }

  renderComponent = ({ getPrefixCls }: ConfigConsumerProps) => {
    const { prefixCls: customizePrefixCls } = this.props;
    const prefixCls = getPrefixCls('input', customizePrefixCls);
    return this.renderInput(prefixCls);
  };

  render() {
    return <ConfigConsumer>{this.renderComponent}</ConfigConsumer>;
  }
}

polyfill(Input);

export default Input;
