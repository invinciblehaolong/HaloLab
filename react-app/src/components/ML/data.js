// // 算法数据
// export const algorithms = [
//   {
//     id: 1,
//     name: "线性回归",
//     category: "机器学习",
//     description: "用于预测连续值的线性模型",
//     sourceCode: `from sklearn.linear_model import LinearRegression

// # 初始化模型
// model = LinearRegression()

// # 训练模型
// model.fit(X_train, y_train)

// # 预测
// y_pred = model.predict(X_test)`,
//     parameters: [
//       { name: "fit_intercept", type: "boolean", default: true, description: "是否计算截距" },
//       { name: "normalize", type: "boolean", default: false, description: "是否归一化特征" }
//     ]
//   },
//   {
//     id: 2,
//     name: "卷积神经网络",
//     category: "深度学习",
//     description: "用于图像处理的深度学习模型",
//     sourceCode: `import tensorflow as tf
// from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense

// # 构建模型
// model = tf.keras.Sequential([
//   Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
//   MaxPooling2D((2, 2)),
//   Flatten(),
//   Dense(100, activation='relu'),
//   Dense(10, activation='softmax')
// ])

// # 编译模型
// model.compile(optimizer='adam',
//               loss='sparse_categorical_crossentropy',
//               metrics=['accuracy'])`,
//     parameters: [
//       { name: "epochs", type: "number", default: 10, description: "训练轮数" },
//       { name: "batch_size", type: "number", default: 32, description: "批次大小" },
//       { name: "learning_rate", type: "number", default: 0.001, description: "学习率" }
//     ]
//   }
// ];

// // 数据集数据
// export const datasets = [
//   {
//     id: 1,
//     name: "波士顿房价",
//     description: "包含波士顿地区房价及相关特征的数据集，用于回归任务",
//     features: 13,
//     samples: 506,
//     task: "回归"
//   },
//   {
//     id: 2,
//     name: "MNIST",
//     description: "包含手写数字图片的数据集，用于图像分类任务",
//     features: "28x28像素",
//     samples: 70000,
//     task: "分类"
//   }
// ];

// ————————————————————————————————————————————————————————————————————————

