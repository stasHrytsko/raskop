// ───────────────────────────────────────────────
//  Попапы — победа/провал уровня, кампания пройдена, выбор артефакта
//  Эпик: O (tasks.md) · Фаза 1 · Эпик H (Фаза 3) — showArtifactPick
//  Зависит от: config.js, core/run.js, core/wallet.js, content/artifacts-permanent.js
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

// Победа уровня — переход к следующему (onNext может завернуть в showArtifactPick, см. core/run.js: win())
function showLevelWin(n, award, onNext){
  const bonus = award.firstClear ? '' : ' <small>(повтор ×' + REPLAY_GOLD_RATIO + ')</small>';
  show(`<h2>✨ Уровень ${n + 1} пройден</h2>
    <div class="big ok">${R.gold} / ${R.quota} 🪙</div>
    <p>Гробница пройдена. +${award.amount} 🪙 в кошелёк${bonus}. Дальше сложнее.</p>
    <button class="btn btn-go" id="next">Уровень ${n + 2} →</button>
    <button class="btn btn-ghost" id="toMap">К уровням</button>`);
  $('next').onclick = () => { hide(); onNext(); };
  $('toMap').onclick = () => { hide(); gotoMap(); };
}

// Кампания пройдена — все LEVELS_COUNT уровней (интерим до Эпика L / 100 уровней)
function showCampaignWin(award){
  show(`<h2>🏆 Кампания пройдена!</h2>
    <div class="big ok">${LEVELS_COUNT} / ${LEVELS_COUNT}</div>
    <p>Все гробницы раскопаны. +${award.amount} 🪙 в кошелёк. Всего в кошельке: ${wallet.gold} 🪙.</p>
    <button class="btn btn-go" id="again">Сыграть заново</button>
    <button class="btn btn-ghost" id="toMap">К уровням</button>`);
  $('again').onclick = () => { hide(); resetProgress(); startLevel(0); showScreen('game'); };
  $('toMap').onclick = () => { hide(); gotoMap(); };
}

// Выбор первого бесплатного постоянного артефакта — один раз, после уровня 3 (Эпик H)
function showArtifactPick(onDone){
  const cards = ARTIFACTS_PERMANENT.map(a => `
    <button class="artifact-pick" data-id="${a.id}">
      <b>${a.icon} ${a.name}</b><br><small>${a.desc}</small>
    </button>`).join('');
  show(`<h2>🎁 Выбери артефакт</h2>
    <p>Один бесплатный артефакт — остаётся с тобой навсегда.</p>
    ${cards}`);
  ovl.querySelectorAll('.artifact-pick').forEach(btn => {
    btn.onclick = () => { wallet.artifact = btn.dataset.id; saveWallet(); hide(); onDone(); };
  });
}
