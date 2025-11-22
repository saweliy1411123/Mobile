import * as SQLite from 'expo-sqlite';

const createMarkersTable = `
  CREATE TABLE IF NOT EXISTS markers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const createMarkerImagesTable = `
  CREATE TABLE IF NOT EXISTS marker_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marker_id INTEGER NOT NULL,
    uri TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
  );
`;


export async function initDatabase() { 
  const db = await SQLite.openDatabaseAsync('markers.db');
  const LATEST_VERSION = 1;

  try {
    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = result?.user_version ?? 0;
    console.log(`Версия базы данных: ${currentVersion}`);

    if (currentVersion >= LATEST_VERSION) {
      console.log('База данных в актуальном состоянии.');
    } else {
      console.log('Применяется схема версии 1...');
      await db.execAsync(`
        PRAGMA journal_mode = 'wal';
        ${createMarkersTable}
        ${createMarkerImagesTable}
        PRAGMA user_version = ${LATEST_VERSION};
      `);
      console.log(`Версия схемы установлена на ${LATEST_VERSION}.`);
    }

    console.log('База данных успешно инициализирована');
    return db;
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    throw error;
  }
}
