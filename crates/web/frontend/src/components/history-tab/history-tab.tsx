import useDebounce from "@/hooks/use-debounce";
import { QUERY_HISTORY_PAGE_SIZE, TEMPLATE_HISTORY_PAGE_SIZE } from "@/lib/constants";
import { capitalize, cn, countLines } from "@/lib/utils";
import type { HistoryItem } from "@/model/history-item";
import {
	addQuery,
	addTemplate,
	deleteQuery,
	deleteTemplate,
	getPaginatedQueries,
	getPaginatedTemplates,
} from "@/services/history/history-service";
import { TabsContent } from "@radix-ui/react-tabs";
import { AnimatePresence } from "framer-motion";
import { Code, Search, SquareDashed, X } from "lucide-react";
import { type MutableRefObject, useCallback, useEffect, useState } from "react";
import { DumpBlock } from "../dump-block/dump-block";
import SimpleEditor from "../editor/simple-editor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SidebarContent, SidebarDescription, SidebarHeader, SidebarTitle } from "../ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { groupItems } from "./history-tab-utils";

interface HistoryTabContentProps {
	value: string;
	items: HistoryItem[];
	onClickItem: (content: string) => void;
	onDeleteItem: (id: number) => void;
	hasMore: boolean;
	onLoadMore: () => void;
}

const HistoryTabContent = ({
	value,
	items,
	onClickItem,
	onDeleteItem,
	hasMore,
	onLoadMore,
}: HistoryTabContentProps) => {
	return (
		<TabsContent value={value}>
			{items.length === 0 ? (
				<div className="w-full mt-8 flex gap-2 items-center justify-center">
					<Search className="w-3 h-3" />
					<span className="text-xs">There is nothing here</span>
				</div>
			) : (
				Object.entries(groupItems(items)).map((entry) => (
					<div key={entry[0]}>
						<div className="p-2 border-b bg-muted-transparent font-semibold">
							<span className="text-xs">{capitalize(entry[0])}</span>
						</div>
						<AnimatePresence mode="sync">
							{entry[1].map((item) => (
								<DumpBlock
									key={item.timestamp}
									className="border-b"
									lines={countLines(item.content)}
									onDump={() => onClickItem(item.content)}
									onDelete={() => onDeleteItem(item.id)}
									onDumpMessage="Query dumped into the editor"
									onDeleteMessage="Query deleted from history"
								>
									<SimpleEditor
										className="px-2 py-4 max-h-40 bg-background w-full text-nowrap"
										content={item.content}
									/>
								</DumpBlock>
							))}
						</AnimatePresence>
					</div>
				))
			)}
			{hasMore && (
				<Button
					className="text-xs w-full border-0 border-b"
					onClick={() => onLoadMore()}
					variant="outline"
				>
					Load more
				</Button>
			)}
		</TabsContent>
	);
};

interface Props {
	onClickQuery: (queryContent: string) => void;
	onClickTemplate: (templateContent: string) => void;
	addNewQueryCallback: MutableRefObject<(queryContent: string) => void>;
	addNewTemplateCallback: MutableRefObject<(templateContent: string) => void>;
	className?: string;
}

