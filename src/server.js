const express = require('express');
const multer = require('multer');
const { analyzeHealthReport } = require('./services/deepseekService');
const Tesseract = require('tesseract.js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/analyze-report', upload.single('reportImage'), async (req, res) => {
  try {
    const { age, gender, weight, height } = req.body;
    const userData = { age, gender, weight, height };

    let indicators = [];

    if (!req.file) {
      return res.json({ status: false, message: '请上传体检报告图片' });
    }

    console.log('Starting OCR extraction...');
    const { data: { text } } = await Tesseract.recognize(
      req.file.buffer,
      'chi_sim',
      { logger: m => console.log(m) } // Let Tesseract.js handle resource paths automatically
    );
    console.log('Extracted text:', text);

    try {
      indicators = parseTextToIndicators(text);
      console.log('Parsed indicators:', indicators);
    } catch (error) {
      console.error('Parsing error:', error.message);
      return res.json({ status: false, message: `无法解析图片中的指标数据: ${error.message}` });
    }

    if (indicators.length === 0) {
      return res.json({ status: false, message: '图片中未检测到有效的指标数据，请确保图片清晰且包含指标信息' });
    }

    const result = await analyzeHealthReport(userData, indicators);
    if (result.error) {
      return res.json({ status: false, message: result.error });
    }
    res.json({ status: true, data: result });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ status: false, message: error.message });
  }
});

function parseTextToIndicators(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const indicators = [];

  const indicatorRegex = /^([A-Z]+)\s+(.+?)\s+(\d+\.?\d*)\s+([^\s]+)\s+([\d.]+)\s*[-–]\s*([\d.]+)/;

  console.log('Parsing lines:', lines);

  for (const line of lines) {
    console.log('Processing line:', line);
    const match = line.match(indicatorRegex);
    if (match) {
      const [, shortName, name, value, unit, refMin, refMax] = match;
      const cleanedName = name.trim();
      const referenceRange = `${parseFloat(refMin)} - ${parseFloat(refMax)}`;
      const indicator = {
        指标: cleanedName,
        值: parseFloat(value),
        单位: unit,
        参考范围: referenceRange
      };
      indicators.push(indicator);
      console.log('Matched indicator:', indicator);
    }
  }

  if (indicators.length === 0) {
    throw new Error('无法从图片中提取指标数据，请检查图片格式');
  }

  return indicators;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
