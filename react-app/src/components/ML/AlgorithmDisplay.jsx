import React from 'react';

const AlgorithmDisplay = ({ algorithm }) => {
  if (!algorithm) return null;
  
  return (
    <div className="algorithm-display">
      <div className="algorithm-header">
        <h2>{algorithm.name}</h2>
        <div className="algorithm-badge">{algorithm.category}</div>
      </div>
      
      <div className="algorithm-description">
        <p>{algorithm.description}</p>
      </div>
      
      <div className="algorithm-code">
        <h3>算法实现</h3>
        <pre><code>{algorithm.sourceCode}</code></pre>
      </div>
    </div>
  );
};

export default AlgorithmDisplay;