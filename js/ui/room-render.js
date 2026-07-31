// ───────────────────────────────────────────────
//  Отрисовка текущей комнаты — сетка клеток + HUD + кнопки действий
//  Эпик: C, D (tasks.md) · Фаза 1
//  Зависит от: config.js, gen/room.js (clueAt), core/tomb.js, core/economy.js, core/run.js
//  Заменяет: render.js (renderGrid/render/flyCoin)
// ───────────────────────────────────────────────
const grid = $('grid');

// Вылетающая «+1 🪙» за каждую безопасно вскрытую клетку
function flyCoin(i){
  const el = grid.children[i].getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'fly';
  f.textContent = '+1 🪙';
  f.style.left = (el.left + el.width / 2 - 18) + 'px';
  f.style.top = (el.top - 4) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 700);
}

// Перерисовка сетки текущей комнаты
function renderCells(){
  const rm = curRoom();
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${rm.size}, 1fr)`;
  rm.cells.forEach((c, i) => {
    const d = document.createElement('div');
    d.className = 'c' + (c.open ? ' open' : '');
    if(c.open){
      if(c.type === 'trap'){
        d.classList.add('trap');
        d.textContent = '💀';
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

// Кнопки действий: «Дальше →» / «К выходу →» (+ опциональная «Ещё одна комната →»)
function updateActionButton(){
  const primary = $('actionBtn');
  const secondary = $('secondaryBtn');
  const last = isLastRoom();
  const met = quotaMet(R);

  secondary.style.display = 'none';

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

// Перерисовка HUD и сетки текущей комнаты
function renderRoom(){
  const rm = curRoom();
  $('lvl').textContent = R.level + 1;
  $('roomInfo').textContent = `Комната ${R.tomb.currentRoomIndex + 1}/${R.tomb.rooms.length}`;
  $('roomTraps').textContent = `В этой комнате ${rm.traps} ловушек`;
  $('quota').textContent = R.quota;
  $('prog').textContent = R.gold;
  $('qbar').style.width = Math.min(100, R.gold / R.quota * 100) + '%';

  renderCells();
  updateActionButton();
}
