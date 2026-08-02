// ───────────────────────────────────────────────
//  Роутинг между экранами (правила / карта кампании / игра)
//  Фаза 1 · Фаза 5 — карта кампании вынесена в ui/campaign-map.js (buildMap())
//  Зависит от: config.js, ui/campaign-map.js
//  Заменяет: js/nav.js (showScreen/buildMap/gotoMap/initNav)
// ───────────────────────────────────────────────

// Показать одну страницу (section.screen), спрятать остальные
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
}

// Перейти на карту кампании, перестроив её под актуальный прогресс (buildMap — см.
// ui/campaign-map.js)
function gotoMap(){
  buildMap();
  showScreen('levels');
}

// Привязка кнопок переходов (элементы статичны в index.html)
function initNav(){
  $('toLevels').onclick  = gotoMap;                       // стр.1 → карта
  $('toRules').onclick   = () => showScreen('rules');     // карта → стр.1
  $('toLevels2').onclick = gotoMap;                       // игра → карта
  buildMap();
  showScreen('rules');
}
