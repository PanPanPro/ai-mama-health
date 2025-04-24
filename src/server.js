const express = require('express');
const { analyzeHealthReport } = require('./services/deepseekService');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/analyze-report', async (req, res) => {
  try {
    const { age, gender, weight, height, indicators = [] } = req.body;
    const userData = { age, gender, weight, height };
    // Ensure indicators is an array, even if empty
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
