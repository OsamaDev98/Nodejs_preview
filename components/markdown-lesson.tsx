import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownLesson({ content }: { content: string }) {
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
        {content}
      </ReactMarkdown>
    </article>
  );
}
