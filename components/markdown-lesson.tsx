"use client";

import { Children, isValidElement, useMemo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { reviewAnswers } from "@/data/review-answers";

function markReviewQuestions(markdown: string) {
  const headings = [
    "## أسئلة مراجعة",
    "# 163. أسئلة Interview ومراجعة شاملة",
  ];

  let reviewStart = -1;
  for (const heading of headings) {
    const index = markdown.lastIndexOf(heading);
    if (index > reviewStart) reviewStart = index;
  }

  if (reviewStart === -1) return markdown;

  const before = markdown.slice(0, reviewStart);
  const reviewSection = markdown.slice(reviewStart).replace(
    /^(\s*)(\d+)\.\s+/gm,
    (_match, spaces: string, number: string) =>
      `${spaces}${number}. REVIEW_Q_${number}:: `
  );

  return before + reviewSection;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return extractText(node.props.children);
  return "";
}

function cleanReviewMarker(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      return child.replace(/REVIEW_Q_\d+::\s*/, "");
    }

    return child;
  });
}

function getReviewQuestionNumber(children: ReactNode): number | null {
  const text = extractText(children);
  const match = text.match(/REVIEW_Q_(\d+)::/);
  if (!match) return null;

  const number = Number(match[1]);
  return Number.isFinite(number) ? number : null;
}

export function MarkdownLesson({
  content,
  chapterId,
}: {
  content: string;
  chapterId: string;
}) {
  const normalizedContent = useMemo(
    () => markReviewQuestions(content.replaceAll("\\`", "`")),
    [content]
  );
  const answers = reviewAnswers[chapterId] ?? [];

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
          li: ({ children, ...props }) => {
            const questionNumber = getReviewQuestionNumber(children);
            const answer = questionNumber ? answers[questionNumber - 1] : undefined;

            if (!answer) {
              return <li {...props}>{cleanReviewMarker(children)}</li>;
            }

            return (
              <li {...props} className="reviewQuestion" tabIndex={0}>
                <span className="reviewQuestionText">{cleanReviewMarker(children)}</span>
                <span className="reviewAnswer" role="tooltip">
                  <strong>الإجابة المختصرة</strong>
                  <span>{answer}</span>
                </span>
              </li>
            );
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </article>
  );
}
