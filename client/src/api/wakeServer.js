/**
 * wakeServer.js
 *
 * Render's free tier spins the server down after ~15 min of inactivity.
 * The first real request (e.g. register/login) then hits a sleeping server,
 * gets no CORS headers on the OPTIONS preflight, and fails with:
 *   – CORS policy blocked
 *   – net::ERR_FAILED
 *   – 502 (server still spinning up)
 *
 * This utility fires a lightweight GET /api/ping with retries as soon as 
 * the app loads so the server is warm by the time the user submits a form.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Attempt to wake the server with exponential backoff retry
 */
export const wakeServer = async () => {
  // Only ping in production (Render cold-start only affects deployed env)
  if (import.meta.env.DEV) {
    console.log('[wakeServer] Skipping in development mode');
    return;
  }

  const maxRetries = 3;
  let attempt = 0;

  const pingWithRetry = async () => {
    attempt++;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(`${API_URL}/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit', // Don't send credentials for ping
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('[wakeServer] ✓ Server is awake');
        return true;
      } else if (response.status === 502 && attempt < maxRetries) {
        console.warn(`[wakeServer] 502 Bad Gateway (attempt ${attempt}/${maxRetries}) – server may be cold-starting. Retrying...`);
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        return pingWithRetry();
      } else {
        console.warn(`[wakeServer] Got status ${response.status}. Server may still be starting.`);
        return false;
      }
    } catch (error) {
      if (attempt < maxRetries) {
        console.warn(`[wakeServer] Attempt ${attempt}/${maxRetries} failed (${error.message}). Retrying...`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        return pingWithRetry();
      } else {
        console.warn(`[wakeServer] All ${maxRetries} attempts failed. Server may take longer to wake up.`);
        return false;
      }
    }
  };

  return pingWithRetry();
};
