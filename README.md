# 🏗️ ShowRoom.AI

> Transform flat 2D floor plans into photorealistic 3D renders in seconds.

---

## 📌 Overview

**ShowRoom.AI** is an AI-powered architectural visualization platform that converts 2D floor plans into stunning, top-down 3D renders.

Built as a scalable SaaS application, it demonstrates real-world architecture for AI integration, cloud storage, authentication, and multi-tenant project management.

---

## ✨ Features

### 🖼️ Instant 2D → 3D Rendering

- Upload floor plans (PNG, JPG, WebP)
- AI-generated photorealistic 3D visualization
- Fast processing pipeline
- Side-by-side comparison view

### ☁️ Persistent Media Hosting

- Permanent public URLs for uploads and renders
- CDN-optimized delivery
- Cloud-based storage

### 📁 Personal Project Dashboard

- View full render history
- Metadata tracking
- Instant loading
- Ownership-based filtering

### 🌍 Global Community Feed

- Share projects publicly
- Infinite scroll feed
- Attribution and visibility controls

### 🔒 Public / Private Controls

- Toggle visibility per project
- Secure ownership validation
- Protected API routes

### 🖨️ High-Resolution Export

- Download render outputs
- Presentation-ready visuals
- Portfolio-ready exports

### 🌐 Internationalization

- Multi-language support (English, French) and many more

---

## 🛠️ Development

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

### Pre-commit Hooks

This project uses **Husky** and **lint-staged** to maintain code quality:

✅ **Automatic formatting** with Prettier  
✅ **Lint checks** with ESLint  
✅ **Unused variable/import detection** - commits are blocked if found

The pre-commit hook runs automatically on every commit and:

- Formats all staged `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.css`, and `.md` files
- Checks TypeScript/JavaScript files for unused variables and imports
- Prevents commits with linting errors

**Configuration:**

- Pre-commit script: `.husky/pre-commit`
- Staged file tasks: `lint-staged` in `package.json`
- ESLint rules: `eslint.config.js`

### Internationalization (i18n)

The app supports multiple languages using **i18next** and automatically detects the user's browser language.

**Supported Languages:**

- English (en) - Default
- French (fr)

**Adding a New Language:**

1. Create a new translation file in `i18n/locales/`:

   ```bash
   # Example: Spanish
   touch i18n/locales/es.json
   ```

2. Copy the structure from `en.json` and translate:

   ```json
   {
     "navbar": {
       "brand": "ShowRoom",
       "product": "Producto",
       "pricing": "Precios",
       ...
     }
   }
   ```

3. Add the language to `i18n/config.ts`:

   ```typescript
   import es from './locales/es.json';

   resources: {
     en: { translation: en },
     fr: { translation: fr },
     es: { translation: es }  // Add new language
   }
   ```

**Using Translations in Components:**

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('navbar.brand')}</h1>;
};
```

**Translation Files Location:** `i18n/locales/`  
**Configuration:** `i18n/config.ts`
