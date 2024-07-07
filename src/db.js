import Dexie from "dexie";

const db = new Dexie("MediaGalleryDB");

db.version(1).stores({
  media: "++id, type, data, description",
});

export default db;
