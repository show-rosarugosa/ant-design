import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import ClearableInput from './ClearableInput';
import ResizableTextArea, { AutoSizeType } from './ResizableTextArea';

export type HTMLTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface TextAreaProps extends HTMLTextareaProps {
  prefixCls?: string;
  /* deprecated, use autoSize instead */
  autosize?: boolean | AutoSizeType;
  autoSize?: boolean | AutoSizeType;
  onPressEnter?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  allowClear?: boolean;
}

class TextArea extends React.Component<TextAreaProps> {
  resizableTextArea: ResizableTextArea;

  clearableInput: ClearableInput;

  focus() {
    this.resizableTextArea.textArea.focus();
  }

  blur() {
    this.resizableTextArea.textArea.blur();
  }

  saveTextArea = (input: ResizableTextArea) => {
    this.resizableTextArea = input;
  };

  saveClearableInput = (input: ClearableInput) => {
    this.clearableInput = input;
  };

  handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    this.clearableInput.setValue(e.target.value, e, () => {
      this.resizableTextArea.resizeTextarea();
    });
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { onPressEnter, onKeyDown } = this.props;
    if (e.keyCode === 13 && onPressEnter) {
      onPressEnter(e);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  renderTextArea = (prefixCls: string) => {
    const { props } = this;
    return (
      <ClearableInput prefixCls={} inputType={} target={}>
        <ResizableTextArea
          {...(props as TextAreaProps)}
          prefixCls={prefixCls}
          value={fixControlledValue(value)}
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          ref={this.saveTextArea}
        />
      </ClearableInput>
    );
  };

  render() {
    return this.renderTextArea();
  }
}

polyfill(TextArea);

export default TextArea;
