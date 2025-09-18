import React from 'react';
import { algorithms } from './data';

const AlgorithmSelector = ({ onSelectAlgorithm }) => {
  return (
    <div className="algorithm-selector">
      <h2>选择算法</h2>
      <div className="algorithm-cards">
        {algorithms.map(algorithm => (
          <div 
            key={algorithm.id}
            className="algorithm-card"
            onClick={() => onSelectAlgorithm(algorithm)}
          >
            <div className="algorithm-category">{algorithm.category}</div>
            <h3>{algorithm.name}</h3>
            <p>{algorithm.description}</p>
            <button className="select-btn">选择</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlgorithmSelector;