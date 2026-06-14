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

  settings: {
    title: 'Settings',
    theme: 'Toggle theme',
    language: 'Language',
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

  addBar: {
    placeholder: 'https://example.com/article',
    save: 'Save',
  },

  addModal: {
    title: 'Save a link',
    placeholder: 'https://example.com/article',
    cancel: 'Cancel',
    save: 'Save',
  },

  nav: {
    appName: 'burkmak',
    navHome: 'Home',
    navLogin: 'Login',
    navSignOut: 'Sign out',
  },
} as const;
