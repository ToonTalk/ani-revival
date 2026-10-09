// A whole HTML document around a page's content (the content alone is what a claude.ai
// artifact is published as). The content's leading <title> and <link> lines go in the
// head, where browsers look for the favicon (they ignore an icon link in the body).
export function fullPage(content, { lang = "en" } = {}) {
  const head = [];
  let rest = content;
  for (;;) {
    const m = rest.match(/^\s*(<title>[^<]*<\/title>|<link\b[^>]*>)\s*\n?/);
    if (!m) break;
    head.push(m[1]);
    rest = rest.slice(m[0].length);
  }
  return `<!doctype html>\n<html lang="${lang}">\n<head>\n<meta charset="utf-8">\n` +
    `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head.join("\n")}\n</head>\n<body>\n${rest}\n</body>\n</html>\n`;
}
