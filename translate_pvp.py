import os
import re

file_path = r"C:\Users\vaska\Desktop\void-covenant\src\components\PvpArenaView.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    "Лига Новобранцев": "Recruit League",
    "Лига Теней": "Shadow League",
    "Лига Крови": "Blood League",
    "Лига Ковенанта": "Covenant League",
    "Магистр Бездны": "Void Magister",
    "Вы (Призыватель ковенанта)": "You (Covenant Summoner)",
    "Инициализация боевого шифрования...": "Initializing combat encryption...",
    "Поиск призывателя в диапазоне ": "Searching for summoner in range ",
    "Установка устойчивой астральной связи...": "Establishing stable astral connection...",
    "Ваша колода не заполнена! Перейдите во вкладку \"СВЯТИЛИЩЕ\" и выберите ровно 5 карт для боя.": "Your deck is incomplete! Go to the 'SANCTUARY' tab and select exactly 5 cards for battle.",
    "Недостаточно PvP-энергии! Она восстанавливается автоматически (1 ед. за 15 минут) или используйте Зелье Крови (15💎).": "Not enough PvP Energy! It restores automatically (1 per 15 mins) or use a Blood Potion (15💎).",
    "Арена:": "Arena:",
    "Рейтинговый PvP-бой за славу и награды Ковенанта. Оппонент:": "Ranked PvP battle for Covenant glory and rewards. Opponent:",
    "ПОИСК СОПЕРНИКА": "MATCHMAKING",
    "Прошло секунд:": "Elapsed seconds:",
    "ОТМЕНИТЬ ПОИСК": "CANCEL SEARCH",
    "АРЕНА БЕЗДНЫ": "VOID ARENA",
    "Сразитесь с другими тёмными призывателями за место на вершине Бездны. Каждая победа повышает ваш рейтинг MMR и приближает к званию легенды.": "Battle other dark summoners for a place at the top of the Void. Each victory increases your MMR rating and brings you closer to legendary status.",
    "ВАШ РЕЙТИНГ": "YOUR RATING",
    "МЕСТО В ТОПЕ": "TOP RANK",
    "РЕЙТИНГОВАЯ ОЧЕРЕДЬ": "RANKED QUEUE",
    "PvP Энергия": "PvP Energy",
    "1 ед. восстанавливается каждые 15 минут": "1 pt restores every 15 mins",
    "Зелье Крови": "Blood Potion",
    "Восстановит всю энергию": "Restores all energy",
    "Ваша PvP и PvE энергия полностью восстановлена Зельем Крови!": "Your PvP and PvE energy was fully restored with a Blood Potion!",
    "Использовать 15 Осколков": "Use 15 Shards",
    "КОЛОДА НЕ ГОТОВА": "DECK NOT READY",
    "У вас в боевой колоде ": "You have ",
    "/5 карт. Пожалуйста, соберите полную колоду из пяти существ во вкладке ": "/5 cards in your battle deck. Please assemble a full deck of 5 creatures in the ",
    "СВЯТИЛИЩЕ": "SANCTUARY",
    " перед вступлением на Арену Бездны.": " tab before entering the Void Arena.",
    "БОЕВАЯ КОЛОДА ГОТОВА": "BATTLE DECK READY",
    "Ваш отряд укомплектован (5/5 карт) и рвётся в бой. Все навыки и характеристики слияния будут задействованы на арене!": "Your squad is fully assembled (5/5 cards) and ready for battle. All fusion skills and stats will be active in the arena!",
    "ОЖИДАЕМЫЕ НАГРАДЫ ЗА ПОБЕДУ": "EXPECTED VICTORY REWARDS",
    "Золото": "Gold",
    "Пыль Тьмы": "Dark Dust",
    "Рейтинг": "Rating",
    "Стоимость входа: 1 PvP Энергия. При поражении вы потеряете -15 MMR.": "Entry cost: 1 PvP Energy. On defeat you lose -15 MMR.",
    "ТАБЛИЦА СЛАВЫ": "HALL OF FAME",
    "Рейтинги лучших призывателей Void Covenant. Побеждайте в PvP, чтобы подняться выше в рейтинге!": "Ratings of the best Void Covenant summoners. Win in PvP to climb higher in the rankings!",
    "Обновлено в реальном времени": "Updated in real-time"
}

for ru, en in replacements.items():
    content = content.replace(ru, en)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("PvpArenaView translated!")
