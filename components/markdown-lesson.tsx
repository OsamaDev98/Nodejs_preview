"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { reviewAnswers } from "@/data/review-answers";

function getReviewQuestionNumber(children: unknown): number | null {
  const text = Array.isArray(children)
    ? children.map((child) => (typeof child === "string" ? child : "")).join("")
    : typeof children === "string"
      ? children
      : "";

  const match = text.match(/^\s*(\d+)\.\s+/);
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
  const normalizedContent = useMemo(() => content.replaceAll("\\`", "`"), [content]);
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
              return <li {...props}>{children}</li>;
            }

            return (
              <li {...props} className="reviewQuestion" tabIndex={0}>
                <span className="reviewQuestionText">{children}</span>
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
