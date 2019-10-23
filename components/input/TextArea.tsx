import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import omit from 'omit.js';
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import calculateNodeHeight from './calculateNodeHeight';
import ClearableInput from './ClearableInput';
import raf from '../_util/raf';
import warning from '../_util/warning';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';

export interface AutoSizeType {
  minRows?: number;
  maxRows?: number;
}

export type HTMLTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface TextAreaProps extends HTMLTextareaProps {
  prefixCls?: string;
  /* deprecated, use autoSize instead */
  autosize?: boolean | AutoSizeType;
  autoSize?: boolean | AutoSizeType;
  onPressEnter?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  allowClear?: boolean;
}

export interface TextAreaState {
  textareaStyles?: React.CSSProperties;
  /** We need add process style to disable scroll first and then add back to avoid unexpected scrollbar  */
  resizing?: boolean;
}

class TextArea extends React.Component<TextAreaProps, TextAreaState> {
  nextFrameActionId: number;

  resizeFrameId: number;

  constructor(props: TextAreaProps) {
    super(props);
    this.state = {
      textareaStyles: {},
      resizing: false,
    };
  }

  textArea: ClearableInput;

  saveTextArea = (clearableInput: ClearableInput) => {
    this.textArea = clearableInput;
  };

  componentDidMount() {
    this.resizeTextarea();
  }

  componentDidUpdate(prevProps: TextAreaProps) {
    // Re-render with the new content then recalculate the height as required.
    if (prevProps.value !== this.props.value) {
      this.resizeTextarea();
    }
  }

  resizeOnNextFrame = () => {
    raf.cancel(this.nextFrameActionId);
    this.nextFrameActionId = raf(this.resizeTextarea);
  };

  resizeTextarea = () => {
    const props = this.props as TextAreaProps;
    const autoSize = props.autoSize || props.autosize;
    if (!autoSize || !this.textArea.inputElement) {
      return;
    }
    const { minRows, maxRows } = autoSize as AutoSizeType;
    const textareaStyles = calculateNodeHeight(
      this.textArea.inputElement as HTMLTextAreaElement,
      false,
      minRows,
      maxRows,
    );
    this.setState({ textareaStyles, resizing: true }, () => {
      raf.cancel(this.resizeFrameId);
      this.resizeFrameId = raf(() => {
        this.setState({ resizing: false });
      });
    });
  };

  componentWillUnmount() {
    raf.cancel(this.nextFrameActionId);
    raf.cancel(this.resizeFrameId);
  }

  renderTextArea = ({ getPrefixCls }: ConfigConsumerProps) => {
    const { textareaStyles, resizing } = this.state;
    const { prefixCls: customizePrefixCls, className, disabled, autoSize, autosize } = this.props;
    const { ...props } = this.props;
    const otherProps = omit(props, [
      'prefixCls',
      'onPressEnter',
      'autoSize',
      'autosize',
      'defaultValue',
      'allowClear',
    ]);
    const prefixCls = getPrefixCls('input', customizePrefixCls);
    const cls = classNames(prefixCls, className, {
      [`${prefixCls}-disabled`]: disabled,
    });

    warning(
      autosize === undefined,
      'Input.TextArea',
      'autosize is deprecated, please use autoSize instead.',
    );

    const style = {
      ...props.style,
      ...textareaStyles,
      ...(resizing ? { overflow: 'hidden' } : null),
    };
    // Fix https://github.com/ant-design/ant-design/issues/6776
    // Make sure it could be reset when using form.getFieldDecorator
    if ('value' in otherProps) {
      otherProps.value = otherProps.value || '';
    }
    return (
      <ResizeObserver onResize={this.resizeOnNextFrame} disabled={!(autoSize || autosize)}>
        <ClearableInput
          type="text"
          cls={cls}
          resizeTextarea={this.resizeTextarea}
          onChange={props.onChange}
          className={props.className}
          disabled={props.disabled}
          otherProps={otherProps}
          defaultValue={props.defaultValue}
          value={props.value}
          prefixCls={prefixCls}
          allowClear={props.allowClear}
          style={style}
          ref={this.saveTextArea}
        />
      </ResizeObserver>
    );
  };

  render() {
    return <ConfigConsumer>{this.renderTextArea}</ConfigConsumer>;
  }
}

polyfill(TextArea);

export default TextArea;
