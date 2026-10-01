import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface LibibBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  collectionId: string;
  collectionName: string;
  libibUrl: string;
  addedAt?: string;
}

interface LibibCollection {
  id: string;
  name: string;
  count: number;
  libibUrl: string;
}

interface CatalogCache {
  books: LibibBook[];
  collections: LibibCollection[];
  totalBooks: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
  syncError: string | null;
  sourceUrl: string;
  technicalInfo: {
    publicCatalogUrl: string;
    accountUsername: string;
    detectedCollectionsCount: number;
    availableFields: string[];
    libibLimitationsNote: string;
  };
}

const PUBLIC_CATALOG_URL = "https://www.libib.com/u/bibliotecaebmjjs/l/258160";
const LIBIB_USER_BASE = "https://www.libib.com/u/bibliotecaebmjjs";

const catalogCache: CatalogCache = {
  books: [],
  collections: [],
  totalBooks: 0,
  lastSyncTime: null,
  isSyncing: false,
  syncError: null,
  sourceUrl: PUBLIC_CATALOG_URL,
  technicalInfo: {
    publicCatalogUrl: PUBLIC_CATALOG_URL,
    accountUsername: "bibliotecaebmjjs",
    detectedCollectionsCount: 0,
    availableFields: ["title", "author", "cover_image", "collection", "libib_id"],
    libibLimitationsNote:
      "O Libib disponibiliza no catálogo público (conta Standard sem plano Pro): Título, Autor, Imagem da Capa (CloudFront), Coleção/Categoria e ID do item. Detalhes aprofundados (ISBN, editora e sinopse) não são fornecidos publicamente pela rota pública do Libib, mas o link direto permite visualização na plataforma oficial."
  }
};

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function fetchPublicLibibCatalog(force = false): Promise<CatalogCache> {
  if (catalogCache.isSyncing) {
    return catalogCache;
  }

  catalogCache.isSyncing = true;
  catalogCache.syncError = null;

  try {
    console.log(`[Libib Sync] Starting fetch from ${PUBLIC_CATALOG_URL}...`);
    const pageResponse = await fetch(PUBLIC_CATALOG_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    if (!pageResponse.ok) {
      throw new Error(`Falha ao acessar o Libib público (HTTP ${pageResponse.status})`);
    }

    const html = await pageResponse.text();

    // Parse collections
    const collections: LibibCollection[] = [];
    const collectionRegex =
      /data-library-id="(\d+)"[^>]*><div class="published-library-title">([^<]+)<\/div><span class="published-library-count">(\d+)<\/span>/g;
    let match: RegExpExecArray | null;

    while ((match = collectionRegex.exec(html)) !== null) {
      collections.push({
        id: match[1],
        name: decodeHtmlEntities(match[2]),
        count: parseInt(match[3], 10) || 0,
        libibUrl: `${LIBIB_USER_BASE}/l/${match[1]}`
      });
    }

    console.log(`[Libib Sync] Found ${collections.length} published collections.`);

    const allBooks: LibibBook[] = [];
    const seenIds = new Set<string>();

    for (const col of collections) {
      if (col.count === 0) continue;

      let offset = 0;
      let keepFetching = true;

      while (keepFetching) {
        const form = new URLSearchParams();
        form.append("library_id", col.id);
        form.append("offset", offset.toString());

        const itemsResponse = await fetch(`${LIBIB_USER_BASE}/get-account-items`, {
          method: "POST",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            Referer: `${LIBIB_USER_BASE}/l/${col.id}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: form.toString()
        });

        if (!itemsResponse.ok) {
          console.warn(`[Libib Sync] Failed to fetch items for collection ${col.name} at offset ${offset}`);
          break;
        }

        const data = (await itemsResponse.json()) as {
          outcome?: string;
          offset?: number;
          limit?: number;
          "item-count"?: number;
          "item-info"?: string;
        };

        const itemsHtml = data["item-info"] || "";
        const itemRegex =
          /<div class="item cover book basic"[^>]*data-join-id="(\d+)"[^>]*>[\s\S]*?<img [^>]*src="([^"]+)"[^>]*alt="([^"]*)"[\s\S]*?<div class="item-title">([\s\S]*?)<\/div>[\s\S]*?<div class="item-author">([\s\S]*?)<\/div>/g;

        let itemMatch: RegExpExecArray | null;
        let countInBatch = 0;

        while ((itemMatch = itemRegex.exec(itemsHtml)) !== null) {
          countInBatch++;
          const bookId = itemMatch[1];
          let rawCover = itemMatch[2];
          const rawAlt = itemMatch[3];
          const rawTitle = itemMatch[4];
          const rawAuthor = itemMatch[5];

          let coverUrl: string | null = rawCover;
          if (coverUrl.includes("missing.png") || !coverUrl.startsWith("http")) {
            if (coverUrl.startsWith("/")) {
              coverUrl = `https://www.libib.com${coverUrl}`;
            } else {
              coverUrl = null;
            }
          }

          const cleanTitle = decodeHtmlEntities(rawTitle || rawAlt);
          const cleanAuthor = decodeHtmlEntities(rawAuthor);

          if (!seenIds.has(bookId)) {
            seenIds.add(bookId);
            allBooks.push({
              id: bookId,
              title: cleanTitle,
              author: cleanAuthor || "Autor não informado",
              coverUrl,
              collectionId: col.id,
              collectionName: col.name,
              libibUrl: `${LIBIB_USER_BASE}/l/${col.id}`
            });
          }
        }

        const limit = data["limit"] || 50;
        const itemCount = data["item-count"] || 0;

        if (itemCount < limit || countInBatch === 0) {
          keepFetching = false;
        } else {
          offset = data["offset"] ?? offset + 50;
        }
      }
    }

    catalogCache.books = allBooks;
    catalogCache.collections = collections;
    catalogCache.totalBooks = allBooks.length;
    catalogCache.lastSyncTime = new Date().toISOString();
    catalogCache.syncError = null;
    catalogCache.technicalInfo.detectedCollectionsCount = collections.length;

    console.log(`[Libib Sync] Successfully synchronized ${allBooks.length} books across ${collections.length} collections!`);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("[Libib Sync] Error during synchronization:", errMessage);
    catalogCache.syncError = errMessage;
  } finally {
    catalogCache.isSyncing = false;
  }

  return catalogCache;
}

