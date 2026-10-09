/* Цена вопроса по настоящим ответам игроков: id → 100…500. Подключается ПЕРЕД js/price.js (PRICE.load(window.PRICE_ID)).
   Собирать: python3 ~/Projects/hobby-analytics/stat/qa_export.py --min 30 --q js/questions.js --out /tmp/qa
             python3 tools/price_id.py /tmp/qa-price.json      (перезапишет этот файл)
   Пустая таблица — цена считается по «тема × сложность» (js/price.js). Номера id не менять («уже видел»). */
window.PRICE_ID={};
