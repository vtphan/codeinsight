// src/components/EditableCodeBlock.jsx
import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

const highlightCode = (code) =>
  Prism.highlight(code, Prism.languages.python, 'python');

const EditableCodeBlock = ({ code, onChange }) => {
  return (
    <Editor
      value={code}
      onValueChange={onChange}
      highlight={highlightCode}
      padding={15}
      style={{
        fontFamily: '"Fira Code", monospace',
        fontSize: 13,
        backgroundColor: '#1e1e1e',
        color: '#d8d8d2',
        borderRadius: '10px',
        minHeight: '160px',
        whiteSpace: 'pre',
        outline: 'none',
      }}
    />
  );
};

export default EditableCodeBlock;
