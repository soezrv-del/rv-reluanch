import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("light mode does not paint dark text on a sapphire bubble", () => {
  const css = read("../../styles.css");
  const bubble = read("../../components/rvgrok/MessageBubble.tsx");
  const theme = read("../theme.ts");
  const more = read("../../components/more/MoreApp.tsx");
  assert.match(bubble, /data-bubble=\{isUser \? "user" : "assistant"\}/);
  assert.match(bubble, /data-on-dark=\{isUser \? "" : undefined\}/);
  assert.match(
    css,
    /\.text-white[\s\S]*?:not\(\[data-on-dark\]\):not\(\[data-on-dark\] \*\)/,
  );
  const frost = css.match(/\.grok-frost \{[^}]*\}/);
  assert.ok(frost);
  assert.doesNotMatch(frost[0], /--color-gold-border/);
  assert.doesNotMatch(css, /--color-grok-mic:\s*#e8893a/);
  assert.match(theme, /classList\.toggle\("dark", next === "dark"\)/);
  assert.match(theme, /classList\.toggle\("dark",t==="dark"\)/);
  assert.match(more, /useSyncExternalStore\(subscribeTheme, readTheme, serverTheme\)/);
  assert.match(more, /appearance-choice/);
  assert.match(more, /appearance-switch/);
  assert.doesNotMatch(css, /--on-dark-muted/);
  assert.match(
    css,
    /button:not\(\.showroom-brand\)[\s\S]*?:not\(\[data-on-dark\]\)/,
  );
  assert.doesNotMatch(read("../../routes/__root.tsx"), /className="dark"/);
  const grokFiles = [
    "../../components/rvgrok/RvGrokApp.tsx",
    "../../components/rvgrok/MessageBubble.tsx",
    "../../components/rvgrok/GrokLanding.tsx",
    "../../components/rvgrok/GrokComposer.tsx",
    "../../components/rvgrok/DeskSpecSheet.tsx",
  ];
  for (const file of grokFiles) {
    const src = read(file);
    assert.doesNotMatch(src, /text-gold|bg-gold|border-gold|text-amber|bg-amber|border-amber/);
  }
  assert.match(read("../../components/rvgrok/GrokLanding.tsx"), /How many diesels on the lot\?/);
  assert.match(css, /\.grok-mic-btn\.is-armed/);
  assert.match(css, /\.grok-mic-btn\.is-live/);
  assert.doesNotMatch(more, /Dark · night/);
  assert.doesNotMatch(more, /setThemeState/);
});
