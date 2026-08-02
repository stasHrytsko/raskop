// ───────────────────────────────────────────────
//  Данные кампании — таблица уровней 1–100
//  Эпик: L (tasks.md) · Фаза 5
//  Зависит от: config.js (ROOM_SIZE, TRAPS_PER_ROOM, QUOTA_RATIO, safeCellsPerRoom)
//  Заменяет: quotaFor()/roomsFor()/tierFor() из config.js (были плоские на 9 уровней)
// ───────────────────────────────────────────────
//
// concept.txt не даёт 100 уровней поштучно — только 7 тиров прогрессии («Прогрессия
// 100 уровней»). Таблица CAMPAIGN поэтому генерируется по формуле из тиров, а не
// авторится вручную. Из фич, перечисленных в тексте тира, в featuresEnabled попали
// только те, что реально реализованы в коде (сверка со статусом эпиков —
// raskop/CLAUDE.md): число комнат (Эпик A), ключ+сокровищница-«карман» (Эпик E, с
// тира «Ключи и тайники»), временный артефакт (Эпик I, с тира «Разнообразие»),
// isBoss на каждом 10-м уровне (гробница на комнату больше — единственный эффект
// босса, который уже есть чем реализовать). НЕ включено, хотя упомянуто в тексте
// тира в tasks.md (Эпик L), — потому что самой механики ещё нет нигде в коде:
// размеры комнат 5/6/7 (Эпик A, открытый вопрос), несколько дверей на один ключ
// (Эпик E, открытый вопрос), постоянный магазин и 2-й слот артефакта (Эпик H,
// открытый вопрос), проклятые находки (Эпик I, открытый вопрос), секторные комнаты
// (Эпик K, не начат), особые тематические подсказки (Эпик J, не начат).

// Границы тиров (0-индекс, `to` включительно) + метаданные для карты кампании
// (ui/campaign-map.js). `cls` — визуальный класс сложности, переиспользует
// .lv.easy/.med/.hard из прежней сетки 3×3: 7 тиров сгруппированы в 3 цвета легенды.
const CAMPAIGN_TIERS = [
  { id: 'novice',  label: 'Обучение',        from: 0,  to: 2,  cls: 'easy', roomCount: 2, keys: false, temp: false },
  { id: 'core',    label: 'Чистое ядро',     from: 3,  to: 14, cls: 'easy', roomCount: 3, keys: false, temp: false },
  { id: 'keys',    label: 'Ключи и тайники', from: 15, to: 29, cls: 'med',  roomCount: 3, keys: true,  temp: false },
  { id: 'variety', label: 'Разнообразие',    from: 30, to: 49, cls: 'med',  roomCount: 4, keys: true,  temp: true  },
  { id: 'routes',  label: 'Маршруты',        from: 50, to: 69, cls: 'hard', roomCount: 4, keys: true,  temp: true  },
  { id: 'combo',   label: 'Комбинации',      from: 70, to: 89, cls: 'hard', roomCount: 5, keys: true,  temp: true  },
  { id: 'mastery', label: 'Мастерство',      from: 90, to: 99, cls: 'hard', roomCount: 5, keys: true,  temp: true  },
];

function tierOf(n){
  return CAMPAIGN_TIERS.find(t => n >= t.from && n <= t.to) || CAMPAIGN_TIERS[CAMPAIGN_TIERS.length - 1];
}

// Каждый 10-й уровень (10, 20, ..., 100) — босс: гробница на комнату больше, чем у
// тира (единственная реализованная разница — «большая гробница», не новая механика,
// как и требует tasks.md: "не на новую механику").
const CAMPAIGN = Array.from({ length: 100 }, (_, n) => {
  const tier = tierOf(n);
  const isBoss = (n + 1) % 10 === 0;
  const roomCount = tier.roomCount + (isBoss ? 1 : 0);
  return {
    n,
    tierId: tier.id,
    roomCount,
    quota: Math.round(QUOTA_RATIO * roomCount * safeCellsPerRoom),
    isBoss,
    keysEnabled: tier.keys,
    tempArtifactsEnabled: tier.temp,
  };
});

const LEVELS_COUNT = CAMPAIGN.length;   // 100 — заменяет плоскую константу config.js
