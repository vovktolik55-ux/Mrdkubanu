const SITE_CONFIG = {
  brand: {
    name: "МЁД ЮГА",
    slogan: "Натуральный пасечный мёд с предгорий Кавказа и степей Кубани",
    location: "Краснодарский край, ст. Отрадная",
    year: "Урожай 2026"
  },

  contacts: {
    telegramUsername: "medyuga_admin",
    phoneDisplay: "+7 (900) 000-00-00",
    phoneRaw: "+79000000000"
  },

  telegramBot: {
    enabled: true,
    botToken: "9155747036:AAGx8w_LALhc4QylLM7Bk0uN_d6xo78YuUw",
    chatId: "8255152759"
  },

  packaging: [
    { id: "05_glass", label: "0.5 л • Стекло", multiplier: 0.55, badge: "" },
    { id: "10_glass", label: "1 л • Стекло", multiplier: 1.0, badge: "Хит" },
    { id: "30_box",   label: "3 л • Выгодно", multiplier: 2.7, badge: "-10%" },
    { id: "10_wood",  label: "1 л • Липовый бочонок", multiplier: 1.45, badge: "Подарок" }
  ],

  giftBoxDiscountPercent: 15,

  deliveryMethods: [
    "Самовывоз (ст. Отрадная)",
    "СДЭК по России",
    "Почта России",
    "Доставка по краю (маршрутка / такси)"
  ],

  products: [
    {
      id: "acacia",
      name: "Белая акация",
      tag: "Майский • Не засахаривается",
      goal: "tea",
      basePrice1L: 1200,
      diastase: "18 ед. Готе",
      region: "Предгорья Кавказа",
      taste: "Нежный цветочный, прозрачный как слеза, без приторности.",
      description: "Самый деликатный сорт. Остаётся жидким до 2 лет, идеален к утреннему кофе, сырам и для детей.",
      image: "https://unsplash.com",
      inStock: true
    },
    {
      id: "chestnut",
      name: "Горный каштан",
      tag: "Элитный • С горчинкой",
      goal: "gift",
      basePrice1L: 1600,
      diastase: "28 ед. Готе",
      region: "Ущелья Адыгеи и Лагонаки",
      taste: "Тёмный, насыщенный, терпкий с благородной горчинкой и ароматом костра.",
      description: "Редкий дикий мёд с каштановых рощ. Мощный природный антисептик и лучший статусный подарок.",
      image: "https://unsplash.com",
      inStock: true
    },
    {
      id: "linden",
      name: "Липовый цвет",
      tag: "Против простуды",
      goal: "immunity",
      basePrice1L: 1100,
      diastase: "24 ед. Готе",
      region: "Леса Отрадненского района",
      taste: "Яркий аромат цветущей липы, согревающий, бархатистый.",
      description: "Главный домашний лекарь при простуде, кашле и усталости. Быстро согревает и восстанавливает силы.",
      image: "https://unsplash.com",
      inStock: true
    },
    {
      id: "herbs",
      name: "Разнотравье предгорий",
      tag: "Классика Кубани",
      goal: "energy",
      basePrice1L: 900,
      diastase: "21 ед. Готе",
      region: "Альпийские луга, 900 м",
      taste: "Богатый букет чабреца, шалфея, донника и полевых цветов.",
      description: "Настоящий вкус южного лета. Заряжает энергией на весь день, подходит для спорта и всей семьи.",
      image: "https://unsplash.com",
      inStock: true
    },
    {
      id: "cream_nuts",
      name: "Крем-мёд с грецким орехом",
      tag: "Десерт • Крафт",
      goal: "gift",
      basePrice1L: 1350,
      diastase: "19 ед. Готе",
      region: "Собственная пасека",
      taste: "Нежная взбитая текстура суфле с отборным кубанским грецким орехом.",
      description: "Взбивается холодным способом без нагрева — сохраняет 100% витаминов и тает во рту.",
      image: "https://unsplash.com",
      inStock: true
    }
  ]
};
