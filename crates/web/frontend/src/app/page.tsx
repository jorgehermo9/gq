"use client";
import ActionButton from "@/components/action-button/action-button";
import Editor from "@/components/editor/editor";
import Footer from "@/components/footer/footer";
import { LeftSidebar } from "@/components/left-sidebar/left-sidebar";
import useDebounce from "@/hooks/use-debounce";
import { notify } from "@/lib/notify";
import { cn, i, isMac } from "@/lib/utils";
import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { type LoadingState, loading, notLoading } from "@/model/loading-state";
import { setLinkEditors } from "@/model/settings";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import type { CompletionSource } from "@codemirror/autocomplete";
import { ArrowUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type MutableRefObject, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type PromiseWorker from "webworker-promise";
import { applyGq, applyTemplate, getQueryCompletionSource, importShare } from "./page-utils";
import { set } from "zod";

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
	const jinjaContent = useRef<string>("");
	const outputContent = useRef<string>("");
	const inputType = useRef<FileType>(FileType.JSON);
	const outputType = useRef<FileType>(FileType.JSON);
	const convertInputEditorCallback = useRef<(fileType: FileType) => void>(i);
	const convertOutputEditorCallback = useRef<(fileType: FileType) => void>(i);
	const outputEditorLoadingCallback = useRef<(loading: LoadingState) => void>(i);
	const renderEditorLoadingCallback = useRef<(loading: LoadingState) => void>(i);
	const updateInputEditorCallback = useRef<(data: Data) => void>(i);
	const updateQueryEditorCallback = useRef<(data: Data) => void>(i);
	const updateOutputEditorCallback = useRef<(data: Data) => void>(i);
	const updateJinjaEditorCallback = useRef<(data: Data) => void>(i);
	const updateRenderEditorCallback = useRef<(data: Data) => void>(i);
	const [queryCompletionSource, setQueryCompletionSource] = useState<CompletionSource>();
	const [isApplying, setIsApplying] = useState(false);
	const [isTemplateApplying, setIsTemplateApplying] = useState(false);
	const [shareLink, setShareLink] = useState<string>();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [templateOpen, setTemplateOpen] = useState(false);
	const addNewQueryCallback = useRef<(queryContent: string) => void>(i);
	const addNewTemplateCallback = useRef<(templateContent: string) => void>(i);
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

	const updateTemplateOutput = useCallback(
		async (inputContent: string, inputType: FileType, jinjaContent: string, silent = true) => {
			if (!gqWorker || isApplying) return;
			setIsTemplateApplying(true);
			renderEditorLoadingCallback.current(loading("Applying template..."));
			try {
				const result = await applyTemplate(inputContent, inputType, jinjaContent, silent);
				addNewTemplateCallback.current(jinjaContent);
				updateRenderEditorCallback.current(new Data(result, FileType.UNKNOWN));
			} catch (err) {
				// setErrorMessage(err.message);
				// setWarningMessages([]);
			} finally {
				setIsTemplateApplying(false);
				renderEditorLoadingCallback.current(notLoading());
			}
		},
		[gqWorker, isApplying],
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

	const handleClickHistoryQuery = useCallback((queryContent: string) => {
		updateQueryEditorCallback.current(new Data(queryContent, FileType.GQ));
	}, []);

	const handleClickHistoryTemplate = useCallback((templateContent: string) => {
		updateJinjaEditorCallback.current(new Data(templateContent, FileType.JINJA));
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

	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if ((isMac ? e.metaKey : e.ctrlKey) && (e.key === "m" || e.key === "M")) {
			e.preventDefault();
			setTemplateOpen((prev) => !prev);
		}
	}, []);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div className="flex h-screen w-screen overflow-hidden">
			<LeftSidebar
				open={sidebarOpen}
				setOpen={setSidebarOpen}
				onClickExample={handleClickExample}
				onClickQuery={handleClickHistoryQuery}
				onClickTemplate={handleClickHistoryTemplate}
				addNewQueryCallback={addNewQueryCallback}
				addNewTemplateCallback={addNewTemplateCallback}
				inputContent={inputContent}
				inputType={inputType}
				queryContent={queryContent}
				outputType={outputType}
				shareLink={shareLink}
				setShareLink={setShareLink}
			/>
			<main className="flex flex-col">
				<section className="flex w-full h-full relative">
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
							height={`${templateOpen ? "calc(50vh - 60.5px)" : "calc(100vh - 80px)"}`} // Check why this 60.5px aligns the editors
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
							contentRef={outputContent}
						/>
						<ActionButton
							description="Show templating editors"
							side="top"
							variant="ghost"
							className="w-full h-10 p-0 flex items-center justify-center gap-2 border-0 border-t border-l bg-background"
							onClick={() => setTemplateOpen((prev) => !prev)}
						>
							<ArrowUp
								className={cn(
									"w-3 h-3 transition-transform",
									templateOpen ? "rotate-180" : "rotate-0",
								)}
							/>
							<span className="text-xs">Templating</span>
						</ActionButton>
						<div
							className="flex transition-all overflow-hidden"
							style={{
								maxHeight: templateOpen ? "calc(50vh - 19.5px)" : "0",
							}}
						>
							<Editor
								width={`calc(25vw - 16px ${sidebarOpen ? "- 96px" : ""})`}
								height="calc(50vh - 19.5px)" // Check why this aligns the editors
								className="border-l border-t transition-all"
								title="Input"
								defaultFileName="template"
								fileTypes={[FileType.JINJA]}
								onApply={() =>
									updateTemplateOutput(
										outputContent.current,
										outputType.current,
										jinjaContent.current,
										false,
									)
								}
								contentRef={jinjaContent}
								updateCallback={updateJinjaEditorCallback}
							/>
							<Editor
								width={`calc(25vw - 16px ${sidebarOpen ? "- 96px" : ""})`}
								height="calc(50vh - 19.5px)" // Check why this aligns the editors
								className="border-l border-t transition-all"
								title="Output"
								editable={false}
								defaultFileName="output"
								fileTypes={[FileType.UNKNOWN]}
								updateCallback={updateRenderEditorCallback}
							/>
						</div>
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
