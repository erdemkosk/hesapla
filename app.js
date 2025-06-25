const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseTransactionsFromPdf } = require('./index');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  try {
    const transactions = await parseTransactionsFromPdf(req.file.path);
    fs.unlinkSync(req.file.path); 
    res.render('table', { transactions });
  } catch (err) {
    res.status(500).send('Error parsing PDF: ' + err.message);
  }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
}); 