import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownLesson({ content }: { content: string }) {
  // Chapter text lives inside String.raw template literals so escaped backticks
  // remain safe in TypeScript source. Normalize them before Markdown rendering.
  const normalizedContent = content.replaceAll("\\`", "`");

  return (
    <article className="markdownLesson">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <pre className="codeBlock">{children}</pre>,
          table: ({ children }) => (
            <div className="tableWrap">
              <table>{children}</table>
            </div>
          ),
          blockquote: ({ children }) => (
            <blockquote className="studyQuote">{children}</blockquote>
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </article>
  );
}
