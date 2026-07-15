export default {
  welcome: {
    eyebrow: 'Self-hosted «прочитать позже»',
    title: 'Ваша тихая читальня',
    lead: 'Сохраняйте ссылки, читайте позже, синхронизируйте с Kobo, экспортируйте в Obsidian.',
    getStarted: 'Начать',
    signIn: 'Войти',
    brand: 'burkmak',
    features: {
      save: {
        title: 'Сохраняйте всё',
        body: 'Вставьте ссылку или поделитесь из любого приложения. burkmak сохранит полный текст статьи — даже если оригинал исчезнет.',
      },
      reader: {
        title: 'Чистый режим чтения',
        body: 'Без рекламы и лишнего. Только Literata, широкие поля и ваши выделения.',
      },
      sync: {
        title: 'Синхронизация с Kobo и экспорт в Obsidian',
        body: 'Отправьте статью на электронную книгу вечером, а заметки — прямо в ваше хранилище.',
      },
    },
  },

  signIn: {
    title: 'С возвращением',
    subtitle: 'Войдите в свою библиотеку',
    email: 'Эл. почта',
    password: 'Пароль',
    submit: 'Войти',
    noAccount: 'Впервые в burkmak?',
    createAccount: 'Создать аккаунт',
    errorInvalid: 'Введите корректный email и пароль от 8 символов.',
    errorCredentials: 'Неверный email или пароль.',
    errorGeneric: 'Что-то пошло не так. Попробуйте ещё раз.',
  },

  signUp: {
    title: 'Создайте библиотеку',
    subtitle: 'Сохраняйте за секунды',
    name: 'Имя',
    email: 'Эл. почта',
    password: 'Пароль',
    passwordHint: '8+ символов, с цифрой или символом.',
    submit: 'Создать аккаунт',
    hasAccount: 'Уже есть библиотека?',
    signIn: 'Войти',
    errorInvalid: 'Заполните все поля; пароль от 8 символов.',
    errorEmailTaken: 'Этот email уже зарегистрирован.',
    errorGeneric: 'Что-то пошло не так. Попробуйте ещё раз.',
    strength: {
      0: 'Слишком слабый',
      1: 'Слишком слабый',
      2: 'Сойдёт',
      3: 'Хороший',
      4: 'Надёжный',
    },
  },

  library: {
    title: 'Библиотека',
    saveLink: 'Сохранить ссылку',
    empty: 'Пока пусто',
    emptyHint: 'Вставьте ссылку, чтобы начать.',
    allTags: 'Все теги',
    search: 'Поиск',
    status: 'В обработке',
    seg: {
      unread: 'Не прочитано',
      read: 'Прочитано',
      archived: 'В архиве',
      favorite: 'Избранное',
    },
    act: {
      favorite: 'В избранное',
      archive: 'В архив',
      delete: 'Удалить',
    },
  },

  save: {
    saving: 'Сохранение…',
    saved: 'Сохранено в burkmak',
    failed: 'Не удалось сохранить эту страницу.',
    retry: 'Повторить',
    viewInLibrary: 'Открыть библиотеку',
    badUrl: 'Нет корректной ссылки для сохранения.',
    signInPrompt: 'Перенаправляем на вход…',
  },

  settings: {
    title: 'Настройки',
    theme: 'Тема',
    themeSystem: 'Системная',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    language: 'Язык',
    bookmarklet: {
      title: 'Букмарклет для браузера',
      description:
        'Сохраняйте страницу одним кликом. Перетащите кнопку на панель закладок или скопируйте её.',
      dragHint: 'Перетащите на панель закладок →',
      button: 'Сохранить в burkmak',
      copy: 'Копировать',
      copied: 'Скопировано',
    },
    tokens: {
      title: 'Персональные токены доступа',
      description:
        'Токены позволяют сторонним клиентам (Kobo OPDS, плагин Obsidian) авторизоваться без интерактивной сессии. Секрет показывается один раз — скопируйте его немедленно.',
      create: 'Создать токен',
      name: 'Название токена',
      namePlaceholder: 'напр. Kobo e-reader',
      copyOnce: 'Скопируйте токен сейчас — он больше не будет показан.',
      copy: 'Скопировать',
      copied: 'Скопировано',
      revoke: 'Отозвать',
      empty: 'Токенов пока нет.',
      lastUsed: 'Последнее использование',
      never: 'Никогда',
      created: 'Создан',
    },
  },

  itemDetail: {
    back: 'Библиотека',
    addTag: 'Добавить тег',
    delete: 'Удалить',
    archive: 'В архив',
    favorite: 'В избранное',
    status: 'В обработке',
    read: {
      unread: 'Не прочитано',
      read: 'Прочитано',
      archived: 'В архиве',
    },
  },

  reader: {
    pitch: 'Загрузите полный текст статьи в чистый режим чтения.',
    extract: 'Извлечь статью',
    extracting: 'Извлечение…',
    failed: 'Не удалось извлечь. Попробуйте ещё раз.',
    retry: 'Повторить',
    highlights: 'Выделения',
    actionFailed: 'Что-то пошло не так. Попробуйте ещё раз.',
    dismiss: 'Закрыть',
  },

  highlight: {
    addNote: 'Добавить заметку',
    edit: 'Изменить',
    delete: 'Удалить',
    save: 'Сохранить заметку',
    cancel: 'Отмена',
    notePlaceholder: 'Добавьте заметку…',
  },

  addBar: {
    placeholder: 'https://example.com/article',
    save: 'Сохранить',
    asBookmark: 'Закладка',
  },

  addModal: {
    title: 'Сохранить ссылку',
    placeholder: 'https://example.com/article',
    cancel: 'Отмена',
    save: 'Сохранить',
    asBookmark: 'Сохранить как закладку',
  },

  bookmarks: {
    title: 'Закладки',
    empty: 'Закладок пока нет',
    emptyHint: 'Сохраните ссылку как закладку, чтобы держать её под рукой.',
    search: 'Поиск закладок',
    filteringByTag: 'Фильтр по тегу:',
    error: 'Не удалось загрузить закладки.',
    retry: 'Повторить',
    act: {
      favorite: 'В избранное',
      delete: 'Удалить',
    },
  },

  shelves: {
    title: 'Полки',
    empty: 'Полок пока нет. Создайте полку, чтобы группировать чтение.',
    create: 'Новая полка',
    namePlaceholder: 'Название полки',
    rename: 'Переименовать',
    delete: 'Удалить',
    deleteConfirm: 'Удалить эту полку? Статьи на ней не удаляются.',
    // Russian plural: zero | one | few | many — see i18n.config.ts's
    // custom `pluralRules.ru` (vue-i18n's default rule can't tell 21 from 2
    // from 5; it just clamps `count` to an index).
    itemCount: 'Нет элементов | {count} элемент | {count} элемента | {count} элементов',
    loadError: 'Не удалось загрузить полки.',
    nameConflict: 'У вас уже есть полка с таким названием.',
    createError: 'Не удалось создать полку.',
    renameError: 'Не удалось переименовать полку.',
    deleteError: 'Не удалось удалить полку.',
    retry: 'Повторить',
    shelfEmpty: 'На этой полке пока пусто.',
    addToShelf: 'Добавить на полку',
    removeFromShelf: 'Убрать с полки',
    backToShelves: 'Все полки',
    pickerEmpty: 'Полок пока нет.',
  },

  nav: {
    appName: 'burkmak',
    navHome: 'Главная',
    navBookmarks: 'Закладки',
    navShelves: 'Полки',
    navLogin: 'Войти',
    navSettings: 'Настройки',
    navSignOut: 'Выйти',
    toggleTheme: 'Переключить тему',
  },
} as const;
