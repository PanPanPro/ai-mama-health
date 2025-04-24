const express = require('express');
const { analyzeHealthReport } = require('./services/deepseekService');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/analyze-report', async (req, res) => {
  try {
    const { age, gender, weight, height } = req.body;
    const userData = { age, gender, weight, height };

    // Temporary hardcoded indicators for testing (replace with OCR in the future)
    const indicators = [
      {"指标": "甘油三酯", "值": 1.55, "单位": "mmol/L", "参考范围": "0.33 - 1.70"},
      {"指标": "总胆固醇", "值": 5.53, "单位": "mmol/L", "参考范围": "2.30 - 5.70"},
      {"指标": "高密度脂蛋白胆固醇", "值": 1.51, "单位": "mmol/L", "参考范围": "0.92 - 1.84"},
      {"指标": "低密度脂蛋白胆固醇", "值": 3.25, "单位": "mmol/L", "参考范围": "0.00 - 3.50"},
      {"指标": "谷丙转氨酶", "值": 31, "单位": "U/L", "参考范围": "0 - 40"},
      {"指标": "谷草转氨酶", "值": 34, "单位": "U/L", "参考范围": "0 - 40"},
      {"指标": "总胆红素", "值": 6.80, "单位": "μmol/L", "参考范围": "3.40 - 20.50"},
      {"指标": "直接胆红素", "值": 4.69, "单位": "μmol/L", "参考范围": "0.00 - 6.80"},
      {"指标": "总蛋白", "值": 75, "单位": "g/L", "参考范围": "60 - 83"},
      {"指标": "γ-谷氨酰转肽酶", "值": 129, "单位": "U/L", "参考范围": "0 - 50"},
      {"指标": "白蛋白", "值": 37.9, "单位": "g/L", "参考范围": "35.0 - 55.0"},
      {"指标": "碱性磷酸酶", "值": 47, "单位": "U/L", "参考范围": "0 - 110"},
      {"指标": "尿素", "值": 4.79, "单位": "mmol/L", "参考范围": "1.70 - 8.30"},
      {"指标": "尿酸", "值": 369, "单位": "μmol/L", "参考范围": "60 - 417"},
      {"指标": "肌酐", "值": 72, "单位": "μmol/L", "参考范围": "35 - 115"},
      {"指标": "肌酸激酶", "值": 66, "单位": "U/L", "参考范围": "24 - 194"},
      {"指标": "肌酸激酶同工酶", "值": 6.0, "单位": "U/L", "参考范围": "0.0 - 25.0"},
      {"指标": "类风湿因子", "值": 3, "单位": "IU/mL", "参考范围": "0 - 30"},
      {"指标": "钙", "值": 2.44, "单位": "mmol/L", "参考范围": "2.10 - 2.60"},
      {"指标": "铁", "值": 25.62, "单位": "μmol/L", "参考范围": "10.80 - 29.66"}
    ];

    const result = await analyzeHealthReport(userData, indicators);
    if (result.error) {
      return res.json({ status: false, message: result.error });
    }
    res.json({ status: true, data: result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
