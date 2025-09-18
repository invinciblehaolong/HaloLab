import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// 注册Chart.js组件
Chart.register(...registerables);

const TrainingVisualizer = ({ algorithm, dataset }) => {
  const [parameters, setParameters] = useState({});
  const [trainSize, setTrainSize] = useState(0.8);
  const [trainingResults, setTrainingResults] = useState(null);
  const [isTraining, setIsTraining] = useState(false);

  // 初始化参数
  useEffect(() => {
    if (algorithm?.parameters) {
      const initialParams = {};
      algorithm.parameters.forEach(param => {
        initialParams[param.name] = param.default;
      });
      setParameters(initialParams);
    }
  }, [algorithm]);

  // 模拟训练过程
  const handleTrain = () => {
    if (!algorithm || !dataset) return;
    
    setIsTraining(true);
    
    // 模拟训练延迟
    setTimeout(() => {
      // 生成模拟训练结果
      const epochs = algorithm.parameters?.find(p => p.name === 'epochs')?.default || 10;
      const results = {
        accuracy: Array.from({ length: epochs }, (_, i) => 0.5 + (Math.random() * 0.4) + (i * 0.01)),
        loss: Array.from({ length: epochs }, (_, i) => 0.8 - (Math.random() * 0.3) - (i * 0.02))
      };
      
      setTrainingResults(results);
      setIsTraining(false);
    }, 1500);
  };

  // 处理参数变化
  const handleParameterChange = (name, value) => {
    setParameters(prev => ({ ...prev, [name]: value }));
  };

  if (!algorithm || !dataset) {
    return (
      <div className="training-placeholder">
        请选择算法和数据集以开始训练
      </div>
    );
  }

  return (
    <div className="training-visualizer">
      <h2>训练效果展示</h2>
      
      <div className="training-controls">
        <div className="parameter-section">
          <h3>算法参数</h3>
          <div className="parameters-grid">
            {algorithm.parameters.map(param => (
              <div key={param.name} className="parameter-item">
                <label>
                  {param.name}:
                  <input
                    type={param.type}
                    value={parameters[param.name]}
                    onChange={(e) => handleParameterChange(
                      param.name, 
                      param.type === 'number' ? parseFloat(e.target.value) : e.target.value
                    )}
                    step={param.type === 'number' ? 0.001 : undefined}
                  />
                </label>
                <div className="parameter-hint">{param.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="dataset-split">
          <h3>数据集划分</h3>
          <div className="split-control">
            <label>
              训练集比例: {Math.round(trainSize * 100)}%
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={trainSize}
                onChange={(e) => setTrainSize(parseFloat(e.target.value))}
              />
            </label>
            <div>测试集比例: {Math.round((1 - trainSize) * 100)}%</div>
          </div>
        </div>
        
        <button 
          className="train-btn"
          onClick={handleTrain}
          disabled={isTraining}
        >
          {isTraining ? '训练中...' : '开始训练'}
        </button>
      </div>
      
      {trainingResults && (
        <div className="training-results">
          <div className="chart-container">
            <h3>准确率曲线</h3>
            <Line
              data={{
                labels: Array.from({ length: trainingResults.accuracy.length }, (_, i) => `第${i+1}轮`),
                datasets: [{
                  label: '准确率',
                  data: trainingResults.accuracy,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1
                }]
              }}
            />
          </div>
          
          <div className="chart-container">
            <h3>损失曲线</h3>
            <Line
              data={{
                labels: Array.from({ length: trainingResults.loss.length }, (_, i) => `第${i+1}轮`),
                datasets: [{
                  label: '损失值',
                  data: trainingResults.loss,
                  borderColor: 'rgb(255, 99, 132)',
                  tension: 0.1
                }]
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingVisualizer;