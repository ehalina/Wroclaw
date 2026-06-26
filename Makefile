CAPACITOR_JAVA_HOME ?= /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
PORT ?= 5173

.PHONY: help install dev build start lint fix-lint typecheck test test-watch security security-fix audit clean reinstall doctor cap-sync cap-copy cap-add-android cap-add-ios cap-open-android cap-open-ios android-debug

help:
	@printf "Available commands:\n"
	@printf "  make install          Install npm dependencies\n"
	@printf "  make dev              Start static dev server on http://localhost:$(PORT)\n"
	@printf "  make build            Build Capacitor web assets into www/\n"
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
	@printf "No linter configured for this static JavaScript project.\n"

fix-lint: lint

typecheck:
	@printf "No TypeScript typecheck configured for this JavaScript project.\n"

test:
	@printf "No automated test suite configured yet.\n"

test-watch: test

security:
	npm run security

security-fix:
	npm audit fix

audit:
	npm run build
	npm run security

clean:
	rm -rf www

reinstall:
	rm -rf node_modules package-lock.json
	npm install

doctor:
	node --version
	npm --version
	npx cap --version

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
