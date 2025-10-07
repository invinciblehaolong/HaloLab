import { useMemo, useState } from 'react';
import '../assets/styles/genshin-damage.css';

const levelCoefficients = {
  80: 1077,
  90: 1447,
};

const formatNumber = (value) => {
  return Number.isFinite(value)
    ? value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
    : '—';
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const parseMultiplierInput = (input) => {
  if (!input) return 0;
  return input
    .split(/[+,，\s]+/)
    .map((chunk) => parseFloat(chunk))
    .filter((num) => Number.isFinite(num))
    .reduce((total, num) => total + num, 0);
};

const useObjectHandler = (setter) => (field) => (event) => {
  const { value } = event.target;
  setter((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const GenshinDamageCalculator = () => {
  const [attackInputs, setAttackInputs] = useState({
    characterBase: '800',
    weaponBase: '510',
    percentBonus: '0.46',
    artifactFlat: '311',
    otherFlat: '120',
  });

  // ① 快速彩色公式输入：默认给出一组常见面板，方便立即体验速算
  const [quickInputs, setQuickInputs] = useState({
    attack: '2100',
    multiplier: '2.4',
    bonus: '1.46',
    reaction: '1',
    crit: '0.6',        // crit
    critDamage: '0.6',
    defense: '0.67',
    resistance: '0.1',
  });

  const [skillInputs, setSkillInputs] = useState({
    multipliers: '2.4',
  });

  const [bonusInputs, setBonusInputs] = useState({
    weaponBonus: '0.2',
    artifactBonus: '0.46',
    talentBonus: '0.15',
    otherBonus: '0.1',
  });

  const [reactionInputs, setReactionInputs] = useState({
    type: 'amplifying',
    multiplier: '1.5',
    masteryBonus: '0',
    extraBonus: '0',
    level: '90',
  });

  const [critInputs, setCritInputs] = useState({
    ratePanel: '0.5',
    rateTalent: '0',
    rateOther: '0.05',
    damagePanel: '1',
    damageTalent: '0',
    damageOther: '0.2',
  });

  const [defenseInputs, setDefenseInputs] = useState({
    characterLevel: '90',
    enemyLevel: '90',
  });

  const [resistanceInputs, setResistanceInputs] = useState({
    resistance: '0.1',
  });

  const handleAttackChange = useObjectHandler(setAttackInputs);
  const handleSkillChange = useObjectHandler(setSkillInputs);
  const handleBonusChange = useObjectHandler(setBonusInputs);
  const handleReactionChange = useObjectHandler(setReactionInputs);
  const handleCritChange = useObjectHandler(setCritInputs);
  const handleDefenseChange = useObjectHandler(setDefenseInputs);
  const handleResistanceChange = useObjectHandler(setResistanceInputs);
  const handleQuickChange = useObjectHandler(setQuickInputs);

  // ② 将快速面板的字符串输入转换为数值，集中管理格式化后的因子
  const quickValues = useMemo(() => {
    const attack = Number(quickInputs.attack) || 0;
    const multiplier = Number(quickInputs.multiplier) || 0;
    const bonus = Number(quickInputs.bonus) || 0;
    const reaction = Number(quickInputs.reaction) || 0;
    const crit = Number(quickInputs.crit) || 0;     // crit
    const limitedCrit = Math.min(crit, 100);
    const critDamage = Number(quickInputs.critDamage) || 0;
    const defense = Number(quickInputs.defense) || 0;
    const resistance = Number(quickInputs.resistance) || 0;

    return {
      attack,
      multiplier,
      bonus,
      reaction,
      limitedCrit,      // crit
      critDamage,
      defense,
      resistance,
      critFactor: 1 + limitedCrit * critDamage,
      resistanceFactor: 1 - resistance,
    };
  }, [quickInputs]);

  // ③ 根据各彩色因子实时计算速算结果
  const quickDamage = useMemo(() => {
    return quickValues.attack
      * quickValues.multiplier
      * quickValues.bonus
      * quickValues.reaction
      * quickValues.critFactor
      * quickValues.defense
      * quickValues.resistanceFactor;
  }, [quickValues]);

  const finalAttack = useMemo(() => {
    const characterBase = Number(attackInputs.characterBase) || 0;
    const weaponBase = Number(attackInputs.weaponBase) || 0;
    const percentBonus = Number(attackInputs.percentBonus) || 0;
    const artifactFlat = Number(attackInputs.artifactFlat) || 0;
    const otherFlat = Number(attackInputs.otherFlat) || 0;

    return (characterBase + weaponBase) * (1 + percentBonus) + artifactFlat + otherFlat;
  }, [attackInputs]);

  const skillMultiplier = useMemo(() => {
    return parseMultiplierInput(skillInputs.multipliers);
  }, [skillInputs]);

  const totalBonusMultiplier = useMemo(() => {
    const weaponBonus = Number(bonusInputs.weaponBonus) || 0;
    const artifactBonus = Number(bonusInputs.artifactBonus) || 0;
    const talentBonus = Number(bonusInputs.talentBonus) || 0;
    const otherBonus = Number(bonusInputs.otherBonus) || 0;

    return 1 + weaponBonus + artifactBonus + talentBonus + otherBonus;
  }, [bonusInputs]);

  const elementalReactionBonus = useMemo(() => {
    const masteryBonus = Number(reactionInputs.masteryBonus) || 0;
    const extraBonus = Number(reactionInputs.extraBonus) || 0;

    return 1 + masteryBonus + extraBonus;
  }, [reactionInputs]);

  const reactionMultiplierValue = Number(reactionInputs.multiplier) || 0;
  const reactionZone = reactionInputs.type === 'amplifying'
    ? reactionMultiplierValue * elementalReactionBonus
    : 1;

  const characterLevel = Number(defenseInputs.characterLevel) || 0;
  const enemyLevel = Number(defenseInputs.enemyLevel) || 0;
  const defenseMultiplier = useMemo(() => {
    const numerator = characterLevel + 100;
    const denominator = characterLevel + enemyLevel + 200;
    if (denominator === 0) {
      return 0;
    }
    return numerator / denominator;
  }, [characterLevel, enemyLevel]);

  const effectiveResistance = useMemo(() => {
    const rawResistance = Number(resistanceInputs.resistance) || 0;

    if (rawResistance < 0) {
      return rawResistance / 2;
    }
    if (rawResistance <= 0.75) {
      return rawResistance;
    }
    return (rawResistance * 4) / (1 + rawResistance * 4);
  }, [resistanceInputs]);

  const resistanceMultiplier = 1 - effectiveResistance;

  const totalCritRateRaw = useMemo(() => {
    const ratePanel = Number(critInputs.ratePanel) || 0;
    const rateTalent = Number(critInputs.rateTalent) || 0;
    const rateOther = Number(critInputs.rateOther) || 0;
    return ratePanel + rateTalent + rateOther;
  }, [critInputs]);

  const totalCritDamage = useMemo(() => {
    const damagePanel = Number(critInputs.damagePanel) || 0;
    const damageTalent = Number(critInputs.damageTalent) || 0;
    const damageOther = Number(critInputs.damageOther) || 0;
    return damagePanel + damageTalent + damageOther;
  }, [critInputs]);

  const totalCritRate = clamp(totalCritRateRaw, 0, 1.0);

  const baseDamage = finalAttack * skillMultiplier * totalBonusMultiplier * defenseMultiplier * resistanceMultiplier;
  const damageWithReaction = baseDamage * reactionZone;

  const nonCritDamage = damageWithReaction;
  const critDamage = damageWithReaction * (1 + totalCritDamage);
  const expectedDamage = damageWithReaction * (1 + totalCritRate * totalCritDamage);

  const level = Number(reactionInputs.level);
  const levelCoefficient = levelCoefficients[level] ?? levelCoefficients[90];

  const amplifyingDamage = finalAttack
    * skillMultiplier
    * totalBonusMultiplier
    * (1 + totalCritDamage)
    * reactionMultiplierValue
    * elementalReactionBonus
    * defenseMultiplier
    * resistanceMultiplier;

  const transformativeDamage = levelCoefficient
    * reactionMultiplierValue
    * elementalReactionBonus
    * resistanceMultiplier;

  const aggravateDamage = (
    finalAttack * skillMultiplier
    + (levelCoefficient * reactionMultiplierValue * elementalReactionBonus)
  ) * (1 + totalCritDamage)
    * totalBonusMultiplier
    * defenseMultiplier
    * resistanceMultiplier;

  return (
    <div className="damage-page">
      <div className="damage-card">
        <header className="damage-header">
          <h1>Genshin Damage</h1>
          <p>输入各环节参数，彩色汉字对应公式分区，实时推算暴击与期望伤害。</p>
        </header>

        <section className="formula-display">
          <p className="formula-line">
            伤害
            <span className="formula-operator"> = </span>
            <span className="formula-term color-attack">攻击力</span>
            <span className="formula-operator"> × </span>
            <span className="formula-term color-multiplier">技能倍率</span>
            <span className="formula-operator"> × </span>
            <span className="formula-term color-bonus">增伤区</span>
            <span className="formula-operator"> × </span>
            <span className="formula-term color-reaction">反应区</span>
            <span className="formula-operator"> × </span>
            <span className="formula-term color-crit">（1 + 暴击率 × 暴伤）</span>
            <span className="formula-operator"> × </span>
            <span className="formula-term color-defense">防御区</span>
            <span className="formula-operator"> × </span>
            <span className="formula-term color-resistance">（1 - 抗性）</span>
          </p>
          <p className="formula-note">根据下方分区输入，即刻呈现公式的完整链路与拆解。</p>
        </section>

        <section className="quick-formula-card">
          <div className="quick-input-grid">
            <label>
              <span className="color-attack">攻击力</span>
              <input type="number" value={quickInputs.attack} onChange={handleQuickChange('attack')} />
            </label>
            <label>
              <span className="color-multiplier">技能倍率</span>
              <input type="number" step="0.01" value={quickInputs.multiplier} onChange={handleQuickChange('multiplier')} />
            </label>
            <label>
              <span className="color-bonus">增伤区</span>
              <input type="number" step="0.01" value={quickInputs.bonus} onChange={handleQuickChange('bonus')} />
            </label>
            <label>
              <span className="color-reaction">反应区</span>
              <input type="number" step="0.01" value={quickInputs.reaction} onChange={handleQuickChange('reaction')} />
            </label>
            <label>
              <span className="color-crit">暴击率</span>
              <input type="number" step="0.01" value={quickInputs.crit} onChange={handleQuickChange('crit')} />
              <small>输入暴击率系数，例如 0.6 = 60%</small>
            </label>
            <label>
              <span className="color-crit">暴伤</span>
              <input type="number" step="0.01" value={quickInputs.critDamage} onChange={handleQuickChange('critDamage')} />
              <small>输入暴击伤害系数，例如 0.6 = 60%</small>
            </label>
            <label>
              <span className="color-defense">防御区</span>
              <input type="number" step="0.01" value={quickInputs.defense} onChange={handleQuickChange('defense')} />
            </label>
            <label>
              <span className="color-resistance">敌人抗性</span>
              <input type="number" step="0.01" value={quickInputs.resistance} onChange={handleQuickChange('resistance')} />
              <small>输入最终抗性倍率，例如 0.1 = 10%</small>
            </label>
          </div>
          <div className="quick-formula-visual">
            <span className="quick-number color-attack">{formatNumber(quickValues.attack)}</span>
            <span className="formula-operator">×</span>
            <span className="quick-number color-multiplier">{formatNumber(quickValues.multiplier)}</span>
            <span className="formula-operator">×</span>
            <span className="quick-number color-bonus">{formatNumber(quickValues.bonus)}</span>
            <span className="formula-operator">×</span>
            <span className="quick-number color-reaction">{formatNumber(quickValues.reaction)}</span>
            <span className="formula-operator">×</span>
            <span className="quick-number color-crit">（1 + {formatNumber(quickValues.limitedCrit)}+ {formatNumber(quickValues.critDamage)}）</span>
            <span className="formula-operator">×</span> 
            <span className="quick-number color-defense">{formatNumber(quickValues.defense)}</span>
            <span className="formula-operator">×</span>
            <span className="quick-number color-resistance">（1 - {formatNumber(quickValues.resistance)}）</span>
          </div>
          <div className="quick-result">
            <span>最终伤害（期望）</span>
            <strong>{formatNumber(quickDamage)}</strong>
          </div>
        </section>

        <section className="result-panel">
          <div className="result-summary">
            <div>
              <span className="result-label">暴击时伤害</span>
              <strong className="result-value color-crit">{formatNumber(critDamage)}</strong>
            </div>
            <div>
              <span className="result-label">期望伤害</span>
              <strong className="result-value color-multiplier">{formatNumber(expectedDamage)}</strong>
            </div>
          </div>
          <div className="result-breakdown">
            <div>
              <span>非暴击伤害</span>
              <strong>{formatNumber(nonCritDamage)}</strong>
            </div>
            <div>
              <span>基础伤害（无反应）</span>
              <strong>{formatNumber(baseDamage)}</strong>
            </div>
            <div>
              <span>增幅反应区</span>
              <strong>{formatNumber(reactionZone)}</strong>
            </div>
            <div>
              <span>总攻击力</span>
              <strong>{formatNumber(finalAttack)}</strong>
            </div>
          </div>

          <div className="reaction-results">
            <h3 className="reaction-title">元素反应伤害</h3>
            <div className="result-breakdown">
              <div className={reactionInputs.type === 'amplifying' ? 'highlight-card' : undefined}>
                <span>增幅反应伤害</span>
                <strong>{formatNumber(amplifyingDamage)}</strong>
                <small>攻击力 × 技能倍率 × 增伤区 × （1 + 暴伤） × 反应倍率 × 元素反应加成 × 防御区 × （1 - 抗性）</small>
              </div>
              <div className={reactionInputs.type === 'transformative' ? 'highlight-card' : undefined}>
                <span>剧变/绽放伤害</span>
                <strong>{formatNumber(transformativeDamage)}</strong>
                <small>等级基础系数 × 反应倍率 × 元素反应加成 × （1 - 抗性）</small>
              </div>
              <div className={reactionInputs.type === 'aggravate' ? 'highlight-card' : undefined}>
                <span>激化反应伤害</span>
                <strong>{formatNumber(aggravateDamage)}</strong>
                <small>［攻击力 × 技能倍率 + （等级基础系数 × 反应倍率 × 元素反应加成）］ × （1 + 暴伤） × 增伤区 × 防御区 × （1 - 抗性）</small>
              </div>
            </div>
          </div>

          <p className="result-tip">实际伤害与理论值略有出入，因游戏内部存在小数截断与随机浮动。</p>
        </section>

        <section className="formula-sections">
          <div className="formula-section">
            <h2 className="section-title"><span className="color-attack">攻击力</span>计算</h2>
            <p className="section-formula">（角色基础攻击 + 武器基础攻击） × （1 + 武器、圣遗物、其他百分比攻击加成） + 圣遗物数值攻击 + 其他攻击加成 = 最终攻击力</p>
            <div className="section-grid">
              <label>
                <span>角色基础攻击</span>
                <input type="number" value={attackInputs.characterBase} onChange={handleAttackChange('characterBase')} />
              </label>
              <label>
                <span>武器基础攻击</span>
                <input type="number" value={attackInputs.weaponBase} onChange={handleAttackChange('weaponBase')} />
              </label>
              <label>
                <span>百分比攻击加成</span>
                <input type="number" step="0.01" value={attackInputs.percentBonus} onChange={handleAttackChange('percentBonus')} />
                <small>以小数输入，如 0.46 = 46%</small>
              </label>
              <label>
                <span>圣遗物数值攻击</span>
                <input type="number" value={attackInputs.artifactFlat} onChange={handleAttackChange('artifactFlat')} />
              </label>
              <label>
                <span>其他攻击加成</span>
                <input type="number" value={attackInputs.otherFlat} onChange={handleAttackChange('otherFlat')} />
              </label>
            </div>
            <div className="section-result">
              <span>最终攻击力</span>
              <strong>{formatNumber(finalAttack)}</strong>
            </div>
          </div>

          <div className="formula-section">
            <h2 className="section-title"><span className="color-multiplier">技能倍率</span>与<span className="color-bonus">增伤区</span></h2>
            <p className="section-formula">单段倍率直接代入，多段倍率需要相加。增伤区 = 1 + 武器增伤 + 圣遗物增伤 + 天赋增伤 + 其他增伤。</p>
            <div className="section-grid">
              <label className="full-width">
                <span>技能倍率（使用 +、空格或换行相加）</span>
                <textarea
                  rows={2}
                  value={skillInputs.multipliers}
                  onChange={handleSkillChange('multipliers')}
                  placeholder="例如：2.4 或 1.2 + 0.8 + 0.6"
                />
              </label>
              <label>
                <span>武器增伤</span>
                <input type="number" step="0.01" value={bonusInputs.weaponBonus} onChange={handleBonusChange('weaponBonus')} />
              </label>
              <label>
                <span>圣遗物增伤</span>
                <input type="number" step="0.01" value={bonusInputs.artifactBonus} onChange={handleBonusChange('artifactBonus')} />
              </label>
              <label>
                <span>天赋增伤</span>
                <input type="number" step="0.01" value={bonusInputs.talentBonus} onChange={handleBonusChange('talentBonus')} />
              </label>
              <label>
                <span>其他增伤</span>
                <input type="number" step="0.01" value={bonusInputs.otherBonus} onChange={handleBonusChange('otherBonus')} />
              </label>
            </div>
            <div className="section-result">
              <span>总技能倍率</span>
              <strong>{formatNumber(skillMultiplier)}</strong>
              <span>增伤区</span>
              <strong>{formatNumber(totalBonusMultiplier)}</strong>
            </div>
          </div>

          <div className="formula-section">
            <h2 className="section-title"><span className="color-reaction">元素反应</span>与<span className="color-crit">双暴</span></h2>
            <p className="section-formula">元素反应加成 = 1 + 精通提升 + 反应加成系数提升。角色面板双暴 + 天赋双暴 + 其他双暴加成 = 总双暴。</p>
            <div className="section-grid">
              <label>
                <span>反应类型</span>
                <select value={reactionInputs.type} onChange={handleReactionChange('type')}>
                  <option value="none">无反应</option>
                  <option value="amplifying">增幅反应（蒸发/融化）</option>
                  <option value="transformative">剧变/绽放</option>
                  <option value="aggravate">激化反应</option>
                </select>
              </label>
              <label>
                <span>反应倍率</span>
                <input type="number" step="0.01" value={reactionInputs.multiplier} onChange={handleReactionChange('multiplier')} />
              </label>
              <label>
                <span>精通提升</span>
                <input type="number" step="0.01" value={reactionInputs.masteryBonus} onChange={handleReactionChange('masteryBonus')} />
              </label>
              <label>
                <span>反应系数提升</span>
                <input type="number" step="0.01" value={reactionInputs.extraBonus} onChange={handleReactionChange('extraBonus')} />
              </label>
              <label>
                <span>等级基础系数</span>
                <select value={reactionInputs.level} onChange={handleReactionChange('level')}>
                  <option value="80">80 级 — 1077</option>
                  <option value="90">90 级 — 1447</option>
                </select>
              </label>
              <label>
                <span>面板暴击率</span>
                <input type="number" step="0.01" value={critInputs.ratePanel} onChange={handleCritChange('ratePanel')} />
                <small>请以小数填写，例如 0.5 = 50%</small>
              </label>
              <label>
                <span>天赋暴击率</span>
                <input type="number" step="0.01" value={critInputs.rateTalent} onChange={handleCritChange('rateTalent')} />
              </label>
              <label>
                <span>其他暴击率</span>
                <input type="number" step="0.01" value={critInputs.rateOther} onChange={handleCritChange('rateOther')} />
              </label>
              <label>
                <span>面板暴伤</span>
                <input type="number" step="0.01" value={critInputs.damagePanel} onChange={handleCritChange('damagePanel')} />
              </label>
              <label>
                <span>天赋暴伤</span>
                <input type="number" step="0.01" value={critInputs.damageTalent} onChange={handleCritChange('damageTalent')} />
              </label>
              <label>
                <span>其他暴伤</span>
                <input type="number" step="0.01" value={critInputs.damageOther} onChange={handleCritChange('damageOther')} />
              </label>
            </div>
            <div className="section-result">
              <span>元素反应加成</span>
              <strong>{formatNumber(elementalReactionBonus)}</strong>
              <span>总暴击率</span>
              <strong>{formatNumber(totalCritRateRaw)}</strong>
              <span>总暴伤</span>
              <strong>{formatNumber(totalCritDamage)}</strong>
            </div>
          </div>

          <div className="formula-section">
            <h2 className="section-title"><span className="color-defense">防御区</span>与<span className="color-resistance">抗性区</span></h2>
            <p className="section-formula">防御承伤 = （角色等级 + 100） ÷ （角色等级 + 怪物等级 + 200）。若敌人抗性 &lt; 0，取 抗性 ÷ 2；0 ≤ 抗性 ≤ 75% 时直接代入；若抗性 &gt; 75%，则用 抗性 × 4 ÷ （1 + 抗性 × 4）。</p>
            <div className="section-grid">
              <label>
                <span>角色等级</span>
                <input type="number" value={defenseInputs.characterLevel} onChange={handleDefenseChange('characterLevel')} />
              </label>
              <label>
                <span>怪物等级</span>
                <input type="number" value={defenseInputs.enemyLevel} onChange={handleDefenseChange('enemyLevel')} />
              </label>
              <label>
                <span>敌人抗性</span>
                <input type="number" step="0.01" value={resistanceInputs.resistance} onChange={handleResistanceChange('resistance')} />
                <small>输入小数，如 0.1 = 10%</small>
              </label>
            </div>
            <div className="section-result">
              <span>防御区</span>
              <strong>{formatNumber(defenseMultiplier)}</strong>
              <span>有效抗性</span>
              <strong>{formatNumber(effectiveResistance)}</strong>
              <span>（1 - 抗性）</span>
              <strong>{formatNumber(resistanceMultiplier)}</strong>
            </div>
          </div>
        </section>

        
      </div>
    </div>
  );
};

export default GenshinDamageCalculator;