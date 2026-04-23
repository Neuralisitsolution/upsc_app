const pdfParse = require('pdf-parse');
const fs = require('fs');

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return {
    text: data.text,
    pages: data.numpages,
    info: data.info
  };
}

module.exports = { extractTextFromPDF };
