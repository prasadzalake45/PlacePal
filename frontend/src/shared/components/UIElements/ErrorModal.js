import React from 'react';

import Button from '../FormElement/Button';
import Model from './Model';
const ErrorModal = props => {
  return (
    <Model
      onCancel={props.onClear}
      header="An Error Occurred!"
      show={!!props.error}
      footer={<Button onClick={props.onClear}>Okay</Button>}
    >
      <p>{props.error}</p>
    </Model>
  );
};

export default ErrorModal;
