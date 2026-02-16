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
