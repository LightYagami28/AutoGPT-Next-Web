import React, { useCallback, useState } from "react";
import { FaCopy } from "react-icons/fa";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/default.css";

// Component definitions outside of parent to avoid re-renders
const MarkdownParagraph = (props: ComponentPropsWithoutRef<"p">) => (
  <p className="mb-4">{props.children}</p>
);

const MarkdownList = (props: ComponentPropsWithoutRef<"ul">) => (
  <ul className="ml-8 list-disc">{props.children}</ul>
);

const MarkdownOrderedList = (props: ComponentPropsWithoutRef<"ol">) => (
  <ol className="ml-8 list-decimal">{props.children}</ol>
);

const MarkdownRenderer = ({ children }: { children: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
    components={{
      pre: CustomPre,
      code: CustomCodeBlock,
      a: (props) => CustomLink({ children: props.children, href: props.href }),
      p: MarkdownParagraph,
      ul: MarkdownList,
      ol: MarkdownOrderedList,
    }}
  >
    {children}
  </ReactMarkdown>
);

const CustomPre = ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => {
  const [isCopied, setIsCopied] = useState(false);

  const code = React.Children.toArray(children).find(isValidCustomCodeBlock);

  const language: string =
    code?.props?.className
      ? extractLanguageName((code.props.className ?? "").replace("hljs ", ""))
      : "";

  const handleCopyClick = useCallback(() => {
    if (code && React.isValidElement(code)) {
      const codeString = extractTextFromNode(code.props.children);
      void navigator.clipboard.writeText(codeString);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [code]);

  return (
    <div className="mb-4 flex flex-col ">
      <div className="flex w-full items-center justify-between rounded-t-lg bg-zinc-800 p-1 px-4 text-white">
        <div>{language.charAt(0).toUpperCase() + language.slice(1)}</div>
        <button
          onClick={handleCopyClick}
          className="flex items-center gap-2 rounded px-2 py-1 hover:bg-zinc-600 focus:outline-none"
        >
          <FaCopy />
          {isCopied ? "Copied!" : "Copy Code"}
        </button>
      </div>
      <pre className="rounded-t-[0]" {...props}>
        {children}
      </pre>
    </div>
  );
};

type CustomCodeBlockProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

const CustomCodeBlock = ({
  inline,
  className,
  children,
  ...props
}: CustomCodeBlockProps) => {
  // Inline code blocks will be placed directly within a paragraph
  if (inline) {
    return (
      <code className="rounded bg-gray-200 px-1 py-[1px] text-black" {...props}>
        {children}
      </code>
    );
  }

  const language = className ? className.replace("language-", "") : "plaintext";

  return (
    <code className={`hljs ${language}`} {...props}>
      {children}
    </code>
  );
};

const CustomLink = ({ children, href }: { children: ReactNode; href?: string }) => {
  return (
    <a
      className="link overflow-hidden"
      href={href ?? ""}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

const isValidCustomCodeBlock = (
  element: ReactNode
): element is React.ReactElement<CustomCodeBlockProps> =>
  React.isValidElement(element) && element.type === CustomCodeBlock;

const extractLanguageName = (languageString: string): string => {
  // The provided language will be "language-{PROGRAMMING_LANGUAGE}"
  const parts = languageString.split("-");
  if (parts.length > 1) {
    return parts[1] || "";
  }
  return "";
};

const extractTextFromNode = (node: React.ReactNode): string => {
  if (typeof node === "string") {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(extractTextFromNode).join("");
  }

  if (React.isValidElement(node)) {
    const childProps = node.props as { children?: React.ReactNode };
    return extractTextFromNode(childProps.children ?? "");
  }

  return "";
};

export default MarkdownRenderer;
