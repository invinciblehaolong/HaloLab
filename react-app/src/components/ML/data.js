// 算法数据
export const algorithms = [
  {
    id: 1,
    name: "线性回归",
    category: "机器学习",
    description: "用于预测连续值的线性模型",
    sourceCode: `from sklearn.linear_model import LinearRegression

# 初始化模型
model = LinearRegression()

# 训练模型
model.fit(X_train, y_train)

# 预测
y_pred = model.predict(X_test)`,
    parameters: [
      { name: "fit_intercept", type: "boolean", default: true, description: "是否计算截距" },
      { name: "normalize", type: "boolean", default: false, description: "是否归一化特征" }
    ]
  },
  {
    id: 2,
    name: "卷积神经网络",
    category: "深度学习",
    description: "用于图像处理的深度学习模型",
    sourceCode: `import tensorflow as tf
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense

# 构建模型
model = tf.keras.Sequential([
  Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
  MaxPooling2D((2, 2)),
  Flatten(),
  Dense(100, activation='relu'),
  Dense(10, activation='softmax')
])

# 编译模型
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])`,
    parameters: [
      { name: "epochs", type: "number", default: 10, description: "训练轮数" },
      { name: "batch_size", type: "number", default: 32, description: "批次大小" },
      { name: "learning_rate", type: "number", default: 0.001, description: "学习率" }
    ]
  }
];

// 数据集数据
export const datasets = [
  {
    id: 1,
    name: "波士顿房价",
    description: "包含波士顿地区房价及相关特征的数据集，用于回归任务",
    features: 13,
    samples: 506,
    task: "回归"
  },
  {
    id: 2,
    name: "MNIST",
    description: "包含手写数字图片的数据集，用于图像分类任务",
    features: "28x28像素",
    samples: 70000,
    task: "分类"
  }
];