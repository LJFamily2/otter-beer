import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "strong",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
  "img",
  "br",
  "span",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "class", "target", "rel"];

/**
 * Every WYSIWYG `content` field is sanitized here before it ever reaches
 * MongoDB — required by docs/security.md since the marketing site renders
 * this HTML with `dangerouslySetInnerHTML`.
 *
 * TODO: test — isomorphic-dompurify's jsdom fallback (jsdom 30's CSS engine
 * pulls in @asamuzakjp/css-color -> @csstools/* -> a long ESM-only chain)
 * can't currently be parsed by this project's Jest+pnpm setup without an
 * open-ended `transpilePackages` list in next.config.ts (tried and reverted
 * — see git history). Behavior is covered by manual testing for now;
 * revisit once isomorphic-dompurify or jsdom improves CJS interop, or by
 * running this specific suite through a non-Jest runner.
 */
export class HtmlSanitizer {
  static sanitize(html: string): string {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  }
}
