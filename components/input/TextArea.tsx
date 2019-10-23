import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import ResizeObserver from 'rc-resize-observer';
import calculateNodeHeight from './calculateNodeHeight';
import ClearableInput from './ClearableInput';
import raf from '../_util/raf';
import warning from '../_util/warning';

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

  textArea: HTMLTextAreaElement;

  saveTextArea = (input: ClearableInput) => {
    this.textArea = input.inputElement as HTMLTextAreaElement;
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
    const autoSize = this.props.autoSize || this.props.autosize;
    if (!autoSize || !this.textArea) {
      return;
    }
    const { minRows, maxRows } = autoSize as AutoSizeType;
    const textareaStyles = calculateNodeHeight(this.textArea, false, minRows, maxRows);
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

  renderTextArea = () => {
    const { autoSize, autosize } = this.props;
    const { textareaStyles, resizing } = this.state;
    warning(
      autosize === undefined,
      'Input.TextArea',
      'autosize is deprecated, please use autoSize instead.',
    );
    const { props } = this;
    return (
      <ResizeObserver onResize={this.resizeOnNextFrame} disabled={!(autoSize || autosize)}>
        <ClearableInput
          type="text"
          textareaStyles={textareaStyles}
          resizing={resizing}
          {...props}
          ref={this.saveTextArea}
          resizeTextarea={this.resizeTextarea}
        />
      </ResizeObserver>
    );
  };

  render() {
    return this.renderTextArea();
  }
}

polyfill(TextArea);

export default TextArea;
