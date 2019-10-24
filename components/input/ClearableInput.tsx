import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import classNames from 'classnames';
import Icon from '../icon';
import { tuple } from '../_util/type';
import Input, { InputProps } from './Input';
import TextArea, { TextAreaProps } from './TextArea';

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
  children: React.ReactElement<TextArea | Input>;
  target: HTMLTextAreaElement | HTMLInputElement;
  onChange?: Function;
  resizeTextarea?: Function;
  disabled?: boolean;
  className?: string;
  style?: object;
}

export interface ClearableInputState {
  value: any;
}

class ClearableInput extends React.Component<ClearableInputProps, ClearableInputState> {
  constructor(props: ClearableInputProps) {
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

  setValue(
    value: string,
    e:
      | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
      | React.MouseEvent<HTMLElement, MouseEvent>,
    callback?: () => void,
  ) {
    if (!('value' in this.props)) {
      this.setState({ value }, callback);
    }
    const { onChange, target } = this.props;
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
      onChange();
    }
  }

  handleReset = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const { inputType, target, resizeTextarea } = this.props;
    this.setValue('', e, () => {
      if (inputType === ClearableInputType[0] && resizeTextarea) {
        resizeTextarea();
      }
      target.focus();
    });
  };

  renderClearIcon(prefixCls: string) {
    const { allowClear, disabled, inputType } = this.props;
    const { value } = this.state;
    if (!allowClear || disabled || value === undefined || value === null || value === '') {
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
        onClick={this.handleReset}
        className={className}
        role="button"
      />
    );
  }

  renderTextAreaWithClearIcon() {
    const { prefixCls, className, style, children } = this.props;
    const affixWrapperCls = classNames(className, `${prefixCls}-affix-wrapper`);
    return (
      <span className={affixWrapperCls} style={style}>
        {React.cloneElement(children, {
          style: null,
        })}
        {this.renderSuffix(prefixCls)}
      </span>
    );
  }

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

  render() {
    return this.renderTextAreaWithClearIcon();
  }
}

polyfill(ClearableInput);

export default ClearableInput;
