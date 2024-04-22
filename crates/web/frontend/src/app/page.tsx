"use client";

import ApplyButton from "@/components/apply-button/apply-button";
import Editor from "@/components/editor/editor";
import Header from "@/components/header/header";
import useDebounce from "@/hooks/useDebounce";
import useGq from "@/hooks/useGq";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const Home = () => {
	const [inputJson, setInputJson] = useState<string>('{"test": 1213}');
	const [inputQuery, setInputQuery] = useState<string>("{}");
	const [outputJson, setOutputJson] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);
	const {
		settings: {
			autoApplySettings: { autoApply, debounceTime },
			formattingSettings: { jsonTabSize },
		},
	} = useSettings();
	const gqWorker = useGq();

	const onClickExample = useCallback((json: string, query: string) => {
		setInputJson(json);
		setInputQuery(query);
		toast.success("Example imported to editor!");
	}, []);

	const updateOutputJson = useCallback(() => {
		if (!gqWorker) return;
		const toastId = toast.loading("Applying query to JSON...");
		gqWorker
			.postMessage({
				query: inputQuery,
				json: inputJson,
				indent: jsonTabSize,
			})
			.then((res) => {
				toast.success("Query applied to JSON", { id: toastId });
				setErrorMessage(undefined);
				setOutputJson(res);
			})
			.catch((err) => {
				toast.error("Error while applying query to JSON", {
					id: toastId,
					duration: 5000,
				});
				setErrorMessage(err.message);
			});
	}, [inputJson, inputQuery, gqWorker, jsonTabSize]);

	useDebounce(() => autoApply && updateOutputJson(), debounceTime, [
		inputJson,
		inputQuery,
	]);

	return (
		<main className="flex flex-col items-center p-8 h-screen">
			<Header onClickExample={onClickExample} />
			<section className="mt-4 flex gap-8 items-center justify-center w-full h-[80vh]">
				<aside className="w-[44vw] h-[80vh] flex flex-col gap-8">
					<Editor
						className="w-[44vw] h-[40vh] max-h-[40vh]"
						value={inputJson}
						onChange={setInputJson}
						title="Input JSON"
						defaultFileName="input"
						fileType={FileType.JSON}
					/>
					<Editor
						className="w-[44vw] h-[40vh] max-h-[40vh]"
						value={inputQuery}
						onChange={setInputQuery}
						title="Input Query"
						defaultFileName="query"
						fileType={FileType.GQ}
					/>
				</aside>
				<ApplyButton autoApply={autoApply} onClick={updateOutputJson} />
				<aside className="w-[44vw] h-[80vh] flex flex-col">
					<Editor
						className="w-[44vw] h-[80vh]"
						value={outputJson}
						onChange={setOutputJson}
						title="Output JSON"
						editable={false}
						defaultFileName="output"
						fileType={FileType.JSON}
						errorMessage={errorMessage}
					/>
				</aside>
			</section>
		</main>
	);
};

export default Home;
