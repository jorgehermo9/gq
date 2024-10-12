"use client";

import ActionButton from "@/components/action-button/action-button";
import ApplyButton from "@/components/apply-button/apply-button";
import Editor from "@/components/editor/editor";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import useDebounce from "@/hooks/useDebounce";
import { cn, i } from "@/lib/utils";
import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { type LoadingState, loading, notLoading } from "@/model/loading-state";
import { setLinkEditors } from "@/model/settings";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import type { CompletionSource } from "@codemirror/autocomplete";
import { Link2, Link2Off } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { applyGq, getQueryCompletionSource, importShare } from "./page-utils";
import styles from "./page.module.css";
import { useParams, usePathname, useSearchParams } from "next/navigation";

const Home = () => {
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
	const [warningMessages, setWarningMessages] = useState<string[]>([]);
	const inputContent = useRef<string>("");
	const queryContent = useRef<string>("");
	const inputType = useRef<FileType>(FileType.JSON);
	const outputType = useRef<FileType>(FileType.JSON);
	const convertInputEditorCallback = useRef<(fileType: FileType) => void>(i);
	const convertOutputEditorCallback = useRef<(fileType: FileType) => void>(i);
	const outputEditorLoadingCallback = useRef<(loading: LoadingState) => void>(i);
	const updateInputEditorCallback = useRef<(data: Data) => void>(i);
	const updateQueryEditorCallback = useRef<(data: Data) => void>(i);
	const updateOutputEditorCallback = useRef<(data: Data) => void>(i);
	const [queryCompletionSource, setQueryCompletionSource] = useState<CompletionSource>();
	const [isApplying, setIsApplying] = useState(false);
	const {
		settings: {
			autoApplySettings: { autoApply, debounceTime },
			formattingSettings: { dataTabSize },
			workspaceSettings: { linkEditors },
		},
		setSettings,
	} = useSettings();
	const debounce = useDebounce(debounceTime);
	const { gqWorker, lspWorker } = useWorker();
	const shareId = useSearchParams().get("id");

	const updateOutputData = useCallback(
		async (inputContent: string, inputType: FileType, queryContent: string, silent = true) => {
			if (!gqWorker || isApplying) return;
			setIsApplying(true);
			outputEditorLoadingCallback.current(
				loading(`Applying query to ${inputType.toUpperCase()}...`),
			);
			try {
				const data = new Data(inputContent, inputType);
				const result = await applyGq(
					data,
					queryContent,
					outputType.current,
					dataTabSize,
					gqWorker,
					silent,
				);
				setErrorMessage(undefined);
				updateOutputEditorCallback.current(result);
			} catch (err) {
				setErrorMessage(err.message);
				setWarningMessages([]);
			} finally {
				setIsApplying(false);
				outputEditorLoadingCallback.current(notLoading());
			}
		},
		[gqWorker, dataTabSize, isApplying],
	);

	const handleClickExample = useCallback(
		(json: Data, query: Data) => {
			updateInputEditorCallback.current(json);
			updateQueryEditorCallback.current(query);
			updateOutputData(json.content, json.type, query.content, true);
			toast.success("Example loaded!");
		},
		[updateOutputData],
	);

	const handleChangeInputDataFileType = useCallback(
		(fileType: FileType) => linkEditors && convertOutputEditorCallback.current(fileType),
		[linkEditors],
	);

	const handleChangeOutputDataFileType = useCallback(
		(fileType: FileType) => linkEditors && convertInputEditorCallback.current(fileType),
		[linkEditors],
	);

	const handleChangeLinked = useCallback(() => {
		setSettings((prev) => setLinkEditors(prev, !linkEditors));
		toast.info(`${linkEditors ? "Unlinked" : "Linked"} editors!`);
		if (linkEditors) return;
		convertOutputEditorCallback.current(inputType.current);
	}, [linkEditors, setSettings]);

	const handleChangeInputContent = useCallback(
		(content: string) => {
			setQueryCompletionSource(() =>
				getQueryCompletionSource(lspWorker, new Data(content, inputType.current)),
			);
			autoApply &&
				debounce(() =>
					updateOutputData(content, inputType.current, queryContent.current, debounceTime < 500),
				);
		},
		[autoApply, debounce, updateOutputData, debounceTime, lspWorker],
	);

	const handleChangeQueryContent = useCallback(
		(content: string) =>
			autoApply &&
			debounce(() =>
				updateOutputData(inputContent.current, inputType.current, content, debounceTime < 500),
			),
		[autoApply, debounce, updateOutputData, debounceTime],
	);

	useEffect(() => {
		if (!shareId) return;
		importShare(shareId).then((data) => {
			updateInputEditorCallback.current(data.input);
			updateQueryEditorCallback.current(data.query);
			// updateOutputData(data.input.content, data.input.type, data.output.content, true);
		});
	}, [shareId]);

	return (
		<main className="flex flex-col items-center pt-4 px-12 h-screen">
			<Header className="w-full mb-8" onClickExample={handleClickExample} />
			<section className="flex items-center justify-center w-full">
				<aside className="flex flex-col gap-8">
					<Editor
						className="w-[44vw] h-[40vh]"
						onChangeFileType={handleChangeInputDataFileType}
						onChangeContent={handleChangeInputContent}
						title="Input"
						defaultFileName="input"
						fileTypes={[FileType.JSON, FileType.YAML]}
						convertCodeCallback={convertInputEditorCallback}
						updateCallback={updateInputEditorCallback}
						contentRef={inputContent}
						typeRef={inputType}
					/>
					<Editor
						className="w-[44vw] h-[40vh]"
						onChangeContent={handleChangeQueryContent}
						title="Input"
						defaultFileName="query"
						fileTypes={[FileType.GQ]}
						completionSource={queryCompletionSource}
						updateCallback={updateQueryEditorCallback}
						contentRef={queryContent}
					/>
				</aside>
				<div className="h-full flex justify-center items-center px-8 relative">
					<div className="absolute top-40 flex w-full items-center">
						<div className={styles.linkLeftBorder} data-linked={linkEditors} />
						<ActionButton
							className={cn(
								"p-2 min-w-max border-2",
								linkEditors ? "border-accent" : "border-accent-background",
							)}
							description={`${linkEditors ? "Link" : "Unlink"} input and output editor file types`}
							onClick={handleChangeLinked}
						>
							{linkEditors ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
						</ActionButton>
						<div className={styles.linkRightBorder} data-linked={linkEditors} />
					</div>
					<ApplyButton
						autoApply={autoApply}
						onClick={() =>
							updateOutputData(inputContent.current, inputType.current, queryContent.current, false)
						}
					/>
				</div>
				<aside className="flex flex-col">
					<Editor
						className="w-[44vw] h-[83vh]"
						onChangeFileType={handleChangeOutputDataFileType}
						title="Output"
						editable={false}
						defaultFileName="output"
						fileTypes={[FileType.JSON, FileType.YAML]}
						errorMessage={errorMessage}
						onDismissError={() => setErrorMessage(undefined)}
						warningMessages={warningMessages}
						convertCodeCallback={convertOutputEditorCallback}
						loadingCallback={outputEditorLoadingCallback}
						updateCallback={updateOutputEditorCallback}
						typeRef={outputType}
					/>
				</aside>
			</section>
			<Footer className="my-auto" />
		</main>
	);
};

export default Home;
