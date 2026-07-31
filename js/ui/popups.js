// ───────────────────────────────────────────────
//  Попапы — победа/провал уровня, кампания пройдена
//  Эпик: O (tasks.md) · Фаза 1
//  Зависит от: config.js, core/run.js
//  Заменяет: js/ui.js (showDiveEnd/showLevelClear/showRunWin/showRunOver)
// ───────────────────────────────────────────────
const ovl = $('ovl');

function show(html){ ovl.innerHTML = `<div class="ovl"><div class="card">${html}</div></div>`; }
function hide(){ ovl.innerHTML = ''; }

// Провал уровня (ловушка ИЛИ комнаты кончились без квоты) — вся гробница перегенерируется,
// прогресс кампании не трогается (см. tasks.md, раздел 0)
function showLevelFail(reason){
  const title = reason === 'trap' ? '💀 Ловушка' : '💀 Не хватило золота';
  const detail = reason === 'trap'
    ? 'Весь прогресс уровня сгорел.'
    : `Комнаты кончились: собрано ${R.gold} из ${R.quota} 🪙.`;
  show(`<h2>${title}</h2>
     <p>${detail} Уровень начнётся заново — новая гробница с первой комнаты.</p>
     <button class="btn btn-go" id="retry">Попробовать снова</button>
     <button class="btn btn-ghost" id="toMap">К уровням</button>`);
  $('retry').onclick = () => { hide(); startLevel(R.level); };
  $('toMap').onclick = () => { hide(); gotoMap(); };
}

// Победа уровня — переход к следующему
function showLevelWin(n){
  show(`<h2>✨ Уровень ${n + 1} пройден</h2>
    <div class="big ok">${R.gold} / ${R.quota} 🪙</div>
    <p>Гробница пройдена. Дальше сложнее.</p>
    <button class="btn btn-go" id="next">Уровень ${n + 2} →</button>
    <button class="btn btn-ghost" id="toMap">К уровням</button>`);
  $('next').onclick = () => { hide(); startLevel(n + 1); };
  $('toMap').onclick = () => { hide(); gotoMap(); };
}

// Кампания пройдена — все LEVELS_COUNT уровней (интерим до Эпика L / 100 уровней)
function showCampaignWin(){
  show(`<h2>🏆 Кампания пройдена!</h2>
    <div class="big ok">${LEVELS_COUNT} / ${LEVELS_COUNT}</div>
    <p>Все гробницы раскопаны.</p>
    <button class="btn btn-go" id="again">Сыграть заново</button>
    <button class="btn btn-ghost" id="toMap">К уровням</button>`);
  $('again').onclick = () => { hide(); resetProgress(); startLevel(0); showScreen('game'); };
  $('toMap').onclick = () => { hide(); gotoMap(); };
}
