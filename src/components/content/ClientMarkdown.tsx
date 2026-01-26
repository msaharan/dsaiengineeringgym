"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ClientMarkdownProps = {
  content: string;
  className?: string;
};

export default function ClientMarkdown({
  content,
  className,
}: ClientMarkdownProps) {
  const classes = className ? `markdown ${className}` : "markdown";

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} className={classes}>
      {content}
    </ReactMarkdown>
  );
}
