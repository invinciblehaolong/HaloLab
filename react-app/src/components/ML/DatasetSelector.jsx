import React from 'react';
import { datasets } from './data';

const DatasetSelector = ({ selectedDataset, onSelectDataset }) => {
  return (
    <div className="dataset-selector">
      <h2>选择数据集</h2>
      <div className="dataset-cards">
        {datasets.map(dataset => (
          <div 
            key={dataset.id}
            className={`dataset-card ${selectedDataset?.id === dataset.id ? 'selected' : ''}`}
            onClick={() => onSelectDataset(dataset)}
          >
            <h3>{dataset.name}</h3>
            <div className="dataset-meta">
              <div>特征数: {dataset.features}</div>
              <div>样本数: {dataset.samples}</div>
              <div>任务类型: {dataset.task}</div>
            </div>
            <p className="dataset-description">{dataset.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatasetSelector;