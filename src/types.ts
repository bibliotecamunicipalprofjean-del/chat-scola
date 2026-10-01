export interface LibibBook {
  id: string; // data-join-id in Libib
  title: string;
  author: string;
  coverUrl: string | null;
  collectionId: string;
  collectionName: string;
  libibUrl: string;
  addedAt?: string;
}

export interface LibibCollection {
  id: string;
  name: string;
  count: number;
  libibUrl: string;
}

export interface CatalogState {
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
