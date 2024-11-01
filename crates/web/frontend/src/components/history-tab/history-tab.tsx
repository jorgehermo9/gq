import { SidebarContent, SidebarDescription, SidebarHeader, SidebarTitle } from "../ui/sidebar";
import { Input } from "../ui/input";
import { MutableRefObject, useCallback, useEffect, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { UserQuery } from "@/model/user-query";
import { addQuery, deleteQuery, getPaginatedQueries } from "@/services/queries/queries";
import SimpleEditor from "../editor/simple-editor";
import { groupQueries } from "./history-tab-utils";
import { capitalize, cn, countLines } from "@/lib/utils";
import { Action } from "@radix-ui/react-alert-dialog";
import ActionButton from "../action-button/action-button";
import { Redo, Trash, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";

interface Props {
	onClickQuery: (queryContent: string) => void;
	addNewQueryCallback: MutableRefObject<(queryContent: string) => void>;
	className?: string;
}

const HistoryTab = ({ onClickQuery, addNewQueryCallback, className }: Props) => {
	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [queries, setQueries] = useState<UserQuery[]>([]);
	const debounce = useDebounce();

	const handleSearch = useCallback(async (value: string) => {
		setCurrentPage(0);
		const [matchingQueries, hasMore] = await getPaginatedQueries(0, 20, value);
		setHasMore(hasMore);
		setQueries(matchingQueries);
	}, []);

	const handleAddNewQuery = useCallback(
		async (content: string) => {
			const addedQuery = await addQuery(content);
			addedQuery && setQueries([addedQuery, ...queries]);
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

	const handleLoadMore = useCallback(async () => {
		const nextPage = currentPage + 1;
		const [matchingQueries, hasMore] = await getPaginatedQueries(nextPage, 3, search);
		setCurrentPage(nextPage);
		setHasMore(hasMore);
		setQueries((prevQueries) => [...prevQueries, ...matchingQueries]);
	}, [currentPage, search]);

	useEffect(() => debounce(200, () => handleSearch(search)), [search, debounce, handleSearch]);

	useEffect(() => {
		addNewQueryCallback.current = handleAddNewQuery;
	}, [handleAddNewQuery, addNewQueryCallback]);

	return (
		<SidebarContent className={className}>
			<SidebarHeader>
				<SidebarTitle>Query history</SidebarTitle>
				<SidebarDescription>Check the previous queries you have made.</SidebarDescription>
			</SidebarHeader>
			<form className="relative" onSubmit={(e) => e.preventDefault()}>
				<Input
					className={cn("border-x-0 mb-0", search && "border-r")}
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
			{Object.entries(groupQueries(queries)).map((entry) => (
				<div key={entry[0]}>
					<div className="p-2 border-b bg-muted-transparent font-semibold">
						<span className="text-xs">{capitalize(entry[0])}</span>
					</div>
					<AnimatePresence mode="sync">
						{entry[1].map((query) => (
							<motion.div
								// initial={{ left: "100%" }}
								// animate={{ left: 0, transition: { ease: "easeOut", duration: 0.25 } }}
								// exit={{ left: "110%", transition: { ease: "easeOut", duration: 0.25 } }}
								key={query.timestamp}
								className="relative border-b flex justify-between group"
							>
								<SimpleEditor
									className="px-2 py-4 max-h-40 bg-background w-full"
									content={query.content}
								/>
								<div
									className={cn(
										"max-w-0 transition-all",
										countLines(query.content) > 2
											? "group-hover:max-w-10"
											: "group-hover:max-w-20 flex",
									)}
								>
									<ActionButton
										side={countLines(query.content) > 2 ? "right" : "bottom"}
										containerClassName={cn(
											"min-h-10 flex items-center justify-center border-l",
											countLines(query.content) > 2 ? "h-1/2 border-b" : "h-full",
										)}
										className="h-full w-10 border-0"
										description="Dump query into the editor"
										onClick={() => onClickQuery(query.content)}
									>
										<Redo className="w-3 h-3" />
									</ActionButton>
									<ActionButton
										side={countLines(query.content) > 2 ? "right" : "bottom"}
										containerClassName={cn(
											"min-h-10 flex items-center justify-center border-l",
											countLines(query.content) > 2 ? "h-1/2" : "h-full",
										)}
										className="h-full w-10 border-0"
										description="Delete from history"
										onClick={() => handleDeleteQuery(query.id)}
									>
										<Trash className="w-3 h-3" />
									</ActionButton>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			))}
			{hasMore && (
				<Button
					className="text-xs w-full border-0 border-b"
					onClick={() => handleLoadMore()}
					variant="outline"
				>
					Load more
				</Button>
			)}
		</SidebarContent>
	);
};

export default HistoryTab;
