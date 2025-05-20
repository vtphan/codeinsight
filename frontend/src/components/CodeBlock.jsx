// src/components/CodeBlock.jsx
import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ code, language = 'python', editable = false, onChange }) => {
  const [localCode, setLocalCode] = useState(
    Array.isArray(code) ? code.join('\n') : code || ''
  );

  useEffect(() => {
    setLocalCode(Array.isArray(code) ? code.join('\n') : code || '');
  }, [code]);

  const handleChange = (e) => {
    const newCode = e.target.value;
    setLocalCode(newCode);
    if (onChange) onChange(newCode);
  };

  return (
    <div className="code-block-container">
      {editable ? (
        <textarea
          value={localCode}
          onChange={handleChange}
          style={{
            width: '100%',
            height: '300px',
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            lineHeight: '1.5',
          }}
        />
      ) : (
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={true}
          wrapLines={true}
        >
          {localCode}
        </SyntaxHighlighter>
      )}
    </div>
  );
};

export default CodeBlock;
