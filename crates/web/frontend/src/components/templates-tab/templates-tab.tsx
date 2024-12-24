import { gqThemeInit } from "@/lib/theme";
import { countLines } from "@/lib/utils";
import FileType from "@/model/file-type";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { Dot, Info } from "lucide-react";
import { useMemo } from "react";
import { DumpBlock } from "../dump-block/dump-block";
import { getCodemirrorExtensionsByFileType } from "../editor/editor-utils";
import { SidebarContent, SidebarDescription, SidebarHeader, SidebarTitle } from "../ui/sidebar";
import { templates } from "./templates";

interface Props {
	onClickTemplate: (templateContent: string) => void;
	className?: string;
}

export const TemplatesTab = ({ className, onClickTemplate }: Props) => {
	const extensions: Extension[] = useMemo(
		() => getCodemirrorExtensionsByFileType(FileType.JINJA),
		[],
	);

	return (
		<SidebarContent className={className}>
			<SidebarHeader>
				<SidebarTitle>Templates</SidebarTitle>
				<SidebarDescription>Explore useful templates to transform your data</SidebarDescription>
			</SidebarHeader>
			{templates.map((template) => (
				<div key={template.title}>
					<div className="px-2 py-4 border-t bg-muted-transparent">
						<span className="block mb-1 text-sm font-semibold">{template.title}</span>
						<p className="text-xs">{template.description}</p>
					</div>
					<DumpBlock
						className="border-y"
						lines={countLines(template.content)}
						onDump={() => onClickTemplate(template.content)}
						onDumpMessage="Template dumped into the editor"
					>
						<CodeMirror
							className="px-2 py-2 w-full text-xs overflow-auto"
							value={template.content}
							height="100%"
							theme={gqThemeInit({ settings: { lineHighlight: "transparent" } })}
							readOnly
							extensions={extensions}
							basicSetup={{
								autocompletion: true,
								lineNumbers: true,
								lintKeymap: true,
							}}
						/>
					</DumpBlock>
					<div className="px-2 py-4 border-b">
						<div className="flex items-center gap-2">
							<Info className="w-3 h-3 text-accent" />
							<p className="text-sm font-semibold">Notes</p>
						</div>
						<div className="mt-2 flex flex-col gap-0.5">
							{template.notes.map((note) => (
								<div key={note} className="flex items-center">
									<Dot className="w-6 h-6" />
									<span key={note} className="text-xs">
										{note}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			))}
		</SidebarContent>
	);
};
