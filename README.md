# Wroclaw - Interactive Tumski Island Tour

**Version:** 0.1.0
**Last Updated:** 2026-06-27

Static interactive tour of Tumski Island in Wroclaw. The project runs as a vanilla JavaScript web app and is wrapped for Android/iOS with Capacitor.

---

## 📚 Documentation

### For Developers & AI Agents
- **[CLAUDE.md](CLAUDE.md)** - 🤖 **AUTO-LOADED** - Context for Claude Code (always read first!)
- **[PROJECT_INTAKE.md](PROJECT_INTAKE.md)** - ⭐ **START HERE** - Project requirements and context (fill before development)
- **[PLAN_TEMPLATE.md](PLAN_TEMPLATE.md)** - 📋 **CREATE PLAN.md** - Implementation plan template with security integration
- **[SECURITY.md](SECURITY.md)** - 🔐 **CRITICAL** - Security requirements for all development stages
- **[AGENTS.md](AGENTS.md)** - AI agent instructions and development guidelines
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and technical decisions
- **[BACKLOG.md](BACKLOG.md)** - Implementation status and roadmap (**SINGLE SOURCE OF TRUTH**)
- **[WORKFLOW.md](WORKFLOW.md)** - Development workflows and sprint processes
- **[PROJECT_SNAPSHOT.md](PROJECT_SNAPSHOT.md)** - Current technical snapshot and recent refactoring history
- **[docs/refactoring/](docs/refactoring/)** - Refactoring review, master plan, stage notes, and verification artifacts

### Configuration Files
- **[Makefile](Makefile)** - Standard commands (`make dev`, `make build`, etc)
- **[package.json](package.json)** - Capacitor dependencies and npm scripts
- **[capacitor.config.json](capacitor.config.json)** - Capacitor app ID, app name, and `webDir`
- **[scripts/build-capacitor-web.mjs](scripts/build-capacitor-web.mjs)** - Static asset copy step for native builds
- **[scripts/static-check-known-issues.json](scripts/static-check-known-issues.json)** - Static inventory allowlist, currently empty for missing assets/routes
- **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)** - GitHub Pages deployment

### Quick Start for AI Agents
1. Read [CLAUDE.md](CLAUDE.md) - **Auto-loaded context** for Claude Code
2. Read [PROJECT_INTAKE.md](PROJECT_INTAKE.md) - **Fill this first!** Essential project context
3. Read [SECURITY.md](SECURITY.md) - **Read before ANY coding!** Security requirements
4. Read [AGENTS.md](AGENTS.md) - Core instructions and patterns
5. Read [ARCHITECTURE.md](ARCHITECTURE.md) - System design
6. Read [BACKLOG.md](BACKLOG.md) - Current status and priorities
7. Read [WORKFLOW.md](WORKFLOW.md) - Sprint processes

---

## ✨ Features

- ✅ **SPA navigation** - iframe-based navigation between tour locations
- ✅ **Interactive map markers** - modal content and visited-page markers
- ✅ **Localization** - JSON translations for 7 languages
- ✅ **Audio system** - location-aware background audio and effects
- ✅ **Safety checks** - ESLint, JS syntax checks, static inventory, translation consistency, and Playwright smoke
- ✅ **Package budget** - Capacitor web build guarded below 120 MB; current build is `324 files, 84.5 MB -> www/`
- ✅ **Capacitor wrapper** - Android and iOS native projects generated from static web assets

**Legend:**
- ✅ Completed
- 🚧 In Progress
- 📋 Planned

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Vanilla JavaScript, no frontend framework
- **Language:** JavaScript ES6+
- **Styling:** Plain CSS
- **Build:** Static files copied to `www/` for Capacitor

### Backend & Infrastructure
- **Database:** None
- **Auth:** Firebase client SDK is present for optional user/admin features
- **Hosting:** GitHub Pages/static hosting for web, Capacitor for Android/iOS

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical stack.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm
- JDK 21 for Android command-line builds
- Android Studio / Android SDK for Android builds
- Xcode for iOS builds

`make android-debug` uses `CAPACITOR_JAVA_HOME` and defaults to Homebrew OpenJDK 21 on Apple Silicon. Override it if your JDK 21 is installed elsewhere.

`make dev` defaults to port `5173`; use `make dev PORT=5176` if that port is already busy.

### Installation

```bash
make install
make dev
```

### First Run
1. Open http://localhost:5173 for the web version.
2. Run `make cap-sync` after web asset changes.
3. Run `make android-debug` to build a debug APK.

---

## 📦 Available Commands

Проект использует **Makefile** для стандартизации команд:

### Development
```bash
make dev          # Start static dev server on http://localhost:5173
make build        # Copy runtime web assets into www/
make start        # Same static server as make dev
make cap-sync     # Build www/ and sync Android/iOS projects
```

