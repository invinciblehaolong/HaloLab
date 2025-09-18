import React, { useState } from 'react';
import AlgorithmSelector from '../components/ML/AlgorithmSelector';
import AlgorithmDisplay from '../components/ML/AlgorithmDisplay';
import DatasetSelector from '../components/ML/DatasetSelector';
import TrainingVisualizer from '../components/ML/TrainingVisualizer';
import '../assets/styles/ml-styles.css';

const MLAlgorithmPage = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [showMainContent, setShowMainContent] = useState(false);

  // 处理算法选择
  const handleAlgorithmSelect = (algorithm) => {
    setSelectedAlgorithm(algorithm);
    // 添加平滑过渡效果
    setTimeout(() => {
      setShowMainContent(true);
    }, 300);
  };

  // 返回算法选择
  const handleBackToSelection = () => {
    setShowMainContent(false);
    setTimeout(() => {
      setSelectedAlgorithm(null);
      setSelectedDataset(null);
    }, 300);
  };

  return (
    <div className="ml-page-container">
      <header className="ml-page-header">
        <h1>机器学习与深度学习算法演示</h1>
        {showMainContent && (
          <button 
            className="back-btn"
            onClick={handleBackToSelection}
          >
            返回算法选择
          </button>
        )}
      </header>

      <main className="ml-page-content">
        {/* 算法选择界面 */}
        {!showMainContent ? (
          <div className="selection-view">
            <AlgorithmSelector onSelectAlgorithm={handleAlgorithmSelect} />
          </div>
        ) : (
          /* 主内容区域 - 平滑过渡显示 */
          <div className="main-view">
            <div className="grid-layout">
              {/* 区域1: 算法展示 */}
              <div className="grid-item algorithm-section">
                <AlgorithmDisplay algorithm={selectedAlgorithm} />
              </div>
              
              {/* 区域2: 数据集选择 */}
              <div className="grid-item dataset-section">
                <DatasetSelector 
                  selectedDataset={selectedDataset}
                  onSelectDataset={setSelectedDataset}
                />
              </div>
              
              {/* 区域3: 训练效果展示 */}
              <div className="grid-item training-section">
                <TrainingVisualizer 
                  algorithm={selectedAlgorithm} 
                  dataset={selectedDataset} 
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MLAlgorithmPage;