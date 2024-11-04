import { gqTheme } from "@/lib/theme";
import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import { json } from "@codemirror/lang-json";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useState } from "react";
import { formatCode } from "../editor/editor-utils";
import SimpleEditor from "../editor/simple-editor";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
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
import { SidebarContent, SidebarDescription, SidebarHeader, SidebarTitle } from "../ui/sidebar";
import { type Example, type ExampleSection, queryExamples } from "./examples";

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
	onClickExample: (json: Data, query: Data) => void;
	className?: string;
}

const ExampleItemDescription = ({ description, className }: ExampleItemDescriptionProps) => (
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
			className="border-y hover:border-accent transition-colors cursor-pointer px-4 py-8"
			onClick={() => onClick(example.query)}
			onKeyDown={(event) => event.key === "Enter" && onClick(example.query)}
		>
			<h3 className="font-semibold text-sm mb-1">{example.title}</h3>
			<ExampleItemDescription
				className="font-medium text-xs mb-4 flex gap-1 flex-wrap"
				description={example.description}
			/>
			<SimpleEditor
				className="cursor-auto overflow-hidden p-1"
				onClick={(event) => event.stopPropagation()}
				content={example.query}
			/>
		</div>
	);
};

const ExamplesSection = ({ title, exampleSection, onClick }: ExampleSectionProps) => {
	const {
		settings: {
			formattingSettings: { dataTabSize: jsonTabSize },
		},
	} = useSettings();

	const handleClick = useCallback(
		(query: string) => onClick(JSON.stringify(exampleSection.json), query),
		[exampleSection, onClick],
	);

	return (
		<AccordionItem value={title} className="last:border-b">
			<AccordionTrigger className="font-semibold text-sm py-6 px-4 border-t">
				{title}
			</AccordionTrigger>
			<AccordionContent>
				<div className="flex flex-col">
					<CodeMirror
						className="w-full text-xs"
						value={JSON.stringify(exampleSection.json, null, " ".repeat(jsonTabSize))}
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
						<ExampleItem key={example.title} example={example} onClick={handleClick} />
					))}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};

const ExamplesTab = ({ onClickExample, className }: Props) => {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedExample, setSelectedExample] = useState<{
		json: string;
		query: string;
	}>();
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
		if (!selectedExample || !formatWorker) return;
		const jsonData = new Data(selectedExample.json, FileType.JSON);
		const queryData = new Data(selectedExample.query, FileType.GQ);
		const formattedJson = await formatCode(jsonData, dataTabSize, formatWorker, true);
		const formattedQuery = await formatCode(queryData, queryTabSize, formatWorker, true);
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
							This will replace the content of both json and query editors with the selected example
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="w-full">
						<AlertDialogCancel
							containerClassName="w-1/2"
							className="w-full border-0 border-t"
							onClick={() => setDialogOpen(false)}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction className="w-1/2 bg-success" onClick={handleSubmit}>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<SidebarContent className={className}>
				<SidebarHeader>
					<SidebarTitle>Query Examples</SidebarTitle>
					<SidebarDescription>
						Check some query examples and import them into your editor with ease.
					</SidebarDescription>
				</SidebarHeader>
				<Accordion type="multiple">
					{queryExamples.map((exampleSection: ExampleSection) => (
						<ExamplesSection
							key={exampleSection.title}
							title={exampleSection.title}
							exampleSection={exampleSection}
							onClick={handleClick}
						/>
					))}
				</Accordion>
			</SidebarContent>
		</>
	);
};

export default ExamplesTab;
