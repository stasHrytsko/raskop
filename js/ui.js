// ───────────────────────────────────────────────
//  Попапы и оверлеи
// ───────────────────────────────────────────────
const ovl = $('ovl');

function show(html){ ovl.innerHTML = `<div class="ovl"><div class="card">${html}</div></div>`; }
function hide(){ ovl.innerHTML = ''; }

// Стартовый экран с правилами
function showIntro(){
  show(`<div class="subtitle">прототип</div>
    <div class="title">РАСКОП</div>
    <div class="rules">
      <div><span class="i">👆</span><span>Вскрывай клетки. Цифра — сколько ловушек вокруг.</span></div>
      <div><span class="i">💰</span><span>Монеты падают в рюкзак. Наступил на ловушку 💀 — рюкзак сгорает.</span></div>
      <div><span class="i">🔥</span><span>Чем дольше копаешь за заход, тем выше множитель: 5 клеток — ×2, 8 — ×3.</span></div>
      <div><span class="i">🚪</span><span>«Уйти» можно в любой момент — добыча сохраняется. Собери цель уровня за 3 захода.</span></div>
    </div>
    <button class="btn btn-go" id="go">Копать</button>`);
  $('go').onclick = () => { hide(); };
}

// Конец захода (смерть или добровольный выход), но уровень ещё не закрыт
function showDiveEnd(died, gain){
  const left = S.quota - S.prog;
  show(died
    ? `<h2>💀 Ловушка!</h2>
       <div class="big bad">−${S.pack}</div>
       <p>Рюкзак сгорел. До цели ещё <b>${left} 💰</b>, осталось заходов: <b>${S.dives}</b>.</p>
       <button class="btn btn-go" id="go">Новый заход</button>`
    : `<h2>Ушёл вовремя</h2>
       <div class="big ok">+${gain}</div>
       <p>До цели ещё <b>${left} 💰</b>, осталось заходов: <b>${S.dives}</b>.</p>
       <button class="btn btn-go" id="go">Новый заход</button>`);
  $('go').onclick = () => { hide(); nextDive(); };
}

// Уровень пройден
function showLevelUp(){
  const surplus = S.prog - S.quota;
  show(`<h2>✨ Уровень пройден</h2>
    <div class="big ok">${S.prog} / ${S.quota}</div>
    <p>${surplus > 0 ? `Излишек <b>+${surplus} 💰</b> переходит дальше.` : 'Ровно по плану.'}</p>
    <button class="btn btn-go" id="go">Уровень ${S.level + 1} →</button>`);
  $('go').onclick = () => {
    hide();
    S.level++;
    S.quota = QUOTA0 + QUOTA_STEP * (S.level - 1);
    S.prog = Math.max(0, surplus);
    S.dives = DIVES;
    nextDive();
  };
}

// Экспедиция окончена (кончились заходы, цель не взята)
function showGameOver(){
  show(`<h2>Экспедиция окончена</h2>
    <div class="big amb">Уровень ${S.level}</div>
    <p>Не хватило <b>${S.quota - S.prog} 💰</b> до цели.<br>Всего добыто за игру: <b>${S.banked} 💰</b></p>
    <button class="btn btn-go" id="go">Сыграть ещё</button>`);
  $('go').onclick = () => { hide(); start(); };
}
