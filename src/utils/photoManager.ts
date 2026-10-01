// Photo manager for Prof. Fabio Gardioli de Carvalho official portrait

const STORAGE_KEY = "fabio_official_photo_custom";
const EVENT_NAME = "creator-photo-updated";

export function getCreatorPhoto(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.startsWith("data:image/")) {
      return saved;
    }
  } catch {
    // ignore
  }
  return "/fabio.jpg";
}

export async function uploadCreatorPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;

        // Save immediately to local storage for zero-lag instant update
        try {
          localStorage.setItem(STORAGE_KEY, base64Data);
        } catch {
          // ignore quota exceeded if any
        }

        // Notify all components in the app
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { url: base64Data } }));

        // Send to backend server to persist permanently in /public and /dist
        try {
          const res = await fetch("/api/creator/photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64Data })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { url: data.url } }));
            }
          }
        } catch (serverErr) {
          console.warn("Could not save to backend server, relying on client storage:", serverErr);
        }

        resolve(base64Data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo de imagem"));
    reader.readAsDataURL(file);
  });
}

export function subscribeCreatorPhoto(callback: (url: string) => void) {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ url: string }>;
    if (customEvent.detail?.url) {
      callback(customEvent.detail.url);
    }
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
