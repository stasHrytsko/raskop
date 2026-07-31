// ───────────────────────────────────────────────
//  Bootstrap — порядок подключения модулей и точка входа
//  Статус: заглушка — собирается по мере готовности фаз, финализируется в Фазе 5
//  Заменяет: текущий js/game.js (хвост: loadBest(); initNav();)
// ───────────────────────────────────────────────
//
// Порядок <script> в index.html (см. tasks.md раздел 2 «Иерархия проекта»):
//   config → content/* → gen/rules → gen/room → gen/sectors → core/tomb →
//   core/economy → core/keys → core/objectives → core/wallet → core/artifacts-* →
//   core/run → ui/popups → ui/room-render → ui/artifact-ui → ui/tomb-map →
//   ui/campaign-map → ui/nav → app
//
// TODO (Фаза 1): loadWallet(); initNav(); — по аналогии с текущим loadBest()/initNav().
