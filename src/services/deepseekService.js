const openai = require('../config');

async function analyzeHealthReport(userData, indicators) {
  const prompt = `
    你是一位专业营养师。分析以下体检报告指标和用户数据，识别哪些指标偏高或偏低，并提供结构化的饮食建议。考虑用户的年龄、性别、体重和身高，提供个性化建议。
    用户数据：${JSON.stringify(userData)}
    指标：${JSON.stringify(indicators)}
    输出格式：{
      "指标分析": [
        {"指标": "", "状态": "", "说明": ""}
      ],
      "饮食建议": "",
      "营养重点": [],
      "忌口建议": []
    }
    确保建议安全、实用，适合中老年用户。避免推荐可能引发过敏或与常见药物相互作用的食物。
  `;

  const response = await openai.chat.completions.create({
    model: 'deepseek-reasoner',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { analyzeHealthReport };
