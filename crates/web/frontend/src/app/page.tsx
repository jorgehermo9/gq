"use client";

import ActionButton from "@/components/action-button/action-button";
import ApplyButton from "@/components/apply-button/apply-button";
import Editor from "@/components/editor/editor";
import Header from "@/components/header/header";
import useDebounce from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { type Data, empty } from "@/model/data";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import { Link2, Link2Off } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { applyGq } from "./page-utils";
import styles from "./page.module.css";

const Home = () => {
	const [inputData, setInputData] = useState<Data>(empty(FileType.JSON));
	const [inputQuery, setInputQuery] = useState<Data>(empty(FileType.GQ));
	const [outputData, setOutputData] = useState<Data>(empty(FileType.JSON));
	const [linked, setLinked] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);
	const [warningMessages, setWarningMessages] = useState<string[]>([]);
	const [inputEditorFocused, setInputEditorFocused] = useState(false);
	const [queryEditorFocused, setQueryEditorFocused] = useState(false);
	const [outputEditorFocused, setOutputEditorFocused] = useState(false);
	const convertInputEditorCallback = useRef<(fileType: FileType) => void>();
	const convertOutputEditorCallback = useRef<(fileType: FileType) => void>();
	const {
		settings: {
			autoApplySettings: { autoApply, debounceTime },
			formattingSettings: { dataTabSize },
		},
	} = useSettings();
	const { gqWorker } = useWorker();

	const updateOutputData = useCallback(
		async (inputData: Data, inputQuery: Data, silent = false) => {
			if (!gqWorker) return;
			try {
				const result = await applyGq(
					inputData,
					inputQuery,
					outputData.type,
					dataTabSize,
					gqWorker,
					silent || (autoApply && debounceTime < 500),
				);
				setErrorMessage(undefined);
				setOutputData(result);
			} catch (err) {
				setErrorMessage(err.message);
				setWarningMessages([]);
			}
		},
		[gqWorker, dataTabSize, autoApply, debounceTime, outputData.type],
	);

	const handleClickExample = useCallback(
		(json: Data, query: Data) => {
			setInputData(json);
			setInputQuery(query);
			!autoApply && updateOutputData(json, query, true);
			toast.success("Example loaded!");
		},
		[autoApply, updateOutputData],
	);

	const handleChangeInputDataFileType = useCallback(
		(fileType: FileType) => {
			linked && convertOutputEditorCallback.current?.(fileType);
		},
		[linked],
	);

	const handleChangeOutputDataFileType = useCallback(
		(fileType: FileType) => {
			linked && convertInputEditorCallback.current?.(fileType);
		},
		[linked],
	);

	const handleChangeLinked = useCallback(() => {
		setLinked(!linked);
		toast.info(`${linked ? "Unlinked" : "Linked"} editors!`);
		if (linked) return;
		handleChangeOutputDataFileType(inputData.type);
	}, [linked, inputData, handleChangeOutputDataFileType]);

	useDebounce(
		() => autoApply && updateOutputData(inputData, inputQuery),
		debounceTime,
		[inputData, inputQuery],
	);

	return (
		<main className="flex flex-col items-center p-8 h-screen">
			<Header onClickExample={handleClickExample} />
			<section className="mt-4 flex items-center justify-center w-full h-[80vh]">
				<aside className="w-[44vw] h-[80vh] flex flex-col gap-8">
					<Editor
						className="w-[44vw] h-[40vh] max-h-[40vh]"
						data={inputData}
						onChangeData={setInputData}
						focused={inputEditorFocused}
						onChangeFocused={setInputEditorFocused}
						onChangeFileType={handleChangeInputDataFileType}
						title="Input"
						defaultFileName="input"
						fileTypes={[FileType.JSON, FileType.YAML]}
						convertCodeCallback={convertInputEditorCallback}
					/>

					<Editor
						className="w-[44vw] h-[40vh] max-h-[40vh]"
						data={inputQuery}
						onChangeData={setInputQuery}
						focused={queryEditorFocused}
						onChangeFocused={setQueryEditorFocused}
						title="Input"
						defaultFileName="query"
						fileTypes={[FileType.GQ]}
					/>
				</aside>
				<div className="h-full flex justify-center items-center px-8 relative">
					<div className="absolute top-40 flex w-full items-center">
						<div
							className={styles.linkLeftBorder}
							data-editor-focused={inputEditorFocused}
							data-linked={linked}
						/>
						<ActionButton
							className={cn(
								"p-2 min-w-max border-2",
								linked ? "border-accent" : "border-accent-background",
							)}
							description={`${
								linked ? "Link" : "Unlink"
							} input and output editor file types`}
							onClick={handleChangeLinked}
						>
							{linked ? (
								<Link2 className="w-3 h-3" />
							) : (
								<Link2Off className="w-3 h-3" />
							)}
						</ActionButton>
						<div
							className={styles.linkRightBorder}
							data-editor-focused={outputEditorFocused}
							data-linked={linked}
						/>
					</div>
					<ApplyButton
						autoApply={autoApply}
						onClick={() => updateOutputData(inputData, inputQuery)}
					/>
				</div>
				<aside className="w-[44vw] h-[80vh] flex flex-col">
					<Editor
						className="w-[44vw] h-[80vh]"
						data={outputData}
						onChangeData={setOutputData}
						focused={outputEditorFocused}
						onChangeFocused={setOutputEditorFocused}
						onChangeFileType={handleChangeOutputDataFileType}
						title="Output"
						editable={false}
						defaultFileName="output"
						fileTypes={[FileType.JSON, FileType.YAML]}
						errorMessage={errorMessage}
						onDismissError={() => setErrorMessage(undefined)}
						warningMessages={warningMessages}
						convertCodeCallback={convertOutputEditorCallback}
					/>
				</aside>
			</section>
		</main>
	);
};

export default Home;
