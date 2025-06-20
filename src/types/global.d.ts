
export {}; // ← evita conflictos con el scope global

declare global {
  interface Window {
    hideAlert: () => void;
    showAlert: () => void;
  }
}