// 算法数据（区块链性能提升 & 共识相关）
export const algorithms = [
  {
    id: 1,
    name: "HASBFT（含TC/AS）",
    category: "共识优化",
    description: "在HotStuff流水线上集成交易哈希压缩（TC）与BLS聚合签名（AS），面向高并发联盟链的低延迟共识。",
    sourceCode: `// Go-like 伪代码：HASBFT 主循环（含权重与批量验证）
for view := 0; ; view++ {
  leader := WeightedElect(weights)            // 信誉权重选主
  proposal := leader.BuildBlock(batch=B)       // 批量打包
  tc := TCModule.CompressHashes(proposal.Txs)  // 交易哈希压缩
  sigs := ParallelVerifyBLS(proposal.QC)       // BLS批量验签
  if sigs.Valid && tc.Ok {
    Broadcast(Prepare, proposal)
    if Quorum(2f+1) { Commit(proposal) }
  } else { TriggerViewChange() }
}`,
    parameters: [
      { name: "B", type: "number", default: 256, description: "批大小（交易并行度）" },
      { name: "pipeline", type: "boolean", default: true, description: "是否启用HotStuff流水线" },
      { name: "qc_threshold", type: "number", default: 2, description: "QC阈值（表示2f+1）" }
    ]
  },
  {
    id: 2,
    name: "TC-Module（交易哈希压缩）",
    category: "数据轻量化",
    description: "XOR折叠+分层Merkle，对交易哈希做无损压缩以降低通信与存储开销。",
    sourceCode: `// Python 伪代码：32B -> 16B 折叠示例
def xor_fold(hash32: bytes) -> bytes:
    # 前16字节与后16字节按位异或，返回16字节摘要
    return bytes(a ^ b for a, b in zip(hash32[:16], hash32[16:]))
# 构建轻量Merkle：叶子存折叠哈希，根保留原SHA256以保持安全边界`,
    parameters: [
      { name: "fold_bytes", type: "number", default: 16, description: "折叠后字节数" },
      { name: "cache_size", type: "number", default: 4096, description: "叶子/中间节点缓存条目" }
    ]
  },
  {
    id: 3,
    name: "AS-Module（BLS聚合签名）",
    category: "密码学优化",
    description: "基于BLS12-381的批量验证与聚合，显著降低大规模节点下的验证成本。",
    sourceCode: `# Python 伪代码：批量BLS验证
def verify_batch(pubkeys, msgs, sigs, batch_size=64):
    for i in range(0, len(sigs), batch_size):
        ok = bls.AggregateVerify(pubkeys[i:i+batch_size],
                                 msgs[i:i+batch_size],
                                 sigs[i:i+batch_size])
        if not ok: return False
    return True`,
    parameters: [
      { name: "batch_size", type: "number", default: 64, description: "批验证的签名条数" },
      { name: "lru_capacity", type: "number", default: 8192, description: "已验公钥/消息缓存大小" }
    ]
  },
  {
    id: 4,
    name: "Bayes-Rep（贝叶斯信誉）",
    category: "信誉模型",
    description: "对节点诚实/异常事件进行Beta后验更新，输出长期信誉与置信区间。",
    sourceCode: `# 伪代码：Beta(α,β) 更新
def update(alpha, beta, honest: bool):
    if honest: alpha += 1
    else:      beta  += 1
    r_long = alpha / (alpha + beta)
    return alpha, beta, r_long`,
    parameters: [
      { name: "alpha0", type: "number", default: 3, description: "先验α" },
      { name: "beta0", type: "number", default: 1, description: "先验β" },
      { name: "decay", type: "number", default: 0.999, description: "滑动衰减系数，防止权重锁死" }
    ]
  },
  {
    id: 5,
    name: "Predictor（短期信誉预测）",
    category: "AI/机器学习",
    description: "基于GBDT/GNN的短期诚实概率预测，用于冷启动与波动期的权重补偿。",
    sourceCode: `# 伪代码：输入特征 -> 概率与置信度
p, conf = model.predict_proba(x_i_t)  # x_i_t 包含延迟分位数/缺签频次/一致率等`,
    parameters: [
      { name: "model", type: "string", default: "GBDT", description: "预测模型类型（GBDT/GNN）" },
      { name: "feature_window", type: "number", default: 30, description: "特征滑窗大小（秒）" }
    ]
  },
  {
    id: 6,
    name: "RL-Tuner（参数调度）",
    category: "自适应控制",
    description: "依据网络状态自适应调整批大小B、并行度与视图超时，带安全护栏。",
    sourceCode: `# 伪代码：基于目标P95延迟的简单调参
if p95 > target: B = max(B-10, B_min)
elif p95 < target-120: B = min(B+10, B_max)`,
    parameters: [
      { name: "target_p95_ms", type: "number", default: 900, description: "目标P95延迟" },
      { name: "B_min", type: "number", default: 64, description: "最小批大小" },
      { name: "B_max", type: "number", default: 512, description: "最大批大小" }
    ]
  },
  {
    id: 7,
    name: "HotStuff（基线）",
    category: "基线对照",
    description: "未引入TC/AS与信誉机制的流水线BFT，作为性能与稳定性的对照组。",
    sourceCode: `// HotStuff 简化流程：Prepare -> Pre-Commit -> Commit -> Decide`,
    parameters: [
      { name: "pipeline", type: "boolean", default: true, description: "是否启用流水线" }
    ]
  }
];

// 数据集/工作负载（用于评测与对照）
export const datasets = [
  {
    id: 1,
    name: "GovBench-HighQPS",
    description: "政务高并发模拟：均匀到达+少量热点键，适配电子政务实时同步场景。",
    features: "QPS分布、键冲突比例、交易大小(256B/512B)",
    samples: 1200000,
    task: "共识评测"
  },
  {
    id: 2,
    name: "IoT-WeakNet",
    description: "物联网弱网：RTT抖动100±50ms、丢包10%，评估RL调参与AS批验稳定性。",
    features: "RTT/丢包/抖动分布、批大小B轨迹",
    samples: 600000,
    task: "鲁棒性评测"
  },
  {
    id: 3,
    name: "Byzantine-Mix",
    description: "拜占庭混合行为：缺签、双签、延迟投票的比例与时间模式，用于信誉与治理验证。",
    features: "恶意模式比例、视图切换事件、异常标签",
    samples: 300000,
    task: "容错与信誉评测"
  },
  // {
  //   id: 4,
  //   name: "Microbench-TC-AS",
  //   description: "TC/AS微基准：不同批大小、压缩命中率、公私钥缓存命中率下的CPU/带宽消耗。",
  //   features: "batch_size、fold_bytes、cache命中率、CPU/带宽",
  //   samples: 100000,
  //   task: "模块微基准"
  // }
];