const HistoryTab = ({
	onClickQuery,
	onClickTemplate,
	addNewQueryCallback,
	addNewTemplateCallback,
	className,
}: Props) => {
	const [search, setSearch] = useState("");
	const [currentQueriesPage, setCurrentQueriesPage] = useState(0);
	const [currentTemplatesPage, setCurrentTemplatesPage] = useState(0);
	const [hasMoreQueries, setHasMoreQueries] = useState(false);
	const [hasMoreTemplates, setHasMoreTemplates] = useState(false);
	const [queries, setQueries] = useState<HistoryItem[]>([]);
	const [templates, setTemplates] = useState<HistoryItem[]>([]);
	const debounce = useDebounce();

	const handleSearch = useCallback(async (value: string) => {
		setCurrentQueriesPage(0);
		setCurrentTemplatesPage(0);
		const [matchingQueries, hasMore] = await getPaginatedQueries(0, QUERY_HISTORY_PAGE_SIZE, value);
		const [matchingTemplates, hasMoreTemplates] = await getPaginatedTemplates(
			0,
			TEMPLATE_HISTORY_PAGE_SIZE,
			value,
		);
		setHasMoreQueries(hasMore);
		setHasMoreTemplates(hasMoreTemplates);
		setQueries(matchingQueries);
		setTemplates(matchingTemplates);
	}, []);

	const handleAddNewQuery = useCallback(
		async (content: string) => {
			const [addedQuery, deletedQuery] = await addQuery(content);
			const newQueries = deletedQuery
				? queries.filter((query) => query.id !== deletedQuery.id)
				: queries;
			addedQuery && newQueries.unshift(addedQuery);
			setQueries([...newQueries]);
		},
		[queries],
	);

	const handleDeleteQuery = useCallback(
		async (id: number) => {
			await deleteQuery(id);
			setQueries(queries.filter((query) => query.id !== id));
		},
		[queries],
	);

	const handleLoadMoreQueries = useCallback(async () => {
		const nextPage = currentQueriesPage + 1;
		const [matchingQueries, hasMore] = await getPaginatedQueries(
			nextPage,
			QUERY_HISTORY_PAGE_SIZE,
			search,
		);
		setCurrentQueriesPage(nextPage);
		setHasMoreQueries(hasMore);
		setQueries((prevQueries) => [...prevQueries, ...matchingQueries]);
	}, [currentQueriesPage, search]);

	const handleAddNewTemplate = useCallback(
		async (content: string) => {
			const [addedTemplate, deletedTemplate] = await addTemplate(content);
			const newTemplates = deletedTemplate
				? templates.filter((template) => template.id !== deletedTemplate.id)
				: templates;
			addedTemplate && newTemplates.unshift(addedTemplate);
			setTemplates([...newTemplates]);
		},
		[templates],
	);

	const handleDeleteTemplate = useCallback(
		async (id: number) => {
			await deleteTemplate(id);
			setTemplates(templates.filter((template) => template.id !== id));
		},
		[templates],
	);

	const handleLoadMoreTemplates = useCallback(async () => {
		const nextPage = currentTemplatesPage + 1;
		const [matchingTemplates, hasMore] = await getPaginatedTemplates(
			nextPage,
			TEMPLATE_HISTORY_PAGE_SIZE,
			search,
		);
		setCurrentTemplatesPage(nextPage);
		setHasMoreTemplates(hasMore);
		setTemplates((prevTemplates) => [...prevTemplates, ...matchingTemplates]);
	}, [currentTemplatesPage, search]);

	useEffect(() => debounce(200, () => handleSearch(search)), [search, debounce, handleSearch]);

	useEffect(() => {
		addNewQueryCallback.current = handleAddNewQuery;
		addNewTemplateCallback.current = handleAddNewTemplate;
	}, [handleAddNewQuery, addNewQueryCallback, handleAddNewTemplate, addNewTemplateCallback]);

	return (
		<SidebarContent className={className}>
			<SidebarHeader>
				<SidebarTitle>History</SidebarTitle>
				<SidebarDescription>
					Check the previous queries and templates you have made.
				</SidebarDescription>
			</SidebarHeader>
			<form className="relative" onSubmit={(e) => e.preventDefault()}>
				<Input
					className="border-x-0 mb-0"
					onChange={(e) => setSearch(e.target.value)}
					value={search}
					placeholder="Type to search..."
				/>
				<Button
					className={cn(
						"absolute right-0 top-0 p-2 transition-all",
						search ? "visible opacity-100" : "invisible opacity-0",
					)}
					variant="ghost"
					type="button"
					onClick={() => setSearch("")}
				>
					<X className="w-3 h-3" />
				</Button>
			</form>
			<Tabs defaultValue="queries">
				<TabsList className="flex">
					<TabsTrigger
						value="queries"
						className="flex gap-2 items-center justify-center w-1/2 py-4"
						variant="outline"
					>
						<Code className="w-3.5 h-3.5" />
						<span className="text-xs">Queries</span>
					</TabsTrigger>

					<TabsTrigger
						value="templates"
						className="flex gap-2 items-center justify-center w-1/2 py-4"
						variant="outline"
					>
						<SquareDashed className="w-3.5 h-3.5" />
						<span className="text-xs">Templates</span>
					</TabsTrigger>
				</TabsList>
				<HistoryTabContent
					value="queries"
					items={queries}
					onClickItem={onClickQuery}
					onDeleteItem={handleDeleteQuery}
					hasMore={hasMoreQueries}
					onLoadMore={handleLoadMoreQueries}
				/>
				<HistoryTabContent
					value="templates"
					items={templates}
					onClickItem={onClickTemplate}
					onDeleteItem={handleDeleteTemplate}
					hasMore={hasMoreTemplates}
					onLoadMore={handleLoadMoreTemplates}
				/>
			</Tabs>
		</SidebarContent>
	);
};

export default HistoryTab;
