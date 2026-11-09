// Frontend preview only. Replace with a real session when authentication is connected.
const SESSION_KEY = "todo-scheduler:preview-session";

export function hasPreviewSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "active";
  } catch {
    return false;
  }
}

export function startPreviewSession() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "active");
    return true;
  } catch {
    return false;
  }
}
