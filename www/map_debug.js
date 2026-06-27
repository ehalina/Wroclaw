const DEBUG_STORAGE_KEYS = ['DEBUG_MAP', '__quest_debug'];

function readStorageFlag(root, key) {
    try {
        const value = root.localStorage?.getItem(key);
        return value === '1' || value === 'true';
    } catch (_) {
        return false;
    }
}

function isEnabled(root = window) {
    try {
        if (root.DEBUG_MAP === true || root.DEBUG_MAP === '1' || root.DEBUG_MAP === 'true') {
            return true;
        }

        return DEBUG_STORAGE_KEYS.some((key) => readStorageFlag(root, key));
    } catch (_) {
        return false;
    }
}

function write(method, args) {
    if (!isEnabled()) {
        return;
    }

    try {
        const logger = console[method] || console.log;
        logger.call(console, '[map]', ...args);
    } catch (_) {}
}

export const MapDebug = {
    isEnabled,
    log(...args) {
        write('log', args);
    },
    warn(...args) {
        write('warn', args);
    },
    error(...args) {
        write('error', args);
    },
    info(...args) {
        write('info', args);
    },
    debug(...args) {
        write('debug', args);
    }
};

try {
    window.MapDebug = MapDebug;
} catch (_) {}
