import { MAX_QUERY_SIZE } from "@/lib/constants";
import type { UserQuery } from "@/model/user-query";
import { deleteDB, type IDBPDatabase, openDB } from "idb";
import { skip } from "node:test";
import { boolean } from "zod";

const DB_NAME = "gq";
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

export const addQuery = async (content: string): Promise<UserQuery | undefined> => {
	// TODO: Handle MAX_HISTORY_SIZE
	if (!content || content.length > MAX_QUERY_SIZE) return;
	const lastQuery = (await getPaginatedQueries(0, 1))[0][0];
	if (lastQuery?.content === content) return; // Avoid adding consecutive duplicated queries
	const database = await getDatabase();
	const tx = database.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	const now = Date.now();
	const key = await store.add({ timestamp: now, content });
	await tx.done;
	return { id: Number(key.valueOf()), timestamp: now, content };
};

export const getPaginatedQueries = async (
	page = 0,
	limit = 10,
	query?: string,
): Promise<[UserQuery[], hasMore: boolean]> => {
	const database = await getDatabase();
	const tx = database.transaction(STORE_NAME, "readonly");
	const store = tx.store;
	const index = store.index("timestamp");

	const items: UserQuery[] = [];
	let cursor = await index.openCursor(null, "prev");
	let skipped = 0;
	let hasMore = false;

	while (cursor && items.length <= limit) {
		const matches = !query || cursor.value.content.toLowerCase().includes(query.toLowerCase());
		if (items.length === limit && matches) {
			hasMore = true;
			break;
		}
		if (matches && skipped >= page * limit) {
			items.push(cursor.value);
		}
		matches && skipped++;
		cursor = await cursor.continue();
	}

	await tx.done;
	return [items, hasMore];
};

export const deleteQuery = async (id: number) => {
	const database = await getDatabase();
	const tx = database.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	await store.delete(id);
	await tx.done;
};

export const deleteDatabase = async () => {
	await deleteDB(DB_NAME);
};
