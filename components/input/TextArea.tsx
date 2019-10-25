import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import ClearableInput from './ClearableInput';
import ResizableTextArea, { AutoSizeType } from './ResizableTextArea';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';

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

  resizeTextarea() {
    this.resizableTextArea.resizeTextarea();
  }

  saveTextArea = (resizableTextArea: ResizableTextArea) => {
    this.resizableTextArea = resizableTextArea;
  };

  saveClearableInput = (clearableInput: ClearableInput) => {
    this.clearableInput = clearableInput;
  };

  handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.clearableInput.setValue(e.target.value, this.resizableTextArea.textArea, e, () => {
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
      <ResizableTextArea
        {...(props as TextAreaProps)}
        prefixCls={prefixCls}
        onKeyDown={this.handleKeyDown}
        onChange={this.handleChange}
        ref={this.saveTextArea}
      />
    );
  };

  handleReset = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.clearableInput.setValue('', this.resizableTextArea.textArea, e, () => {
      this.resizableTextArea.renderTextArea();
      this.focus();
    });
  };

  renderComponent = ({ getPrefixCls }: ConfigConsumerProps) => {
    const { value, style, defaultValue, disabled, onChange, allowClear } = this.props;
    const { prefixCls: customizePrefixCls } = this.props;
    const prefixCls = getPrefixCls('input', customizePrefixCls);
    return (
      <ClearableInput
        prefixCls={prefixCls}
        inputType="text"
        value={value}
        defaultValue={defaultValue}
        allowClear={allowClear}
        disabled={disabled}
        onChange={onChange}
        element={this.renderTextArea(prefixCls)}
        ref={this.saveClearableInput}
        focus={this.focus}
        handleReset={this.handleReset}
        style={style}
      />
    );
  };

  render() {
    return <ConfigConsumer>{this.renderComponent}</ConfigConsumer>;
  }
}

polyfill(TextArea);

export default TextArea;
