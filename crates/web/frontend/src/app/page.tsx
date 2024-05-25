"use client";

import ApplyButton from "@/components/apply-button/apply-button";
import Editor from "@/components/editor/editor";
import Header from "@/components/header/header";
import useDebounce from "@/hooks/useDebounce";
import { type Data, empty } from "@/model/data";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { applyGq, convertCode } from "./page-utils";

const Home = () => {
	const [inputData, setInputData] = useState<Data>(empty(FileType.JSON));
	const [inputQuery, setInputQuery] = useState<Data>(empty(FileType.GQ));
	const [outputData, setOutputData] = useState<Data>(empty(FileType.JSON));
	const [linked, setLinked] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);
	const {
		settings: {
			autoApplySettings: { autoApply, debounceTime },
			formattingSettings: { dataTabSize },
		},
	} = useSettings();
	const { gqWorker, convertWorker } = useWorker();

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
			}
		},
		[gqWorker, dataTabSize, autoApply, debounceTime, outputData.type],
	);

	const handleClickExample = useCallback(
		(json: string, query: string) => {
			const jsonData = { content: json, type: FileType.JSON };
			const queryData = { content: query, type: FileType.GQ };
			setInputData(jsonData);
			setInputQuery(queryData);
			!autoApply && updateOutputData(jsonData, queryData, true);
			toast.success("Example loaded!");
		},
		[autoApply, updateOutputData],
	);

	const handleChangeInputDataContent = useCallback(
		(content: string) => setInputData({ ...inputData, content }),
		[inputData],
	);
	const handleChangeInputQueryContent = useCallback(
		(content: string) => setInputQuery({ ...inputQuery, content }),
		[inputQuery],
	);
	const handleChangeOutputDataContent = useCallback(
		(content: string) => setOutputData({ ...outputData, content }),
		[outputData],
	);

	const handleChangeInputDataFileType = useCallback(
		async (fileType: FileType) => {
			if (!convertWorker || fileType === inputData.type) return;
			try {
				const convertedData = await convertCode(
					inputData,
					fileType,
					dataTabSize,
					convertWorker,
				);
				setErrorMessage(undefined);
				setInputData(convertedData);
				if (!linked) return;
				const outputConvertedData = await convertCode(
					outputData,
					fileType,
					dataTabSize,
					convertWorker,
					true
				);
				setOutputData(outputConvertedData);
			} catch (e) {
				setErrorMessage(e.message);
			}
		},
		[inputData, dataTabSize, convertWorker, outputData, linked],
	);

	const handleChangeOutputDataFileType = useCallback(
		async (fileType: FileType) => {
			if (!convertWorker || fileType === outputData.type) return;
			try {
				const convertedData = await convertCode(
					outputData,
					fileType,
					dataTabSize,
					convertWorker,
				);
				setErrorMessage(undefined);
				setOutputData(convertedData);
				if (!linked) return;
				const inputConvertedData = await convertCode(
					inputData,
					fileType,
					dataTabSize,
					convertWorker,
					true
				);
				setInputData(inputConvertedData);
			} catch (e) {
				setErrorMessage(e.message);
			}
		},
		[outputData, dataTabSize, convertWorker, inputData, linked],
	);

	const handleChangeInputLinked = useCallback(
		(linked: boolean) => {
			setLinked(linked);
			if (!linked) return;
			handleChangeOutputDataFileType(inputData.type);
		},
		[inputData, handleChangeOutputDataFileType],
	);

	const handleChangeOutputLinked = useCallback(
		(linked: boolean) => {
			setLinked(linked);
			if (!linked) return;
			handleChangeInputDataFileType(outputData.type);
		},
		[outputData, handleChangeInputDataFileType],
	);


	useDebounce(
		() => autoApply && updateOutputData(inputData, inputQuery),
		debounceTime,
		[inputData, inputQuery],
	);

	return (
		<main className="flex flex-col items-center p-8 h-screen">
			<Header onClickExample={handleClickExample} />
			<section className="mt-4 flex gap-8 items-center justify-center w-full h-[80vh]">
				<aside className="w-[44vw] h-[80vh] flex flex-col gap-8">
					<Editor
						className="w-[44vw] h-[40vh] max-h-[40vh]"
						data={inputData}
						onChangeContent={handleChangeInputDataContent}
						linked={linked}
						onChangeLinked={handleChangeInputLinked}
						onChangeFileType={handleChangeInputDataFileType}
						title="Input"
						defaultFileName="input"
						fileTypes={[FileType.JSON, FileType.YAML]}
					/>
					<Editor
						className="w-[44vw] h-[40vh] max-h-[40vh]"
						data={inputQuery}
						onChangeContent={handleChangeInputQueryContent}
						title="Input"
						defaultFileName="query"
						fileTypes={[FileType.GQ]}
					/>
				</aside>
				<ApplyButton
					autoApply={autoApply}
					onClick={() => updateOutputData(inputData, inputQuery)}
				/>
				<aside className="w-[44vw] h-[80vh] flex flex-col">
					<Editor
						className="w-[44vw] h-[80vh]"
						data={outputData}
						onChangeContent={handleChangeOutputDataContent}
						linked={linked}
						onChangeLinked={handleChangeOutputLinked}
						onChangeFileType={handleChangeOutputDataFileType}
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
