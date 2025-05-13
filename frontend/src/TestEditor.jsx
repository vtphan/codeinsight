import React, { useState } from 'react';
import EditableCodeBlock from './components/EditableCodeBlock';

const TestEditor = () => {
  const [code, setCode] = useState(`def greet(name):\n    print(f"Hello, {name}!")`);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
      <h2 style={{ color: 'white' }}>Editable Python Code</h2>
      <EditableCodeBlock code={code} onChange={setCode} />
    </div>
  );
};

export default TestEditor;
