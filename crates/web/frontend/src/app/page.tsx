"use client";
import Editor from "@/components/editor/editor";
import Footer from "@/components/footer/footer";
import { LeftSidebar } from "@/components/left-sidebar/left-sidebar";
import useDebounce from "@/hooks/use-debounce";
import { notify } from "@/lib/notify";
import { i } from "@/lib/utils";
import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { type LoadingState, loading, notLoading } from "@/model/loading-state";
import { setLinkEditors } from "@/model/settings";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import type { CompletionSource } from "@codemirror/autocomplete";
import { useSearchParams } from "next/navigation";
import { type MutableRefObject, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type PromiseWorker from "webworker-promise";
import { applyGq, getQueryCompletionSource, importShare } from "./page-utils";

const ShareLoader = ({
	updateInputEditorCallback,
	updateQueryEditorCallback,
	updateOutputData,
	gqWorker,
	setLinkEditors,
}: {
	updateInputEditorCallback: MutableRefObject<(data: Data) => void>;
	updateQueryEditorCallback: MutableRefObject<(data: Data) => void>;
	updateOutputData: (
		inputContent: string,
		inputType: FileType,
		queryContent: string,
		silent?: boolean,
		outputTypeOverride?: FileType,
	) => void;
	gqWorker: PromiseWorker | undefined;
	setLinkEditors: (value: boolean) => void;
}) => {
	const shareId = useSearchParams().get("id");

	// biome-ignore lint/correctness/useExhaustiveDependencies: One time load when gqWorker is ready
	useEffect(() => {
		if (!shareId || !gqWorker) return;
		importShare(shareId).then((data) => {
			if (!data) return;
			updateInputEditorCallback?.current(data.input);
			updateQueryEditorCallback?.current(data.query);
			if (data.input.type !== data.outputType) setLinkEditors(false);
			updateOutputData(
				data.input.content,
				data.input.type,
				data.query.content,
				true,
				data.outputType,
			);
		});
	}, [gqWorker]);

	return null;
};

const Home = () => {
	const [errorMessage, setErrorMessage] = useState<string>();
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
	const [shareLink, setShareLink] = useState<string>();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const addNewQueryCallback = useRef<(queryContent: string) => void>(i);
	const {
		settings: {
			autoApplySettings: { autoApply, debounceTime },
			formattingSettings: { dataTabSize },
			workspaceSettings: { linkEditors },
		},
		setSettings,
	} = useSettings();
	const debounce = useDebounce();
	const { gqWorker, lspWorker } = useWorker();

	const updateOutputData = useCallback(
		async (
			inputContent: string,
			inputType: FileType,
			queryContent: string,
			silent = true,
			outputTypeOverride?: FileType,
		) => {
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
					outputTypeOverride || outputType.current,
					dataTabSize,
					gqWorker,
					silent,
				);
				addNewQueryCallback.current(queryContent);
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
			notify.success("Example loaded!");
		},
		[updateOutputData],
	);

	const handleClickQuery = useCallback((queryContent: string) => {
		updateQueryEditorCallback.current(new Data(queryContent, FileType.GQ));
	}, []);

	const handleChangeInputDataFileType = useCallback(
		(fileType: FileType) => {
			setShareLink(undefined);
			linkEditors && convertOutputEditorCallback.current(fileType);
		},
		[linkEditors],
	);

	const handleChangeOutputDataFileType = useCallback(
		(fileType: FileType) => {
			setShareLink(undefined);
			linkEditors && convertInputEditorCallback.current(fileType);
		},
		[linkEditors],
	);

	const handleToggleLinked = useCallback(() => {
		setSettings((prev) => setLinkEditors(prev, !linkEditors));
		notify.info(`Editors ${linkEditors ? "unlinked" : "linked"}!`);
		if (!linkEditors) convertOutputEditorCallback.current(inputType.current);
	}, [linkEditors, setSettings]);

	const handleChangeInputContent = useCallback(
		(content: string) => {
			setShareLink(undefined);
			setQueryCompletionSource(() =>
				getQueryCompletionSource(lspWorker, new Data(content, inputType.current)),
			);
			autoApply &&
				debounce(debounceTime, () =>
					updateOutputData(content, inputType.current, queryContent.current, debounceTime < 500),
				);
		},
		[autoApply, debounce, updateOutputData, debounceTime, lspWorker],
	);

	const handleChangeQueryContent = useCallback(
		(content: string) => {
			setShareLink(undefined);
			autoApply &&
				debounce(debounceTime, () =>
					updateOutputData(inputContent.current, inputType.current, content, debounceTime < 500),
				);
		},
		[autoApply, debounce, updateOutputData, debounceTime],
	);

	return (
		<div className="flex h-screen w-screen overflow-hidden">
			<LeftSidebar
				open={sidebarOpen}
				setOpen={setSidebarOpen}
				onClickExample={handleClickExample}
				onClickQuery={handleClickQuery}
				addNewQueryCallback={addNewQueryCallback}
				inputContent={inputContent}
				inputType={inputType}
				queryContent={queryContent}
				outputType={outputType}
				shareLink={shareLink}
				setShareLink={setShareLink}
			/>
			<main className="flex flex-col items-center">
				<section className="flex items-center justify-between w-full h-full relative">
					<aside className="flex flex-col">
						<Editor
							width={`calc(50vw - 32px ${sidebarOpen ? "- 192px" : ""})`}
							height="calc(50vh - 20px)"
							className="border-b transition-all"
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
							width={`calc(50vw - 32px ${sidebarOpen ? "- 192px" : ""})`}
							height="calc(50vh - 20px)"
							className="transition-all"
							onChangeContent={handleChangeQueryContent}
							onApply={() =>
								updateOutputData(
									inputContent.current,
									inputType.current,
									queryContent.current,
									false,
								)
							}
							title="Input"
							defaultFileName="query"
							fileTypes={[FileType.GQ]}
							completionSource={queryCompletionSource}
							updateCallback={updateQueryEditorCallback}
							contentRef={queryContent}
						/>
					</aside>
					<aside className="flex flex-col">
						<Editor
							width={`calc(50vw - 32px ${sidebarOpen ? "- 192px" : ""})`}
							height="calc(100vh - 40px)"
							className="border-l transition-all"
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
				<Footer
					className="h-10"
					linkEditors={linkEditors}
					handleToggleLinked={handleToggleLinked}
				/>
				<Suspense>
					<ShareLoader
						updateInputEditorCallback={updateInputEditorCallback}
						updateQueryEditorCallback={updateQueryEditorCallback}
						updateOutputData={updateOutputData}
						gqWorker={gqWorker}
						setLinkEditors={(value) => setSettings((prev) => setLinkEditors(prev, value))}
					/>
				</Suspense>
			</main>
		</div>
	);
};

export default Home;
