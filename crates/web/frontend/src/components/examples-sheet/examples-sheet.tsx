"use client";

import { gqTheme } from "@/lib/theme";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import { json } from "@codemirror/lang-json";
import CodeMirror from "@uiw/react-codemirror";
import { SwatchBook } from "lucide-react";
import { useCallback, useState } from "react";
import ActionButton from "../action-button/action-button";
import { Separator } from "../ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";
import {
	type Example,
	type ExampleSection,
	arrayFiltering,
	simpleAccessing,
	propertyAccessing,
	fieldAliasing,
	examples,
	queryExamples,
} from "./examples";

interface ExampleItemProps {
	example: Example;
	onClick: (query: string) => void;
}

interface ExampleSectionProps {
	title: string;
	exampleSection: ExampleSection;
	onClick: (json: string, query: string) => void;
}

interface Props {
	onClickExample: (json: string, query: string) => void;
	className?: string;
}

const ExampleItem = ({ example, onClick }: ExampleItemProps) => {
	const handleClick = useCallback(
		() => onClick(example.query),
		[example, onClick],
	);

	return (
		<div
			className="p-4 border rounded-lg hover:border-accent transition-colors cursor-pointer"
			onClick={handleClick}
		>
			<h3 className="font-semibold text-sm mb-1">{example.title}</h3>
			<p className="font-medium text-[0.85rem] mb-4">{example.description}</p>
			<CodeMirror
				className="w-full rounded-lg text-[0.8rem]"
				value={example.query}
				height="100%"
				theme={gqTheme}
				extensions={[json()]}
				editable={false}
				basicSetup={{
					lineNumbers: true,
					lintKeymap: true,
					highlightActiveLineGutter: true,
				}}
			/>
		</div>
	);
};

const ExamplesSection = ({
	title,
	exampleSection,
	onClick,
}: ExampleSectionProps) => {
	const {
		settings: {
			formattingSettings: { jsonTabSize, queryTabSize },
		},
	} = useSettings();
	const { formatWorker } = useWorker();

	const formatCode = useCallback(
		(value: string, indentSize: number, fileType: FileType) => {
			return formatWorker?.postMessage({
				data: value,
				indent: indentSize,
				type: fileType,
			});
		},
		[formatWorker],
	);

	const handleClick = useCallback(
		async (query: string) => {
			const formattedJson = await formatCode(
				JSON.stringify(exampleSection.json),
				jsonTabSize,
				FileType.JSON,
			);
			const formattedQuery = await formatCode(query, queryTabSize, FileType.GQ);
			onClick(formattedJson, formattedQuery);
		},
		[exampleSection, onClick, jsonTabSize, queryTabSize, formatCode],
	);

	return (
		<div className="flex flex-col gap-4">
			<h2 className="font-semibold text-md">{title}</h2>
			<CodeMirror
				className="w-full rounded-lg text-[0.8rem]"
				value={JSON.stringify(
					exampleSection.json,
					null,
					" ".repeat(jsonTabSize),
				)}
				height="100%"
				theme={gqTheme}
				extensions={[json()]}
				editable={false}
				basicSetup={{
					lineNumbers: true,
					lintKeymap: true,
					highlightActiveLineGutter: true,
				}}
			/>
			{exampleSection.queries.map((example) => (
				<ExampleItem
					key={example.title}
					example={example}
					onClick={handleClick}
				/>
			))}
		</div>
	);
};

const ExamplesSheet = ({ onClickExample, className }: Props) => {
	const [open, setOpen] = useState(false);

	const handleClick = useCallback(
		(json: string, query: string) => {
			setOpen(false);
			onClickExample(json, query);
		},
		[onClickExample],
	);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger className={className} asChild>
				<ActionButton description="Show playground settings" className="p-3">
					<SwatchBook className="w-5 h-5" />
				</ActionButton>
			</SheetTrigger>
			<SheetContent side="left" className="sm:max-w-lg overflow-y-scroll">
				<SheetHeader>
					<SheetTitle>Query Examples</SheetTitle>
					<SheetDescription>
						Check some query examples and import them into your editor with
						ease. There are endless possiblities!
					</SheetDescription>
				</SheetHeader>
				{queryExamples.map((exampleSection: ExampleSection) => (
					<div key={exampleSection.title}>
						<Separator />
						<ExamplesSection
							title={exampleSection.title}
							exampleSection={exampleSection}
							onClick={handleClick}
						/>
					</div>
				))}
			</SheetContent>
		</Sheet>
	);
};

export default ExamplesSheet;
