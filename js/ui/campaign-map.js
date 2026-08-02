// ───────────────────────────────────────────────
//  Экран «Карта кампании» — 100 уровней, тиры, боссы
//  Эпик: L (tasks.md) · Фаза 5
//  Зависит от: config.js, content/campaign.js, core/run.js, core/wallet.js,
//  content/artifacts-permanent.js
//  Заменяет: buildMap() из старого js/ui/nav.js (сетка 3×3 на 9 уровней)
// ───────────────────────────────────────────────
//
// Кампания линейна (нет свободного выбора уровня, tasks.md раздел 4) — прогресс
// строго последователен, поэтому тир целиком ПОЗАДИ progress.current гарантированно
// пройден целиком, а тир ВПЕРЕДИ ещё не начат. Это даёт готовое решение сразу для
// обоих mobile-first требований Эпика L без отдельной логики скролла к текущему
// уровню: тир с progress.current — единственный, что разворачивается в сетку тайлов
// (как раньше 3×3, но по границам тира); тиры позади/впереди — однострочные
// компактные сводки («✓ …» / «🔒 …»). #levels — сама прокручиваемая область (см.
// css/styles.css), header/легенда/кнопки карты вне её остаются на месте.

function buildMap(){
  $('record').textContent = progress.cleared > 0
    ? `Пройдено уровней: ${progress.cleared} / ${LEVELS_COUNT}`
    : 'Прогресс: пока нет';
  const artifactDef = wallet.artifact && ARTIFACTS_PERMANENT.find(a => a.id === wallet.artifact);
  $('walletLine').textContent = `Кошелёк: ${wallet.gold} 🪙`
    + (artifactDef ? ` · ${artifactDef.icon} ${artifactDef.name}` : '');

  const wrap = $('levels');
  wrap.innerHTML = '';
  CAMPAIGN_TIERS.forEach(tier => {
    if(tier.to < progress.current){
      wrap.appendChild(tierRow('done', `✓ ${tier.label} · ${tier.from + 1}–${tier.to + 1}`));
    } else if(tier.from > progress.current){
      wrap.appendChild(tierRow('lock', `🔒 ${tier.label} · ${tier.from + 1}–${tier.to + 1}`));
    } else {
      const head = document.createElement('div');
      head.className = 'tier-head';
      head.textContent = `${tier.label} · ${tier.from + 1}–${tier.to + 1}`;
      wrap.appendChild(head);
      wrap.appendChild(tierGrid(tier));
    }
  });

  const act = $('mapActions');
  const hasProgress = R || progress.current > 0 || progress.cleared > 0;
  if(hasProgress){
    const n = (R ? R.level : progress.current) + 1;
    act.innerHTML =
      `<button class="btn btn-go" id="resume">Продолжить · уровень ${n}</button>
       <button class="btn btn-ghost" id="restart">Начать заново</button>`;
    $('resume').onclick = () => {
      if(!R) startLevel(progress.current);
      showScreen('game');
    };
    $('restart').onclick = () => { resetProgress(); startLevel(0); showScreen('game'); };
  } else {
    act.innerHTML = `<button class="btn btn-go" id="startRun">Начать</button>`;
    $('startRun').onclick = () => { startLevel(0); showScreen('game'); };
  }
}

// Компактная строка полностью пройденного/ещё не начатого тира
function tierRow(state, text){
  const d = document.createElement('div');
  d.className = 'tier-row ' + state;
  d.textContent = text;
  return d;
}

// Развёрнутая сетка тайлов активного тира (тот же .lv, что и раньше в сетке 3×3)
function tierGrid(tier){
  const grid = document.createElement('div');
  grid.className = 'levels-grid';
  for(let i = tier.from; i <= tier.to; i++){
    const state = i < progress.cleared ? 'done' : (i === progress.current ? 'current' : 'lock');
    const d = document.createElement('div');
    d.className = 'lv ' + tier.cls + ' ' + state + (CAMPAIGN[i].isBoss ? ' boss' : '');
    d.textContent = state === 'done' ? '✓' : (i + 1);
    grid.appendChild(d);
  }
  return grid;
}
