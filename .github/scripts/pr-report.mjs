// Builds a PR change report via DeepSeek (OpenAI-compatible API).
// Outputs: pr-report.md (PR comment) and pr-report.html (artifact).
import { readFileSync, writeFileSync } from 'node:fs';

const env = process.env;
if (!env.DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY secret is not set');

const read = (f) => readFileSync(f, 'utf8');
const commits = read('pr-commits.txt');
const stat = read('pr-stat.txt');
const diff = read('pr-diff.txt');

let added = 0, removed = 0, files = 0;
for (const line of read('pr-numstat.txt').split('\n').filter(Boolean)) {
  const [a, d] = line.split('\t');
  files++; added += Number(a) || 0; removed += Number(d) || 0;
}

const system = `You are a senior reviewer writing a precise change report for a pull request
in a Next.js + Drizzle (TypeScript) website. Describe EXACTLY what the code change does,
grounded only in the diff. Never invent behaviour that is not in the diff. If the diff was
truncated, say so. Output GitHub-flavored Markdown with these sections:

## Summary
2-4 sentences: what this PR does and why (infer intent from title/commits).

## What changed
Grouped by area (pages/routes, components, data/DB schema & migrations, config, styles).
For each: file paths and the concrete behavioural change.

## User-visible impact
Routes/pages/links added, removed, or changed.

## Risks & things to verify
Breaking changes, broken links/imports, migrations, missing tests, security concerns.
Mark severity as High / Medium / Low.

## Suggested test checklist
Markdown checkboxes.`;

const user = `PR #${env.PR_NUMBER}: ${env.PR_TITLE}
Author: ${env.PR_AUTHOR}
Description:
${env.PR_BODY || '(none)'}

Commits:
${commits}

Diff stat (${files} files, +${added} / -${removed}):
${stat}

Diff${diff.length >= 200000 ? ' (TRUNCATED at 200KB)' : ''}:
${diff}`;

const res = await fetch('https://api.deepseek.com/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.DEEPSEEK_API_KEY}` },
  body: JSON.stringify({
    model: env.DEEPSEEK_MODEL || 'deepseek-chat',
    temperature: 0.2,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
  }),
});
if (!res.ok) throw new Error(`DeepSeek API ${res.status}: ${await res.text()}`);
const report = (await res.json()).choices[0].message.content.trim();

const header = `# PR #${env.PR_NUMBER} report: ${env.PR_TITLE}\n\n` +
  `**Author:** @${env.PR_AUTHOR} · **Files:** ${files} · **+${added} / -${removed}**\n\n`;
const md = header + report;
writeFileSync('pr-report.md', md);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
writeFileSync('pr-report.html', `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>PR #${env.PR_NUMBER} report</title>
<style>:root{color-scheme:light dark}body{font-family:system-ui,sans-serif;max-width:900px;margin:auto;padding:16px;line-height:1.6}</style>
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script></head>
<body><div id="r"></div><pre id="src" hidden>${esc(md)}</pre>
<script>document.getElementById('r').innerHTML = marked.parse(document.getElementById('src').textContent);</script>
</body></html>`);
console.log(md);
