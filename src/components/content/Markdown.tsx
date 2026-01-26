import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  content: string;
  className?: string;
};

export default function Markdown({ content, className }: MarkdownProps) {
  const classes = className ? `markdown ${className}` : "markdown";

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} className={classes}>
      {content}
    </ReactMarkdown>
  );
}
