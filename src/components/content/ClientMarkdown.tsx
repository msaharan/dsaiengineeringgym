"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

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
    <div className={classes}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
