import * as React from 'react';

export function setValue(
  value: string,
  targetRefName: string,
  e: React.ChangeEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLElement, MouseEvent>,
  callback?: () => void,
) {
  if (!('value' in this.props)) {
    this.setState({ value }, callback);
  }
  const { onChange } = this.props;
  if (onChange) {
    let event = e;
    if (e.type === 'click') {
      // click clear icon
      event = Object.create(e);
      event.target = this[targetRefName];
      event.currentTarget = this[targetRefName];
      const originalInputValue = this[targetRefName].value;
      // change target ref value cause e.target.value should be '' when clear input
      this[targetRefName].value = '';
      onChange(event as React.ChangeEvent<HTMLTextAreaElement>);
      // reset target ref value
      this[targetRefName].value = originalInputValue;
      return;
    }
    onChange(event as React.ChangeEvent<HTMLTextAreaElement>);
  }
}

export function fixControlledValue<T>(value: T) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return value;
}
