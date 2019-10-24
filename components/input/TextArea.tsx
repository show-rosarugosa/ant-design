import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import ClearableInput from './ClearableInput';
import { AutoSizeType } from './ResizableTextArea';

export type HTMLTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface TextAreaProps extends HTMLTextareaProps {
  prefixCls?: string;
  /* deprecated, use autoSize instead */
  autosize?: boolean | AutoSizeType;
  autoSize?: boolean | AutoSizeType;
  onPressEnter?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  allowClear?: boolean;
}

class TextArea extends React.Component {
  textArea: HTMLTextAreaElement;

  focus() {
    this.textArea.focus();
  }

  blur() {
    this.textArea.blur();
  }

  saveTextArea = (input: ClearableInput) => {
    this.textArea = input.textAreaElement as HTMLTextAreaElement;
  };

  renderTextArea = () => {
    const { props } = this;
    return <ClearableInput inputType="text" {...props} ref={this.saveTextArea} />;
  };

  render() {
    return this.renderTextArea();
  }
}

polyfill(TextArea);

export default TextArea;
