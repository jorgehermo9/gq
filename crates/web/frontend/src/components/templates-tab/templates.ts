interface Template {
	title: string;
	description: string;
	content: string;
	notes: string[];
}

export const templates: Template[] = [
	{
		title: "Generic CSV",
		description: "Convert your output array into a CSV file",
		content: `{# Headers #}
{%- for key, value in data[0] -%}
{{ key }}{% if not loop.last %},{% endif %}
{%- endfor -%}

{# Content #}
{% for item in data -%}
{% for key, value in item -%}
{{ value }}{% if not loop.last %},{% endif %}
{%- endfor -%}
{% if not loop.last %} 
{% endif %}
{%- endfor %}`,
		notes: [
			"The content int the output editor must be an array",
			"Each object in the array must only contain primitive values",
			"All of them should have the same keys",
		],
	},
	{
		title: "Generic XML",
		description: "Generic",
		content: `<root>
  {%- for item in data %}
  <item>
    {%- for key, value in item %}
    <{{ key }}>{{ value }}</{{ key }}>
    {%- endfor %}
  </item>
  {%- endfor %}
</root>`,
		notes: ["Template development in progress"],
	},
	// 	{
	// 		title: "Generic Jinja XML",
	// 		description: "Generic",
	// 		content: `{% macro render_element(key, value, indent=0) -%}
	//   {%- set current_indent = '  ' * indent -%}
	//   {%- if value is mapping -%}
	// {{ current_indent }}<{{ key }}>
	//       {%- for k, v in value.items() %}
	// {{ render_element(k, v, indent + 1) }}
	//       {%- endfor %}
	// {{ current_indent }}</{{ key }}>
	//   {%- elif value is sequence and value is not string -%}
	// {{ current_indent }}<{{ key }}>
	//       {%- for item in value %}
	// {{ current_indent }}  <item>
	//           {%- if item is mapping -%}
	//             {%- for k, v in item.items() %}
	// {{ render_element(k, v, indent + 2) }}
	//             {%- endfor %}
	//           {%- else %}
	// {{ current_indent }}    {{ item }}
	//           {%- endif %}
	// {{ current_indent }}  </item>
	//       {%- endfor %}
	// {{ current_indent }}</{{ key }}>
	//   {%- else -%}
	// {{ current_indent }}<{{ key }}>{{ value }}</{{ key }}>
	//   {%- endif %}
	// {%- endmacro -%}
	// {{ render_element("data", data) }}`,
	// 		notes: [],
	// 	},
];
