import type { UserQuery } from "@/model/user-query";
import { type IDBPDatabase, openDB } from "idb";

const DB_NAME = "gqDB";
const DB_VERSION = 1;
const STORE_NAME = "queries";

let dbConnection: Promise<IDBPDatabase>;

export const getDatabase = (): Promise<IDBPDatabase> => {
	if (!dbConnection) {
		dbConnection = openDB(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
					store.createIndex("timestamp", "timestamp", { unique: false });
					store.createIndex("content", "content", { unique: false });
				}
			},
		});
	}
	return dbConnection;
};

export const addQuery = async (content: string) => {
	const database = await getDatabase();
	const tx = database.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	await store.add({ timestamp: Date.now(), content });
	await tx.done;
};

export const getPaginatedQueries = async (page = 0, limit = 10): Promise<UserQuery[]> => {
	const database = await getDatabase();
	const store = database.transaction(STORE_NAME, "readonly").store;
	const index = store.index("timestamp");

	const items: UserQuery[] = [];
	let cursor = await index.openCursor(null, "prev");
	let skipped = 0;

	while (cursor && items.length < limit) {
		if (skipped >= page * limit) {
			items.push(cursor.value);
		}
		cursor = await cursor.continue();
		skipped++;
	}

	return items;
};

export const searchQueries = async (query: string): Promise<UserQuery[]> => {
	const database = await getDatabase();
	const store = database.transaction(STORE_NAME, "readonly").store;
	const index = store.index("content");
	const results: UserQuery[] = [];

	let cursor = await index.openCursor();
	while (cursor) {
		if (cursor.value.content.toLowerCase().includes(query.toLowerCase())) {
			results.push(cursor.value);
		}
		cursor = await cursor.continue();
	}

	return results;
};

export const deleteQuery = async (id: number) => {
	const database = await getDatabase();
	const tx = database.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	await store.delete(id);
	await tx.done;
};
