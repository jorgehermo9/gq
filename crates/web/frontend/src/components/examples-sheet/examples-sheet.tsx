"use client";

import { gqTheme } from "@/lib/theme";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import { json } from "@codemirror/lang-json";
import CodeMirror from "@uiw/react-codemirror";
import { CircleHelp } from "lucide-react";
import { useCallback, useState } from "react";
import ActionButton from "../action-button/action-button";
import SimpleEditor from "../editor/simple-editor";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { Separator } from "../ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";
import { type Example, type ExampleSection, queryExamples } from "./examples";
import { formatCode } from "../editor/editor-utils";

interface ExampleItemDescriptionProps {
	description: string;
	className?: string;
}

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

const ExampleItemDescription = ({
	description,
	className,
}: ExampleItemDescriptionProps) => (
	<p className={className}>
		{description.split(" ").map((word, index) =>
			word.startsWith("`") ? (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<code className="rounded-md" key={index}>
					{word.slice(1, -1)}
				</code>
			) : (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<span key={index}>{word}</span>
			),
		)}
	</p>
);

const ExampleItem = ({ example, onClick }: ExampleItemProps) => {
	return (
		<div
			className="p-4 border rounded-lg hover:border-accent transition-colors cursor-pointer"
			onClick={() => onClick(example.query)}
		>
			<h3 className="font-semibold text-sm mb-1">{example.title}</h3>
			<ExampleItemDescription
				className="font-medium text-[0.85rem] mb-4 flex gap-1 flex-wrap"
				description={example.description}
			/>
			<SimpleEditor
				className="rounded-sm cursor-auto overflow-hidden"
				onClick={(event) => event.stopPropagation()}
				content={example.query}
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
			formattingSettings: { dataTabSize: jsonTabSize },
		},
	} = useSettings();

	const handleClick = useCallback(
		(query: string) => {
			onClick(JSON.stringify(exampleSection.json), query);
		},
		[exampleSection, onClick],
	);

	return (
		<>
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
						highlightActiveLineGutter: false,
						highlightActiveLine: false,
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
		</>
	);
};

const ExamplesSheet = ({ onClickExample, className }: Props) => {
	const [sheetOpen, setSheetOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedExample, setSelectedExample] = useState<
		| {
			json: string;
			query: string;
		}
		| undefined
	>();
	const {
		settings: {
			formattingSettings: { dataTabSize, queryTabSize },
		},
	} = useSettings();
	const { formatWorker } = useWorker();

	const handleClick = useCallback((json: string, query: string) => {
		setSelectedExample({ json, query });
		setDialogOpen(true);
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!selectedExample) return;
		if (!formatWorker) return;
		const formattedJson = await formatCode(
			{ content: selectedExample.json, type: FileType.JSON },
			dataTabSize,
			formatWorker,
			true
		);
		const formattedQuery = await formatCode(
			{ content: selectedExample.query, type: FileType.GQ },
			queryTabSize,
			formatWorker,
			true
		);
		setSheetOpen(false);
		setDialogOpen(false);
		onClickExample(formattedJson, formattedQuery);
	}, [dataTabSize, queryTabSize, onClickExample, selectedExample, formatWorker]);

	return (
		<>
			<AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Replace editor content?</AlertDialogTitle>
						<AlertDialogDescription>
							This will replace the content of both json and query editors with
							the selected example.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setDialogOpen(false)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleSubmit} className="success">
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetTrigger className={className} asChild>
					<ActionButton description="Show query examples" className="p-3">
						<CircleHelp className="w-5 h-5" />
					</ActionButton>
				</SheetTrigger>
				<SheetContent side="left" className="sm:max-w-lg overflow-y-auto">
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
		</>
	);
};

export default ExamplesSheet;
