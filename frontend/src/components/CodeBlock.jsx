// src/components/CodeBlock.jsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ code, language = 'python' }) => {
  // If code is an array, join it with newlines
  const codeToRender = Array.isArray(code) ? code.join('\n') : code;

  return (
    <div className="code-block-container">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={true}
        wrapLines={true}
      >
        {codeToRender}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;