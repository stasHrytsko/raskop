// ───────────────────────────────────────────────
//  Отрисовка текущей комнаты — сетка клеток + HUD + кнопки действий
//  Эпик: C, D (tasks.md) · Фаза 1
//  Эпик: E (Фаза 2) — бонусная комната, баннер двери
//  Эпик: H (Фаза 3) — нейтрализованная ловушка (Печать хранителя), кнопка артефакта
//  Зависит от: config.js, gen/room.js (clueAt), core/tomb.js, core/economy.js,
//  core/run.js, core/keys.js, core/artifacts-permanent.js
//  Заменяет: render.js (renderGrid/render/flyCoin)
// ───────────────────────────────────────────────
const grid = $('grid');

// Активная комната: бонусная (сокровищница), пока в ней, иначе текущая основная
function activeRoom(){ return R.inBonus ? R.bonusRoom : curRoom(); }

// Вылетающий текст над клеткой при её безопасном вскрытии («+1 🪙» / «🗝️ Ключ!»)
function flyText(i, text){
  const el = grid.children[i].getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'fly';
  f.textContent = text;
  f.style.left = (el.left + el.width / 2 - 18) + 'px';
  f.style.top = (el.top - 4) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 700);
}

// Перерисовка сетки активной комнаты
function renderCells(){
  const rm = activeRoom();
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${rm.size}, 1fr)`;
  rm.cells.forEach((c, i) => {
    const d = document.createElement('div');
    d.className = 'c' + (c.open ? ' open' : '');
    if(c.open){
      if(c.type === 'trap'){
        if(c.neutralized){
          d.classList.add('neutral');
          d.textContent = '🛡️';
        } else {
          d.classList.add('trap');
          d.textContent = '💀';
        }
      } else {
        const n = clueAt(rm, i);
        if(n){
          d.innerHTML = `<span class="num ${n >= 4 ? 'hot' : n >= 2 ? 'warm' : ''}">${n}</span>`;
        } else {
          d.classList.add('n0');
          d.textContent = '·';
        }
      }
    }
    d.onclick = () => tap(i);
    grid.appendChild(d);
  });
}

// Кнопки действий: «Дальше →» / «К выходу →» / «Продолжить →» (из сокровищницы)
function updateActionButton(){
  const primary = $('actionBtn');
  const secondary = $('secondaryBtn');
  secondary.style.display = 'none';

  if(R.inBonus){
    primary.className = 'btn btn-go';
    primary.textContent = 'Продолжить →';
    primary.disabled = !R.live;
    primary.onclick = goLeaveVault;
    return;
  }

  const last = isLastRoom();
  const met = quotaMet(R);

  if(last && met){
    primary.className = 'btn btn-go';
    primary.textContent = 'К выходу →';
    primary.disabled = !R.live;
    primary.onclick = goExit;
  } else if(last){
    primary.className = 'btn btn-leave';
    primary.textContent = `Нужно ещё ${R.quota - R.gold} 🪙`;
    primary.disabled = true;
    primary.onclick = null;
  } else if(met){
    primary.className = 'btn btn-go';
    primary.textContent = 'К выходу →';
    primary.disabled = !R.live;
    primary.onclick = goExit;
    secondary.style.display = '';
    secondary.disabled = !R.live;
    secondary.textContent = 'Ещё одна комната →';
    secondary.onclick = goNext;
  } else {
    primary.className = 'btn btn-leave';
    primary.textContent = 'Дальше →';
    primary.disabled = !R.live;
    primary.onclick = goNext;
  }
}

// Баннер двери сокровищницы — только в vaultRoomIndex, пока не открыта
function renderVaultBanner(){
  const el = $('vaultBanner');
  const inVaultRoom = !R.inBonus && R.tomb.currentRoomIndex === R.tomb.vaultRoomIndex;
  if(!inVaultRoom || R.vaultOpened){
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  if(R.hasKey){
    el.className = 'vault open';
    el.textContent = '🔓 Открыть дверь в сокровищницу →';
    el.disabled = !R.live;
    el.onclick = goOpenVault;
  } else {
    el.className = 'vault locked';
    el.textContent = '🔒 Заперта дверь в сокровищницу';
    el.disabled = true;
    el.onclick = null;
  }
}

// Перерисовка HUD и сетки активной комнаты
function renderRoom(){
  const rm = activeRoom();
  $('lvl').textContent = R.level + 1;
  $('roomInfo').textContent = R.inBonus
    ? 'Сокровищница'
    : `Комната ${R.tomb.currentRoomIndex + 1}/${R.tomb.rooms.length}`;

  if(R.inBonus){
    $('roomTraps').textContent = 'Ловушек нет — чистый бонус';
  } else {
    const keyBadge = R.hasKey && !R.vaultOpened ? ' · 🗝️' : '';
    $('roomTraps').textContent = `В этой комнате ${rm.traps} ловушек${keyBadge}`;
  }

  $('quota').textContent = R.quota;
  $('prog').textContent = R.gold;
  $('qbar').style.width = Math.min(100, R.gold / R.quota * 100) + '%';

  renderVaultBanner();
  renderArtifactBar();
  renderCells();
  updateActionButton();
}
