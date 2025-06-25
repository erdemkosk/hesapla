// PDF parse yardımcı fonksiyonları burada kalacak. Web sunucusu app.js dosyasında olacak.

const fs = require('fs');
const pdf = require('pdf-parse');

async function parseTransactionsFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return parseTransactions(data.text);
}

function parseTransactions(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const transactions = [];
  let buffer = [];

  const isNewLineStart = (line) => /^\d{2}\.\d{2}\.\d{4}/.test(line);
  const typeList = [
    "Giden Transfer",
    "Gelen Transfer",
    "Altın Alış/Satış",
    "Vergi Kesintisi",
    "İptal/İade",
    "Encard Harcaması",
    "Ödeme",
    "Diğer"
  ];

  for (let line of lines) {
    if (isNewLineStart(line)) {
      if (buffer.length) transactions.push([...buffer]);
      buffer = [line];
    } else if (buffer.length) {
      buffer.push(line);
    }
  }
  if (buffer.length) transactions.push([...buffer]);

  const parsed = [];
  for (let entry of transactions) {
    let fullLine = entry.join(' ').replace(/\s+/g, ' ').trim();
    fullLine = fullLine.replace(/\d+\/\d+Sayfa.*?Enpara\.com bir QNB markasıdır\./g, '');
    fullLine = fullLine.replace(/QNB Bank A\.Ş\..*?TarihHareket tipiAçıklamaİşlem TutarıBakiye/g, '');
    fullLine = fullLine.replace(/Ad soyad.*?Seri\/Sıra No:.*?Bakiye/g, '');
    const tlMatches = [...fullLine.matchAll(/-?\d{1,3}(?:\.\d{3})*,\d{2} TL/g)];
    if (tlMatches.length >= 2) {
      const balanceMatch = tlMatches[tlMatches.length - 1];
      const amountMatch = tlMatches[tlMatches.length - 2];
      const balance = balanceMatch[0];
      const amount = amountMatch[0];
      const before = fullLine.slice(0, amountMatch.index).trim();
      const dateMatch = before.match(/^(\d{2}\.\d{2}\.\d{4})\s*(.*)$/);
      if (dateMatch) {
        const date = dateMatch[1];
        let rest = dateMatch[2].trim();
        let type = '';
        let description = '';
        for (const t of typeList) {
          if (rest.startsWith(t)) {
            type = t;
            description = rest.slice(t.length).trim();
            break;
          }
        }
        if (!type) {
          const firstWord = rest.split(' ')[0];
          type = firstWord;
          description = rest.slice(firstWord.length).trim();
        }
        // Filtre: Birikim hesabı transferlerini ignore et
        const descLower = description.toLowerCase();
        if ((type === 'Gelen Transfer' && descLower.includes('birikim hesabımdan')) ||
            (type === 'Giden Transfer' && descLower.includes('birikim hesabıma'))) {
          continue;
        }
        // Diğer ve Encard Harcaması -> Kart Harcaması olarak değiştir
        if (type === 'Diğer' || type === 'Encard Harcaması') {
          type = 'Kart Harcaması';
        }
        parsed.push({
          date,
          type,
          description,
          amount: amount.replace(/\./g, '').replace(',', '.').replace(' TL', ''),
        });
      }
    }
  }
  return parsed;
}

module.exports = { parseTransactionsFromPdf };