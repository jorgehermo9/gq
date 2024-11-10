import { MAX_HISTORY_QUERY_SIZE, MAX_QUERY_HISTORY_SIZE } from "@/lib/constants";
import { HistoryItem } from "@/model/history-item";
import { type IDBPDatabase, deleteDB, openDB } from "idb";

const DB_NAME = "gq";
const DB_VERSION = 2;
const QUERIES_STORE_NAME = "queries";
const TEMPLATES_STORE_NAME = "templates";

let dbConnection: Promise<IDBPDatabase>;

const createStore = (db: IDBPDatabase, storeName: string) => {
	if (!db.objectStoreNames.contains(storeName)) {
		const store = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
		store.createIndex("timestamp", "timestamp", { unique: false });
		store.createIndex("content", "content", { unique: false });
	}
};

const getDatabase = (): Promise<IDBPDatabase> => {
	if (!dbConnection) {
		dbConnection = openDB(DB_NAME, DB_VERSION, {
			upgrade(db) {
				createStore(db, QUERIES_STORE_NAME);
				createStore(db, TEMPLATES_STORE_NAME);
			},
		});
	}
	return dbConnection;
};

export const addQuery = async (
	content: string,
): Promise<[HistoryItem | undefined, HistoryItem | undefined]> => {
	return addItem(QUERIES_STORE_NAME, MAX_QUERY_HISTORY_SIZE, content);
};

export const addTemplate = async (
	content: string,
): Promise<[HistoryItem | undefined, HistoryItem | undefined]> => {
	return addItem(TEMPLATES_STORE_NAME, MAX_HISTORY_QUERY_SIZE, content);
};

export const getPaginatedQueries = async (
	page: number,
	limit: number,
	query?: string,
	reverse = true,
): Promise<[HistoryItem[], hasMore: boolean]> => {
	return getPaginatedItems(QUERIES_STORE_NAME, page, limit, query, reverse);
};

export const getPaginatedTemplates = async (
	page: number,
	limit: number,
	query?: string,
	reverse = true,
): Promise<[HistoryItem[], hasMore: boolean]> => {
	return getPaginatedItems(TEMPLATES_STORE_NAME, page, limit, query, reverse);
};

export const deleteQuery = async (id: number) => {
	await deleteItem(QUERIES_STORE_NAME, id);
};

export const deleteTemplate = async (id: number) => {
	await deleteItem(TEMPLATES_STORE_NAME, id);
};

const addItem = async (
	storeName: string,
	maxSize: number,
	content: string,
): Promise<[HistoryItem | undefined, HistoryItem | undefined]> => {
	if (!content || content.length > maxSize) return [undefined, undefined];
	const newestItem = (await getPaginatedItems(storeName, 0, 1))[0][0];
	if (newestItem?.content === content) return [undefined, undefined]; // Avoid adding consecutive duplicated items
	let oldestItem: HistoryItem | undefined;
	if ((await countItems(storeName)) >= maxSize) {
		oldestItem = (await getPaginatedItems(storeName, 0, 1, undefined, false))[0][0];
		oldestItem && (await deleteItem(storeName, oldestItem.id));
	}
	const database = await getDatabase();
	const tx = database.transaction(storeName, "readwrite");
	const store = tx.objectStore(storeName);
	const now = Date.now();
	const key = await store.add({ timestamp: now, content });
	await tx.done;
	return [{ id: Number(key.valueOf()), timestamp: now, content }, oldestItem];
};

const getPaginatedItems = async (
	storeName: string,
	page: number,
	limit: number,
	search?: string,
	reverse = true,
): Promise<[HistoryItem[], hasMore: boolean]> => {
	const database = await getDatabase();
	const tx = database.transaction(storeName, "readonly");
	const store = tx.store;
	const index = store.index("timestamp");

	const items: HistoryItem[] = [];
	let cursor = await index.openCursor(null, reverse ? "prev" : "next");
	let skipped = 0;
	let hasMore = false;

	while (cursor && items.length <= limit) {
		const matches = !search || cursor.value.content.toLowerCase().includes(search.toLowerCase());
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

const deleteItem = async (storeName: string, id: number) => {
	const database = await getDatabase();
	const tx = database.transaction(storeName, "readwrite");
	const store = tx.objectStore(storeName);
	await store.delete(id);
	await tx.done;
};

const countItems = async (storeName: string): Promise<number> => {
	const database = await getDatabase();
	const tx = database.transaction(storeName, "readonly");
	const store = tx.objectStore(storeName);
	const count = await store.count();
	await tx.done;
	return count;
};

export const deleteDatabase = async () => {
	await deleteDB(DB_NAME);
};
