export default {
  welcome: {
    eyebrow: 'Self-hosted read-it-later',
    title: 'Your quiet reading room',
    lead: 'Save links, read later, sync to Kobo, export to Obsidian.',
    getStarted: 'Get started',
    signIn: 'Sign in',
    brand: 'burkmak',
    features: {
      save: {
        title: 'Save anything',
        body: 'Paste a link or share from any app. burkmak grabs the full article and keeps it — even if the original goes dark.',
      },
      reader: {
        title: 'Clean reader view',
        body: 'No ads, no clutter. Just Literata, generous margins, and the highlights you leave behind.',
      },
      sync: {
        title: 'Sync to Kobo & export to Obsidian',
        body: 'Send a piece to your e-reader for the evening, then push your notes straight into your vault.',
      },
    },
  },

  signIn: {
    title: 'Welcome back',
    subtitle: 'Sign in to your library',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    noAccount: 'New to burkmak?',
    createAccount: 'Create an account',
    errorInvalid: 'Enter a valid email and an 8+ character password.',
    errorCredentials: 'Wrong email or password.',
    errorGeneric: 'Something went wrong. Please try again.',
  },

  signUp: {
    title: 'Create your library',
    subtitle: 'Start saving in seconds',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    passwordHint: '8+ characters, with a number or symbol.',
    submit: 'Create account',
    hasAccount: 'Already have a library?',
    signIn: 'Sign in',
    errorInvalid: 'Fill every field; password needs 8+ characters.',
    errorEmailTaken: 'That email is already registered.',
    errorGeneric: 'Something went wrong. Please try again.',
    strength: {
      0: 'Too weak',
      1: 'Too weak',
      2: 'Getting there',
      3: 'Good',
      4: 'Strong',
    },
  },

  library: {
    title: 'Library',
    saveLink: 'Save a link',
    empty: 'Nothing here yet',
    emptyHint: 'Paste a link to begin.',
    allTags: 'All tags',
    search: 'Search library',
    status: 'Pending',
    seg: {
      unread: 'Unread',
      read: 'Read',
      archived: 'Archived',
      favorite: 'Favorite',
    },
    act: {
      favorite: 'Favorite',
      archive: 'Archive',
      delete: 'Delete',
    },
  },

  save: {
    saving: 'Saving…',
    saved: 'Saved to burkmak',
    failed: "Couldn't save this page.",
    retry: 'Retry',
    viewInLibrary: 'View in library',
    badUrl: 'No valid URL to save.',
    signInPrompt: 'Redirecting you to sign in…',
  },

  settings: {
    title: 'Settings',
    theme: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    bookmarklet: {
      title: 'Browser bookmarklet',
      description:
        "Save the page you're reading with one click. Drag the button to your bookmarks bar, or copy it.",
      dragHint: 'Drag to your bookmarks bar →',
      button: 'Save to burkmak',
      copy: 'Copy',
      copied: 'Copied',
    },
    tokens: {
      title: 'Personal access tokens',
      description:
        'Tokens let headless clients (Kobo OPDS, Obsidian plugin) authenticate without an interactive session. The secret is shown once — copy it immediately.',
      create: 'Create token',
      name: 'Token name',
      namePlaceholder: 'e.g. Kobo e-reader',
      copyOnce: 'Copy the token now — it will not be shown again.',
      copy: 'Copy',
      copied: 'Copied',
      revoke: 'Revoke',
      empty: 'No tokens yet.',
      lastUsed: 'Last used',
      never: 'Never',
      created: 'Created',
    },
  },

  itemDetail: {
    back: 'Library',
    addTag: 'Add tag',
    delete: 'Delete',
    archive: 'Archive',
    favorite: 'Favorite',
    status: 'Pending',
    read: {
      unread: 'Unread',
      read: 'Read',
      archived: 'Archived',
    },
  },

  reader: {
    pitch: 'Pull the full article into a clean reader view.',
    extract: 'Extract article',
    extracting: 'Extracting…',
    failed: 'Extraction failed. Try again.',
    retry: 'Retry',
    highlights: 'Highlights',
    actionFailed: 'Something went wrong. Please try again.',
    dismiss: 'Dismiss',
  },

  highlight: {
    addNote: 'Add note',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save note',
    cancel: 'Cancel',
    notePlaceholder: 'Add a note…',
  },

  addBar: {
    placeholder: 'https://example.com/article',
    save: 'Save',
    asBookmark: 'Bookmark',
  },

  addModal: {
    title: 'Save a link',
    placeholder: 'https://example.com/article',
    cancel: 'Cancel',
    save: 'Save',
    asBookmark: 'Save as bookmark',
  },

  bookmarks: {
    title: 'Bookmarks',
    empty: 'No bookmarks yet',
    emptyHint: 'Save a link as a bookmark to keep it here for reference.',
    search: 'Search bookmarks',
    error: "Couldn't load your bookmarks.",
    retry: 'Retry',
    act: {
      favorite: 'Favorite',
      delete: 'Delete',
    },
  },

  nav: {
    appName: 'burkmak',
    navHome: 'Home',
    navBookmarks: 'Bookmarks',
    navLogin: 'Login',
    navSettings: 'Settings',
    navSignOut: 'Sign out',
    toggleTheme: 'Toggle theme',
  },
} as const;