// Start initial background sync
fetchPublicLibibCatalog();

// Refresh catalog periodically every 15 minutes
setInterval(() => {
  fetchPublicLibibCatalog();
}, 15 * 60 * 1000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Upload or update official creator photo
  app.post("/api/creator/photo", express.json({ limit: "50mb" }), (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).json({ error: "Imagem em formato base64 é obrigatória." });
      }

      // Remove data URI prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      const publicDir = path.join(process.cwd(), "public");
      const distDir = path.join(process.cwd(), "dist");
      const assetsDir = path.join(process.cwd(), "src", "assets", "images");

      // Save to public
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      fs.writeFileSync(path.join(publicDir, "fabio.jpg"), buffer);
      fs.writeFileSync(path.join(publicDir, "fabio_gardioli.jpg"), buffer);

      // Save to dist if exists
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, "fabio.jpg"), buffer);
        fs.writeFileSync(path.join(distDir, "fabio_gardioli.jpg"), buffer);
      }

      // Save to src/assets/images if exists
      if (fs.existsSync(assetsDir)) {
        fs.writeFileSync(path.join(assetsDir, "fabio.jpg"), buffer);
      }

      console.log(`[Creator Photo] Saved photo successfully (${buffer.length} bytes)`);
      return res.json({
        success: true,
        message: "Foto atualizada com sucesso!",
        url: `/fabio.jpg?t=${Date.now()}`
      });
    } catch (err) {
      console.error("[Creator Photo] Error saving photo:", err);
      return res.status(500).json({ error: "Erro ao salvar foto no servidor." });
    }
  });

  app.get("/api/catalog", (_req, res) => {
    res.json(catalogCache);
  });

  app.post("/api/catalog/sync", async (_req, res) => {
    const result = await fetchPublicLibibCatalog(true);
    res.json({
      success: !result.syncError,
      totalBooks: result.totalBooks,
      lastSyncTime: result.lastSyncTime,
      error: result.syncError
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
