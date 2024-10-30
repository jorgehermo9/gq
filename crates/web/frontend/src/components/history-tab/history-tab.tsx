import { SidebarContent, SidebarDescription, SidebarHeader, SidebarTitle } from "../ui/sidebar";
import { Input } from "../ui/input";
import { MutableRefObject, useCallback, useEffect, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { UserQuery } from "@/model/user-query";
import { addQuery, getPaginatedQueries } from "@/services/queries/queries";
import SimpleEditor from "../editor/simple-editor";
import { groupQueries } from "./history-tab-utils";
import { capitalize } from "@/lib/utils";

interface Props {
	onClickQuery: (queryContent: string) => void;
	addNewQueryCallback: MutableRefObject<(queryContent: string) => void>;
	className?: string;
}

const HistoryTab = ({ onClickQuery, addNewQueryCallback, className }: Props) => {
	const [search, setSearch] = useState("");
	const [queries, setQueries] = useState<UserQuery[]>([]);
	const debounce = useDebounce(500);

	const handleSearch = useCallback((value: string) => {
		console.log("search", value);
	}, []);

	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			handleSearch(search);
		},
		[search, handleSearch],
	);

	const handleAddNewQuery = useCallback(
		async (content: string) => {
			const lastQuery = queries[0];
			if (lastQuery?.content === content) return; // Avoid adding consecutive duplicated queries
			const addedQuery = await addQuery(content);
			setQueries([addedQuery, ...queries]);
		},
		[queries],
	);

	useEffect(() => {
		debounce(() => handleSearch(search));
	}, [search, debounce, handleSearch]);

	useEffect(() => {
		getPaginatedQueries(0, 100).then((data) => setQueries(data));
	}, []);

	useEffect(() => {
		addNewQueryCallback.current = handleAddNewQuery;
	}, [handleAddNewQuery, addNewQueryCallback]);

	return (
		<SidebarContent className={className}>
			<SidebarHeader>
				<SidebarTitle>Query history</SidebarTitle>
				<SidebarDescription>Check the previous queries you have made.</SidebarDescription>
			</SidebarHeader>
			<form onSubmit={handleSubmit}>
				<Input
					className="border-x-0 mb-0"
					onChange={(e) => setSearch(e.target.value)}
					value={search}
					placeholder="Type to search..."
				/>
			</form>
			<div>
				{Object.entries(groupQueries(queries)).map((entry) => (
					<div key={entry[0]}>
						<div className="p-2 border-b bg-muted-transparent font-semibold">
							<span className="text-xs">{capitalize(entry[0])}</span>
						</div>
						{entry[1].map((query) => (
							<div
								key={query.timestamp}
								className="px-2 py-4 border-b cursor-pointer"
								onKeyDown={(e) => e.key === "Enter" && onClickQuery(query.content)}
								onClick={() => onClickQuery(query.content)}
							>
								<SimpleEditor className="max-h-40 bg-background" content={query.content} />
							</div>
						))}
					</div>
				))}
			</div>
		</SidebarContent>
	);
};

export default HistoryTab;
