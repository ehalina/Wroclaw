CAPACITOR_JAVA_HOME ?= /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
PORT ?= 5173
E2E_PORT ?= 6173

.PHONY: help install dev build start lint fix-lint typecheck test test-watch test-e2e smoke security security-fix audit clean reinstall doctor poc-template stage-06-08-screenshots stage-06-14-audio stage-06-15-audio stage-06-17-sunset-webp stage-06-18-scene-jpg-screenshots stage-06-19-tumski11-webp-poc stage-06-20-video-review stage-06-21-video-metadata stage-06-22-video-lazy-source stage-06-23-loading-state stage-06-24-loading-helper cap-sync cap-copy cap-add-android cap-add-ios cap-open-android cap-open-ios android-debug

help:
	@printf "Available commands:\n"
	@printf "  make install          Install npm dependencies\n"
	@printf "  make dev              Start static dev server on http://localhost:$(PORT)\n"
	@printf "  make build            Build Capacitor web assets into www/\n"
	@printf "  make lint             Run ESLint\n"
	@printf "  make test             Run static smoke checks\n"
	@printf "  make test-e2e         Run Playwright browser smoke checks\n"
	@printf "  make smoke            Run static + browser smoke checks\n"
	@printf "  make poc-template     Generate page-template technology POC\n"
	@printf "  make stage-06-08-screenshots Capture Stage 6.8 sunset baseline screenshots\n"
	@printf "  make stage-06-14-audio Capture Stage 6.14 audio lifecycle/network baseline\n"
	@printf "  make stage-06-15-audio Verify Stage 6.15 lazy audio preload behavior\n"
	@printf "  make stage-06-17-sunset-webp Verify Stage 6.17 sunset WebP screenshots\n"
	@printf "  make stage-06-18-scene-jpg-screenshots Capture Stage 6.18 scene JPG baseline screenshots\n"
	@printf "  make stage-06-19-tumski11-webp-poc Verify Stage 6.19 tumski11 WebP candidate screenshots\n"
	@printf "  make stage-06-20-video-review Capture Stage 6.20 panorama video baseline\n"
	@printf "  make stage-06-21-video-metadata Verify Stage 6.21 panorama video metadata preload\n"
	@printf "  make stage-06-22-video-lazy-source Verify Stage 6.22 panorama video lazy source\n"
	@printf "  make stage-06-23-loading-state Characterize Stage 6.23 slow iframe loading state\n"
	@printf "  make stage-06-24-loading-helper Verify Stage 6.24 loading helper extraction\n"
	@printf "  make cap-sync         Build and sync Android/iOS projects\n"
	@printf "  make android-debug    Build Android debug APK with JDK 21\n"
	@printf "  make cap-open-android Open Android project\n"
	@printf "  make cap-open-ios     Open iOS project\n"
	@printf "  make security         Run npm audit\n"

install:
	npm install

dev: start

build:
	npm run build

start:
	python3 -m http.server $(PORT) --bind 127.0.0.1

lint:
	npm run lint

fix-lint:
	npm run lint:fix

typecheck:
	@printf "No TypeScript typecheck configured for this JavaScript project.\n"

test:
	npm run test

test-e2e:
	E2E_PORT=$(E2E_PORT) npm run test:e2e

smoke:
	E2E_PORT=$(E2E_PORT) npm run smoke

test-watch:
	E2E_PORT=$(E2E_PORT) npm run test:e2e:ui

security:
	npm run security

security-fix:
	npm audit fix

audit:
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test
	$(MAKE) build
	$(MAKE) security

clean:
	rm -rf www

reinstall:
	rm -rf node_modules package-lock.json
	npm install

doctor:
	node --version
	npm --version
	npx cap --version

poc-template:
	node tools/template-poc/generate.mjs

stage-06-08-screenshots:
	E2E_PORT=$(E2E_PORT) npx playwright test --config=playwright.stage-06-08.config.mjs

stage-06-14-audio:
	E2E_PORT=$(E2E_PORT) STAGE_06_AUDIO_EXPECTED=record npx playwright test --config=playwright.stage-06-14.config.mjs

stage-06-15-audio:
	E2E_PORT=$(E2E_PORT) STAGE_06_AUDIO_EXPECTED=lazy STAGE_06_AUDIO_ARTIFACT_DIR=docs/refactoring/artifacts/stage-06-15-audio npx playwright test --config=playwright.stage-06-14.config.mjs

stage-06-17-sunset-webp:
	E2E_PORT=$(E2E_PORT) STAGE_06_SUNSET_ARTIFACT_DIR=docs/refactoring/artifacts/stage-06-17-sunset-webp npx playwright test --config=playwright.stage-06-08.config.mjs
	STAGE_06_SUNSET_CANDIDATE_DIR=docs/refactoring/artifacts/stage-06-17-sunset-webp node tools/stage-06-17/compare-sunset-screenshots.mjs

stage-06-18-scene-jpg-screenshots:
	E2E_PORT=$(E2E_PORT) npx playwright test --config=playwright.stage-06-18.config.mjs

stage-06-19-tumski11-webp-poc:
	E2E_PORT=$(E2E_PORT) npx playwright test --config=playwright.stage-06-19.config.mjs
	STAGE_06_TUMSKI11_ALLOW_FAILURES=1 node tools/stage-06-19/compare-tumski11-screenshots.mjs

stage-06-20-video-review:
	E2E_PORT=$(E2E_PORT) npx playwright test --config=playwright.stage-06-20.config.mjs

stage-06-21-video-metadata:
	E2E_PORT=$(E2E_PORT) STAGE_06_VIDEO_EXPECTED_PRELOAD=metadata STAGE_06_VIDEO_ARTIFACT_DIR=docs/refactoring/artifacts/stage-06-21-video-metadata npx playwright test --config=playwright.stage-06-20.config.mjs

stage-06-22-video-lazy-source:
	E2E_PORT=$(E2E_PORT) STAGE_06_VIDEO_EXPECTED_PRELOAD=none STAGE_06_VIDEO_ARTIFACT_DIR=docs/refactoring/artifacts/stage-06-22-video-lazy-source npx playwright test --config=playwright.stage-06-20.config.mjs

stage-06-23-loading-state:
	E2E_PORT=$(E2E_PORT) npx playwright test --config=playwright.stage-06-23.config.mjs

stage-06-24-loading-helper:
	E2E_PORT=$(E2E_PORT) STAGE_06_LOADING_ARTIFACT_DIR=docs/refactoring/artifacts/stage-06-24-loading-helper npx playwright test --config=playwright.stage-06-23.config.mjs

cap-sync:
	npm run cap:sync

cap-copy:
	npm run cap:copy

cap-add-android:
	npm run cap:add:android

cap-add-ios:
	npm run cap:add:ios

cap-open-android:
	npm run cap:open:android

cap-open-ios:
	npm run cap:open:ios

android-debug:
	cd android && JAVA_HOME="$(CAPACITOR_JAVA_HOME)" ./gradlew assembleDebug
