"use client";

import ApplyButton from "@/components/apply-button/apply-button";
import Editor from "@/components/editor/editor";
import Header from "@/components/header/header";
import useDebounce from "@/hooks/useDebounce";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import { useCallback, useState } from "react";
import { applyGq } from "./page-utils";
import { toast } from "sonner";

const Home = () => {
	const [inputJson, setInputJson] = useState<string>('{}');
	const [inputQuery, setInputQuery] = useState<string>("");
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
	const { gqWorker } = useWorker();

	const updateOutputJson = useCallback(
		async (inputJson: string, inputQuery: string, silent = false) => {
			if (!gqWorker) return;
			try {
				const result = await applyGq(
					inputJson,
					inputQuery,
					jsonTabSize,
					gqWorker,
					silent || autoApply && debounceTime < 500,
				);
				setErrorMessage(undefined);
				setOutputJson(result);
			} catch (err) {
				setErrorMessage(err.message);
			}
		},
		[gqWorker, jsonTabSize, autoApply, debounceTime],
	);

	const onClickExample = useCallback(
		(json: string, query: string) => {
			setInputJson(json);
			setInputQuery(query);
			!autoApply && updateOutputJson(json, query, true);
			toast.success("Example loaded!");
		},
		[autoApply, updateOutputJson],
	);

	useDebounce(
		() => autoApply && updateOutputJson(inputJson, inputQuery),
		debounceTime,
		[inputJson, inputQuery],
	);

	return (
		<main className="flex flex-col items-center p-8 h-screen">
			<Header onClickExample={onClickExample} />
			<section className="mt-4 flex gap-8 items-center justify-center w-full h-[80vh]">
				<aside className="w-[44vw] h-[80vh] flex flex-col gap-8">
					<Editor
						className="w-[44vw] h-[40vh] max-h-[40vh]"
						value={inputJson}
						onChange={setInputJson}
						title="Input"
						defaultFileName="input"
						fileTypes={[FileType.JSON, FileType.YAML]}
					/>
					<Editor
						className="w-[44vw] h-[40vh] max-h-[40vh]"
						value={inputQuery}
						onChange={setInputQuery}
						title="Input"
						defaultFileName="query"
						fileTypes={[FileType.GQ]}
					/>
				</aside>
				<ApplyButton
					autoApply={autoApply}
					onClick={() => updateOutputJson(inputJson, inputQuery)}
				/>
				<aside className="w-[44vw] h-[80vh] flex flex-col">
					<Editor
						className="w-[44vw] h-[80vh]"
						value={outputJson}
						onChange={setOutputJson}
						title="Output"
						editable={false}
						defaultFileName="output"
						fileTypes={[FileType.JSON, FileType.YAML]}
						errorMessage={errorMessage}
					/>
				</aside>
			</section>
		</main>
	);
};

export default Home;
