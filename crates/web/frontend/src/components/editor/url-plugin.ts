import { Decoration, MatchDecorator, ViewPlugin, WidgetType } from "@uiw/react-codemirror";

class HyperLink extends WidgetType {
	at: number;
	url: string;

	constructor(at: number, url: string) {
		super();
		this.at = at;
		this.url = url;
	}

	eq(other: HyperLink) {
		return this.url === other.url && this.at === other.at;
	}

	toDOM() {
		const wrapper = document.createElement("a");
		wrapper.href = this.url.slice(1, this.url.length - 1);
		wrapper.target = "_blank";
		wrapper.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link text-accent w-3 h-3 inline-block ml-1"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';
		wrapper.className = "cm-link";
		wrapper.rel = "nofollow";
		return wrapper;
	}
}

const urlDecorator = new MatchDecorator({
	regexp: /"https?:\/\/[a-z0-9\._/~%\-\+&\#\?!=\(\)@]*"/gi,
	decorate: (add, from, to, match, view) => {
		const url = match[0];
		const start = to;
		const end = to;
		const linkIcon = new HyperLink(start, url);
		add(start, end, Decoration.widget({ widget: linkIcon, side: 1 }));
	},
});

const urlPlugin = ViewPlugin.define(
	(view) => ({
		decorations: urlDecorator.createDeco(view),
		update(u) {
			this.decorations = urlDecorator.updateDeco(u, this.decorations);
		},
	}),
	{
		decorations: (v) => v.decorations,
	},
);

export default urlPlugin;
