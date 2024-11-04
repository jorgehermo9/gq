import { MAX_HISTORY_SIZE, MAX_QUERY_SIZE } from "@/lib/constants";
import type { UserQuery } from "@/model/user-query";
import { type IDBPDatabase, deleteDB, openDB } from "idb";

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

export const addQuery = async (
	content: string,
): Promise<[UserQuery | undefined, UserQuery | undefined]> => {
	if (!content || content.length > MAX_QUERY_SIZE) return [undefined, undefined];
	const newestQuery = (await getPaginatedQueries(0, 1))[0][0];
	if (newestQuery?.content === content) return [undefined, undefined]; // Avoid adding consecutive duplicated queries
	let oldestQuery: UserQuery | undefined;
	if ((await countQueries()) >= MAX_HISTORY_SIZE) {
		oldestQuery = (await getPaginatedQueries(0, 1, undefined, false))[0][0];
		oldestQuery && (await deleteQuery(oldestQuery.id));
	}
	const database = await getDatabase();
	const tx = database.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	const now = Date.now();
	const key = await store.add({ timestamp: now, content });
	await tx.done;
	return [{ id: Number(key.valueOf()), timestamp: now, content }, oldestQuery];
};

export const getPaginatedQueries = async (
	page: number,
	limit: number,
	query?: string,
	reverse = true,
): Promise<[UserQuery[], hasMore: boolean]> => {
	const database = await getDatabase();
	const tx = database.transaction(STORE_NAME, "readonly");
	const store = tx.store;
	const index = store.index("timestamp");

	const items: UserQuery[] = [];
	let cursor = await index.openCursor(null, reverse ? "prev" : "next");
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

const countQueries = async (): Promise<number> => {
	const database = await getDatabase();
	const tx = database.transaction(STORE_NAME, "readonly");
	const store = tx.objectStore(STORE_NAME);
	const count = await store.count();
	await tx.done;
	return count;
};
