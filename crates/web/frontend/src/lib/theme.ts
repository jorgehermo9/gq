import { tags as t } from '@lezer/highlight';
import { createTheme, CreateThemeOptions } from '@uiw/codemirror-themes';

export const defaultSetting: CreateThemeOptions['settings'] = {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  caret: 'var(--accent-foreground)',
  selection: 'var(--accent)',
  selectionMatch: 'var(--accent)',
  lineHighlight: 'var(--muted-transparent)',
  gutterBackground: 'var(--background)',
  gutterForeground: 'var(--foreground)',
  gutterActiveForeground: 'var(--foreground)',
  fontFamily: 'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
};

export function gqThemeInit(options?: Partial<CreateThemeOptions>) {
  const { theme = 'dark', settings = {}, styles = [] } = options || {};
  return createTheme({
    theme: theme,
    settings: {
      ...defaultSetting,
      ...settings,
    },
    styles: [
      {
        tag: [
          t.keyword,
          t.operatorKeyword,
          t.modifier,
          t.color,
          t.constant(t.name),
          t.standard(t.name),
          t.standard(t.tagName),
          t.special(t.brace),
          t.atom,
          t.bool,
          t.special(t.variableName),
        ],
        color: 'var(--foreground)',
      },
      {
        tag: [t.controlKeyword, t.moduleKeyword],
        color: 'var(--foreground)',
      },
      {
        tag: [
          t.name,
          t.deleted,
          t.character,
          t.macroName,
          t.propertyName,
          t.variableName,
          t.labelName,
          t.definition(t.name),
        ],
        fontWeight: '800',
        color: 'var(--primary-foreground)',
      },
      { tag: t.heading, fontWeight: 'bold', color: 'var(--foreground)' },
      {
        tag: [t.typeName, t.className, t.tagName, t.number, t.changed, t.annotation, t.self, t.namespace],
        color: 'var(--foreground)',
      },
      {
        tag: [t.function(t.variableName), t.function(t.propertyName)],
        color: 'var(--foreground)',
      },
      { tag: [t.number], color: 'var(--secondary-foreground)' },
      {
        tag: [t.operator, t.punctuation, t.separator, t.url, t.escape, t.regexp],
        color: 'var(--foreground)',
      },
      {
        tag: [t.regexp],
        color: 'var(--foreground)',
      },
      {
        tag: [t.special(t.string), t.processingInstruction, t.string, t.inserted],
        color: 'var(--tertiary-foreground)',
      },
      { tag: [t.angleBracket], color: 'var(--foreground)' },
      { tag: t.strong, fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: t.strikethrough, textDecoration: 'line-through' },
      { tag: [t.meta, t.comment], color: 'var(--foreground)' },
      { tag: t.link, color: 'var(--foreground)', textDecoration: 'underline' },
      { tag: t.invalid, color: 'var(--foreground)' },
      { tag: t.punctuation, color: 'var(--primary-foreground)' },
      ...styles,
    ],
  });
}

export const gqTheme = gqThemeInit();
