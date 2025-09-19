# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a virtual tour application of Wrocław's Tumski Island. The project is currently being migrated from a vanilla JavaScript SPA to a modern React + TypeScript + Vite PWA application.

### Current Migration Status
🚧 **MIGRATION IN PROGRESS** 🚧

- **Legacy codebase**: Vanilla JS with iframe-based SPA (root directory)
- **New codebase**: React + TypeScript + Vite PWA (v2/ directory)
- **Migration plan**: See MIGRATION_PLAN.md for detailed roadmap

### Project Structure
```
/                    # Legacy vanilla JS application
v2/                  # New React + TypeScript + Vite application
MIGRATION_PLAN.md    # Detailed migration roadmap
```

The new application features:
- React 18 + TypeScript for type safety
- Vite for fast development and building
- PWA capabilities for mobile app-like experience
- ShadCN/UI components for consistent design
- Zustand for state management
- Multi-language support with i18next
- Fullscreen panoramic experiences
- Interactive geomarker system

## Development Focus

### Working on v2/ (New React App)
When working on the new React application in v2/:

#### Key Technologies
- **React 18 + TypeScript**: Modern component-based architecture
- **Vite**: Fast development server and optimized builds
- **ShadCN/UI**: Pre-built accessible components
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing
- **PWA**: Service worker, manifest, offline capabilities

#### Development Commands
```bash
cd v2/
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Legacy Architecture (Reference Only)
The legacy vanilla JS application uses:
- **Universal Handler**: `tumski_cathedral_handler.js` - reference for migration
- **Page-specific Initialization**: Individual HTML pages with specific geomarkers
- **Modular Structure**: ES6 modules
- **iframe-based SPA**: For page isolation

### File Structure
```
locales/              # Localization files (ru, en, de, pl, cs, be, uk) - none found in current codebase
styles.css            # Common styles
common_tumski.css     # Shared Tumski-specific styles
tumski*.css           # Page-specific styles
tumski*.html          # HTML pages
dwor*.html           # Court pages
ogrod*.html          # Garden pages
tumski*_init.js      # Page initialization files (referenced in docs)
tumski_cathedral_handler.js  # Universal geomarker handler - DO NOT MODIFY
```

### Key Components

#### SPA System (`index.html`)
- **SPAManager**: Main class managing page loading and navigation
- **Iframe-based**: Pages load in iframes to maintain isolation
- **Music Management**: Contextual background music switching based on page
- **Navigation**: Supports all types of navigation (arrows, geomarkers, links)

#### Music System
- **town.mp3**: Default background music for most pages
- **kostel.mp3**: Church music for tumski19.html
- **hang.mp3**: Special music for tumski21.html
- **birds.mp3**: Nature sounds for garden pages (ogrod02-ogrod13)
- **quest.mp3**: Quest-related music
- **step.wav**: Sound effect for navigation

#### Geomarker System (`tumski_cathedral_handler.js`)
- Universal handler that works with all HTML files
- Handles modal windows, translations, and positioning
- Uses `data-x-desktop` and `data-x-mobile` attributes for responsive positioning
- Supports right/left half positioning logic for content reordering

## Common Development Tasks

### Testing
Since no package.json or build system is present, testing is done manually:
1. Open HTML files directly in browser or use local server
2. Test on both desktop and mobile devices
3. Verify geomarkers are clickable and open modal windows
4. Check navigation arrows work correctly
5. Verify localization switching (if locale files exist)
6. Test music switching between pages

### Adding Geomarkers
1. Add HTML markup to the appropriate `.html` file
2. Add `setupUniversalGeoMarker()` call in the page's initialization file
3. Add translations to all language files (when locale system is implemented)
4. Test on all devices

### Removing Geomarkers
1. Remove HTML markup from `.html` file
2. Remove `setupUniversalGeoMarker()` call from initialization file
3. **NEVER modify** `tumski_cathedral_handler.js`
4. Create/update page-specific initialization file

### Working with Music
- All audio elements are managed in the SPA's `index.html`
- Music switching happens automatically based on page name
- Sound can be muted via localStorage `soundMuted` setting
- Always check `isSoundEnabled()` before playing audio

## Important Rules

### Critical Constraints
- **NEVER modify `tumski_cathedral_handler.js`** - it's the universal handler
- Always check element existence before calling functions
- Use emoji debugging logs: 🟡 (info), ❌ (error), ✅ (success)
- Maintain backward compatibility with existing functionality
- Follow existing CSS animation patterns (`zoom-transition`)

### Debugging
- Check browser console for errors
- Verify file loading in Network tab
- Check CSS styles application in Elements tab
- Add debug logs to problematic code sections
- Test on both desktop and mobile devices

### Code Style
- Use ES6+ syntax and modules
- Add comments for complex logic
- Use async/await for asynchronous operations
- Check function existence before calling
- Use semantic HTML markup
- Minimize CSS duplication

## Input Detection System

The project includes an input detection system (`input_detection.js`, `input_compatibility.css`) that switches between desktop and touch modes:
- **Desktop mode**: Elements appear on hover
- **Touch mode**: Elements are always visible
- **Hybrid devices**: Desktop mode takes priority
- Test using `test_input_detection.html`

## Browser Compatibility
- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- Mobile browsers supported
- No build system or transpilation - uses modern JavaScript features directly