// Heatmap oluşturma ve tooltip/event fonksiyonları
(function() {
  if (typeof dailyLabels === 'undefined' || !Array.isArray(dailyLabels) || dailyLabels.length === 0) return;
  const heatmapDiv = document.getElementById('heatmap');
  if (!heatmapDiv) return;

  // Tooltip div'i oluştur veya bul
  let tooltip = document.querySelector('.heatmap-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'heatmap-tooltip';
    tooltip.style.zIndex = '99999';
    document.body.appendChild(tooltip);
  }
  // Mobilde stilleri güncelle
  function updateTooltipStyle() {
    if (window.innerWidth < 700) {
      tooltip.style.maxWidth = '95vw';
      tooltip.style.fontSize = '0.98rem';
      tooltip.style.padding = '10px 8px';
      tooltip.style.overflowY = 'auto';
    } else {
      tooltip.style.maxWidth = '340px';
      tooltip.style.fontSize = '';
      tooltip.style.padding = '';
      tooltip.style.overflowY = '';
    }
  }
  window.addEventListener('resize', updateTooltipStyle);
  updateTooltipStyle();

  // Renk geçiş fonksiyonu
  function lerpColor(a, b, t) {
    const ah = a.replace('#',''), bh = b.replace('#','');
    const ar = parseInt(ah.substring(0,2),16), ag = parseInt(ah.substring(2,4),16), ab = parseInt(ah.substring(4,6),16);
    const br = parseInt(bh.substring(0,2),16), bg = parseInt(bh.substring(2,4),16), bb = parseInt(bh.substring(4,6),16);
    const rr = Math.round(ar + (br-ar)*t), rg = Math.round(ag + (bg-ag)*t), rb = Math.round(ab + (bb-ab)*t);
    return `rgb(${rr},${rg},${rb})`;
  }

  // Eski hücreleri temizle
  heatmapDiv.innerHTML = '';

  // Min/max değerleri bul
  const min = Math.min(...dailyData), max = Math.max(...dailyData);
  const colorA = '#ede7ff', colorB = '#6c63ff';

  // Tooltip kontrolü için değişkenler
  let tooltipActiveCell = null;
  let closeOnTouchHandler = null;

  dailyLabels.forEach((date, i) => {
    const val = dailyData[i];
    const t = max === min ? 1 : (val-min)/(max-min);
    const color = lerpColor(colorA, colorB, t);
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    cell.style.background = color;
    // O güne ait harcamaları bul
    const dayTxs = transactions.filter(t => t.date === date && parseFloat(t.amount) < 0);
    let label = `<b>${date}</b><br>Toplam: <b>${val.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2})} TL</b>`;
    if (dayTxs.length > 0) {
      label += '<br>' + dayTxs.map(tx => `<span class='heatmap-type'>${tx.type}:</span> <i>${tx.description}</i> <b>(${parseFloat(tx.amount).toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2})} TL)</b>`).join('<br>');
    }
    function showTooltip(e) {
      if (tooltipActiveCell === cell) return; // Zaten açık
      hideTooltip(); // Başka bir hücrede tooltip açıksa önce kapat
      tooltip.innerHTML = label;
      tooltip.style.display = 'block';
      updateTooltipStyle();
      // Konumlandırma: tam dokunulan/tıklanan noktada aç
      const minMargin = 8;
      let x = 0, y = 0;
      if (e && e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if (e && typeof e.clientX === 'number') {
        x = e.clientX;
        y = e.clientY;
      } else {
        // fallback: kutucuğun ortası
        const rect = cell.getBoundingClientRect();
        x = rect.left + rect.width/2;
        y = rect.top + rect.height/2;
      }
      // Tooltip'in sol üst köşesini (x, y)'ye hizala
      let left = x;
      let top = y;
      // Sağa/sola/yukarı/aşağı taşmayı engelle
      if (left + tooltip.offsetWidth > window.innerWidth - minMargin) left = window.innerWidth - tooltip.offsetWidth - minMargin;
      if (left < minMargin) left = minMargin;
      if (top + tooltip.offsetHeight > window.innerHeight - minMargin) top = window.innerHeight - tooltip.offsetHeight - minMargin;
      if (top < minMargin) top = minMargin;
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
      setTimeout(function() { tooltip.style.opacity = 0.98; }, 10);
      tooltipActiveCell = cell;
      // Sadece mobilde: dışarıya dokununca kapansın
      if ('ontouchstart' in window) {
        if (closeOnTouchHandler) {
          document.removeEventListener('touchstart', closeOnTouchHandler);
        }
        closeOnTouchHandler = function(e2) {
          if (!cell.contains(e2.target) && !tooltip.contains(e2.target)) {
            hideTooltip();
          }
        };
        setTimeout(function() { document.addEventListener('touchstart', closeOnTouchHandler); }, 10);
      }
    }
    function hideTooltip() {
      tooltip.style.display = 'none';
      tooltip.style.opacity = 0;
      tooltipActiveCell = null;
      if (closeOnTouchHandler) {
        document.removeEventListener('touchstart', closeOnTouchHandler);
        closeOnTouchHandler = null;
      }
    }
    cell.addEventListener('mouseenter', showTooltip);
    cell.addEventListener('mouseleave', hideTooltip);
    // Mobil için dokunma desteği
    cell.addEventListener('touchstart', function(e) {
      e.preventDefault();
      showTooltip(e);
    });
    heatmapDiv.appendChild(cell);
  });
})(); 