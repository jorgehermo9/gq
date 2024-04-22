import { gqTheme } from "@/lib/theme";
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
	simpleAccessing,
	arrayFiltering,
} from "./examples";
import { space } from "postcss/lib/list";
import { useSettings } from "@/providers/settings-provider";

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
				className="w-full rounded-lg text-[0.9rem]"
				value={example.query}
				height="100%"
				theme={gqTheme}
				extensions={[json()]}
				editable={false}
				basicSetup={{
					lineNumbers: true,
					lintKeymap: true,
					highlightActiveLineGutter: false,
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
			formattingSettings: { jsonTabSize },
		},
	} = useSettings();

	const handleClick = useCallback(
		(query: string) => {
			onClick(
				JSON.stringify(exampleSection.json, null, " ".repeat(jsonTabSize)),
				query,
			);
		},
		[exampleSection, onClick, jsonTabSize],
	);

	return (
		<div className="flex flex-col gap-4">
			<h2 className="font-semibold text-md">{title}</h2>
			{exampleSection.queries.map((example) => (
				<ExampleItem example={example} onClick={handleClick} />
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
			<SheetContent side="left" className="sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>Query Examples</SheetTitle>
					<SheetDescription>
						Check some query examples and import them into your editor with ease
					</SheetDescription>
				</SheetHeader>
				<Separator />
				<ExamplesSection
					title="Simple accessing"
					exampleSection={simpleAccessing}
					onClick={handleClick}
				/>
				<Separator />
				<ExamplesSection
					title="Array filtering"
					exampleSection={arrayFiltering}
					onClick={handleClick}
				/>
			</SheetContent>
		</Sheet>
	);
};

export default ExamplesSheet;