### Quality & Testing
```bash
make lint         # Run ESLint
make typecheck    # Placeholder: no TypeScript configured
make test         # JS syntax + static inventory + translation checks
make test-e2e     # Playwright browser smoke checks
make smoke        # Static checks + Playwright smoke checks
```

### Security & Dependencies
```bash
make security     # Run npm audit
make security-fix # Auto-fix vulnerabilities
make audit        # lint + typecheck + test + build + security
```

### Capacitor
```bash
make cap-open-android # Open Android project
make cap-open-ios     # Open iOS project
make android-debug    # Build Android debug APK
```

### Utility
```bash
make install      # Install dependencies
make clean        # Remove generated www/
make reinstall    # Reinstall all dependencies
make doctor       # Diagnose environment
make help         # Show all available commands
```

**Рекомендация:** Используй `make` команды - они проще и стандартизированы.

---

## 🔑 Environment Variables

No `.env` file is required for the current static tour. Firebase web configuration lives in `firebase_config.js`; treat Firebase security rules as the real access-control boundary.

---

## 📂 Project Structure

```
Wroclaw/
├── index.html            # SPA shell
├── tumski*.html/css      # Tour location pages
├── dwor*.html/css        # Courtyard pages
├── ogrod*.html/css       # Garden pages
├── media/                # Images, audio, icons, fonts
├── locales/              # Canonical translations: locales/<lang>/translations.json
├── scripts/              # Build scripts
├── docs/refactoring/     # Refactoring plans, stage docs, verification artifacts
├── android/              # Capacitor Android project
├── ios/                  # Capacitor iOS project
├── capacitor.config.json # Capacitor app config
├── package.json          # Capacitor dependencies and scripts
├── AGENTS.md            # AI instructions
├── ARCHITECTURE.md      # Architecture docs
├── BACKLOG.md          # Project status
├── WORKFLOW.md         # Development process
└── README.md           # This file
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed structure.

---

## 🔐 Security

### Best Practices
- Never commit `.env` files
- Do not put server secrets into frontend JavaScript
- Firebase web API keys are public identifiers; enforce access with Firebase rules
- Run `make security` after dependency changes

See [ARCHITECTURE.md](ARCHITECTURE.md#security-architecture) for security architecture.

---

## 🐛 Known Issues

See [BACKLOG.md](BACKLOG.md#known-issues) for current bugs and issues.

---

## 📝 Development Workflow

1. Check [BACKLOG.md](BACKLOG.md) for tasks
2. Create feature branch: `git checkout -b feature/your-feature`
3. Follow patterns in [AGENTS.md](AGENTS.md)
4. Run the relevant `make` checks, normally `make audit` and `make smoke` for behavior-affecting changes
5. Update [BACKLOG.md](BACKLOG.md), [PROJECT_SNAPSHOT.md](PROJECT_SNAPSHOT.md), and stage docs when work status changes
6. Create PR with documentation updates

See [WORKFLOW.md](WORKFLOW.md) for detailed workflow.

---

## 🤝 Contributing

[ЗАПОЛНИТЬ: Правила контрибуции]

1. Read [AGENTS.md](AGENTS.md) for development guidelines
2. Follow [WORKFLOW.md](WORKFLOW.md) for sprint process
3. Update [BACKLOG.md](BACKLOG.md) with your changes
4. Ensure all tests pass
5. Update documentation

---

## 📋 Roadmap

See [BACKLOG.md](BACKLOG.md) for detailed roadmap and priorities.

### Next Milestones
- [ ] Complete remaining tour content
- [ ] Complete remaining translations
- [ ] Optimize media weight for mobile packages

---

## 🔄 Version History

### [0.1.0] - [DATE]
- Initial project setup
- Documentation structure
- Capacitor Android/iOS wrapper

See [BACKLOG.md](BACKLOG.md#change-log) for full change history.

---

## 📞 Support

[ЗАПОЛНИТЬ: Контакты и поддержка]

- **Issues:** [GitHub Issues URL]
- **Email:** [contact@email.com]
- **Docs:** [Documentation URL]

---

## 📄 License

[ЗАПОЛНИТЬ: Лицензия проекта]

[License type] - See [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **[Author Name]** - [Role] - [Contact]
- [Additional contributors]

---

## 🙏 Acknowledgments

- [Credits and acknowledgments]
- Built with [Claude Code](https://claude.com/claude-code)

---

## 📝 Notes for First-Time Setup

Когда используете этот README для нового проекта:

1. **Замените все [ЗАПОЛНИТЬ]** на актуальную информацию
2. **Обновите URLs** (repository, issues, documentation)
3. **Заполните Technology Stack** из реального проекта
4. **Добавьте скриншоты** (если нужны)
5. **Укажите реальные команды** (npm run dev → правильная команда)
6. **Обновите структуру** под реальные директории
7. **Удалите эту секцию** после первичной настройки

---

*Developed with ❤️ using [Claude Code](https://claude.com/claude-code)*
