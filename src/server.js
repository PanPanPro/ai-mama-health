const express = require('express');
const multer = require('multer');
const { analyzeHealthReport } = require('./services/deepseekService');
const Tesseract = require('tesseract.js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/analyze-report', upload.single('reportImage'), async (req, res) => {
  try {
    const { age, gender, weight, height } = req.body;
    const userData = { age, gender, weight, height };

    let indicators = [];

    if (req.file) {
      // Extract text from the image using Tesseract.js
      const { data: { text } } = await Tesseract.recognize(
        req.file.buffer,
        'chi_sim', // Use Chinese Simplified for OCR
        { logger: m => console.log(m) }
      );

      // Parse the extracted text into structured indicators
      indicators = parseTextToIndicators(text);
    } else {
      return res.json({ status: false, message: '请上传体检报告图片' });
    }

    const result = await analyzeHealthReport(userData, indicators);
    if (result.error) {
      return res.json({ status: false, message: result.error });
    }
    res.json({ status: true, data: result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Function to parse extracted text into structured indicators
function parseTextToIndicators(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const indicators = [];

  // Simple parsing logic: Look for lines with indicator, value, unit, and reference range
  const indicatorRegex = /^([^\s]+)\s+([^\s]+)\s+(\d+\.?\d*)\s+([^\s]+)\s+(\d+\.?\d*\s*-\s*\d+\.?\d*)$/;
  
  for (const line of lines) {
    const match = line.match(indicatorRegex);
    if (match) {
      const [, shortName, name, value, unit, referenceRange] = match;
      indicators.push({
        指标: name,
        值: parseFloat(value),
        单位: unit,
        参考范围: referenceRange
      });
    }
  }

  if (indicators.length === 0) {
    throw new Error('无法从图片中提取指标数据，请确保图片清晰且包含指标信息');
  }

  return indicators;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
