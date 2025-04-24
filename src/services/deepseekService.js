const openai = require('../config');

async function analyzeHealthReport(userData, indicators) {
  const prompt = `
    你是一位专业营养师。分析以下体检报告指标和用户数据，识别哪些指标偏高或偏低，并提供结构化的饮食建议。用户数据：${JSON.stringify(userData)}，指标：${JSON.stringify(indicators)}。

    任务：
    1. 对于每个指标，比较其“值”与“参考范围”，判断指标是“偏高”、“偏低”还是“正常”。
       - “参考范围”格式为“最小值 - 最大值”（例如 "0 - 50"）。
       - 如果“值”小于最小值，则为“偏低”；如果大于最大值，则为“偏高”；否则为“正常”。
    2. 根据分析结果，提供个性化的饮食建议，考虑用户的年龄、性别、体重和身高。
    3. 确保建议安全、实用，适合中老年用户，避免推荐可能引发过敏或与常见药物相互作用的食物。

    输出格式：
    {
      "指标分析": [
        {"指标": "", "状态": "偏高/偏低/正常", "说明": "描述指标的意义及影响"}
      ],
      "饮食建议": "针对指标分析的饮食建议，100字以内",
      "营养重点": ["营养建议1", "营养建议2", ...],
      "忌口建议": ["忌口建议1", "忌口建议2", ...]
    }

    如果无法分析，请返回JSON格式的错误信息，例如：{"error": "无法分析，请提供清晰的指标数据"}。
  `;

  const response = await openai.chat.completions.create({
    model: 'deepseek-reasoner',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
  });

  let content = response.choices[0].message.content;
  // Remove Markdown code blocks and backticks
  content = content.replace(/```json\n?|\n?```|`/g, '').trim();

  // Try to parse as JSON
  try {
    return JSON.parse(content);
  } catch (error) {
    return { error: `无法解析响应: ${content}` };
  }
}

module.exports = { analyzeHealthReport };
