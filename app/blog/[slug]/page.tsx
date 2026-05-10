import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/lib/blog-data";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return { title: "Post Not Found" };
    return {
        title: `${post.title} — BlueSky AI Blog`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const postIndex = blogPosts.findIndex((p) => p.slug === slug);
    const post = blogPosts[postIndex];

    if (!post) notFound();

    const prev = postIndex > 0 ? blogPosts[postIndex - 1] : null;
    const next = postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : null;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Back nav */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={14} />
                    Back to Blog
                </Link>
            </div>

            {/* Article */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <header className="mb-10">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {post.category}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-3 mb-5 leading-[1.1]">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={13} />
                            {post.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={13} />
                            {post.readTime}
                        </span>
                    </div>
                </header>

                {/* Content */}
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none
                    prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-zinc-300 prose-p:leading-relaxed
                    prose-strong:text-white prose-strong:font-bold
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-code:text-primary prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl
                    prose-li:text-zinc-300
                    prose-blockquote:border-primary/30 prose-blockquote:text-zinc-400
                ">
                    <MarkdownContent content={post.content} />
                </div>
            </article>

            {/* Navigation */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
                <div className="h-px bg-white/5 mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {prev ? (
                        <Link
                            href={`/blog/${prev.slug}`}
                            className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                        >
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                <ArrowLeft size={10} /> Previous
                            </span>
                            <p className="text-sm font-bold text-white mt-2 group-hover:text-primary/90 transition-colors line-clamp-2">
                                {prev.title}
                            </p>
                        </Link>
                    ) : (
                        <div />
                    )}
                    {next ? (
                        <Link
                            href={`/blog/${next.slug}`}
                            className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all text-right"
                        >
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1 justify-end">
                                Next <ArrowRight size={10} />
                            </span>
                            <p className="text-sm font-bold text-white mt-2 group-hover:text-primary/90 transition-colors line-clamp-2">
                                {next.title}
                            </p>
                        </Link>
                    ) : (
                        <div />
                    )}
                </div>
            </div>
        </div>
    );
}

function MarkdownContent({ content }: { content: string }) {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLanguage = "";
    let inList = false;
    let listItems: string[] = [];
    let listType: "ul" | "ol" = "ul";

    const inlineFormat = (text: string): React.ReactNode => {
        const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
        return parts.filter(Boolean).map((part, i) => {
            if (!part) return null;
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            if (part.startsWith("`") && part.endsWith("`")) {
                return <code key={i}>{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    const linkFormat = (text: string): React.ReactNode => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;
        while ((match = linkRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(<span key={`t-${lastIndex}`}>{inlineFormat(text.slice(lastIndex, match.index))}</span>);
            }
            parts.push(
                <a key={`l-${match.index}`} href={match[2]} className="text-primary hover:underline">
                    {match[1]}
                </a>
            );
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            parts.push(<span key={`t-${lastIndex}`}>{inlineFormat(text.slice(lastIndex))}</span>);
        }
        return parts.length > 0 ? parts : inlineFormat(text);
    };

    const flushList = () => {
        if (listItems.length > 0) {
            const Tag = listType;
            elements.push(
                <Tag key={`list-${elements.length}`} className={listType === "ol" ? "list-decimal pl-6 space-y-2" : "list-disc pl-6 space-y-2"}>
                    {listItems.map((item, i) => (
                        <li key={i}>{linkFormat(item)}</li>
                    ))}
                </Tag>
            );
            listItems = [];
            inList = false;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("```")) {
            if (inCodeBlock) {
                flushList();
                elements.push(
                    <pre key={`code-${i}`} className="overflow-x-auto">
                        <code>{codeLines.join("\n")}</code>
                    </pre>
                );
                codeLines = [];
                inCodeBlock = false;
            } else {
                flushList();
                inCodeBlock = true;
                codeLanguage = line.slice(3).trim();
            }
            continue;
        }

        if (inCodeBlock) {
            codeLines.push(line);
            continue;
        }

        if (line === "") {
            flushList();
            continue;
        }

        if (line.startsWith("## ")) {
            flushList();
            elements.push(<h2 key={`h2-${i}`}>{line.slice(3)}</h2>);
            continue;
        }

        if (line.startsWith("### ")) {
            flushList();
            elements.push(<h3 key={`h3-${i}`}>{line.slice(4)}</h3>);
            continue;
        }

        if (line.startsWith("- ") || line.startsWith("* ")) {
            if (!inList) {
                inList = true;
                listType = "ul";
            }
            listItems.push(line.slice(2));
            continue;
        }

        if (/^\d+\.\s/.test(line)) {
            if (!inList) {
                inList = true;
                listType = "ol";
            }
            listItems.push(line.replace(/^\d+\.\s/, ""));
            continue;
        }

        flushList();
        elements.push(<p key={`p-${i}`}>{linkFormat(line)}</p>);
    }

    flushList();

    if (inCodeBlock) {
        elements.push(
            <pre key="code-final" className="overflow-x-auto">
                <code>{codeLines.join("\n")}</code>
            </pre>
        );
    }

    return <>{elements}</>;
}
