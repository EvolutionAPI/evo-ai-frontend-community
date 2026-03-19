const DEBUG_KEY = 'evo_widget_debug';


function isDebugEnabled() {
  if (import.meta.env.MODE !== 'production') return true; // Debug enabled in development

  try {
    const qs = new URLSearchParams(window.location.search);

    if (qs.get('debug-widget') === '1') return true; // Allow enable debug via query string

    return sessionStorage.getItem(DEBUG_KEY) === '1'; // Allow enable debug via session storage
  } catch {
    return false;
  }
}

function safe(obj: unknown) {
  // remove sensible things
  const clone =
  typeof structuredClone === 'function'
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj ?? {}));

  if (clone?.websiteToken) clone.websiteToken = '[redacted]';
  if (clone?.xAuthPrefix) clone.xAuthPrefix = '[redacted]';
  if (clone?.token) clone.token = '[redacted]';

  return clone;
}

export function wdebug(event: string, payload?: unknown) {
  if (!isDebugEnabled()) return;
  // usa debug pra não poluir
  console.debug(`${event}`, safe(payload));
}

export function enableWidgetDebug() {
  sessionStorage.setItem(DEBUG_KEY, '1');
}

export function disableWidgetDebug() {
  sessionStorage.removeItem(DEBUG_KEY);
}
