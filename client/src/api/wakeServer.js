/**
 * wakeServer.js
 *
 * Render's free tier spins the server down after ~15 min of inactivity.
 * The first real request (e.g. register/login) then hits a sleeping server,
 * gets no CORS headers on the OPTIONS preflight, and fails with:
 *   – CORS policy blocked
 *   – net::ERR_FAILED
 *   – 404 (server not yet responding)
 *
 * This utility fires a lightweight GET /api/ping as soon as the app loads
 * so the server is warm by the time the user submits a form.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const wakeServer = async () => {
  // Only ping in production (Render cold-start only affects deployed env)
  if (import.meta.env.DEV) return;

  try {
    await fetch(`${API_URL}/ping`, {
      method: 'GET',
      // No credentials needed for the ping – keep it as simple as possible
    });
    console.log('[wakeServer] Server is awake ✓');
  } catch {
    // Ignore – the ping is best-effort; real requests will retry
    console.warn('[wakeServer] Server ping failed – it may still be cold-starting.');
  }
};
