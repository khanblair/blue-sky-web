import Link from "next/link";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import { blogPosts } from "@/lib/blog-data";

export default function BlogPage() {
    const featuredPost = blogPosts.find((p) => p.featured);
    const otherPosts = blogPosts.filter((p) => !p.featured);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero */}
            <section className="relative overflow-hidden py-20 md:py-28">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/[0.08] border border-primary/20 mb-8">
                            <Sparkles size={14} className="text-primary" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-primary">Blog</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            Insights, tutorials &{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-violet-400">
                                product updates
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Deep dives into AI, social media strategy, crypto payments, and the future of automated content creation.
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Post */}
            {featuredPost && (
                <section className="pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link href={`/blog/${featuredPost.slug}`} className="group block">
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12 hover:border-primary/20 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Featured</span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3 group-hover:text-primary/90 transition-colors">
                                            {featuredPost.title}
                                        </h2>
                                        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                            {featuredPost.excerpt}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1.5"><Calendar size={13} />{featuredPost.date}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={13} />{featuredPost.readTime}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <ArrowRight size={20} className="text-primary group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>
            )}

            {/* Post Grid */}
            <section className="py-12 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {otherPosts.map((post) => (
                            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                                <div className="flex flex-col h-full p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{post.category}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary/90 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed mb-4 flex-1 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-zinc-600 pt-4 border-t border-white/[0.04]">
                                        <span className="flex items-center gap-1.5"><Calendar size={12} />{post.date}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={12} />{post.readTime}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
                            Stay in the loop
                        </h2>
                        <p className="text-base text-zinc-400 max-w-xl mx-auto mb-6">
                            Get notified about new features, AI tips, and product updates. No spam, ever.
                        </p>
                        <Link
                            href="/sign-up"
                            className="px-8 h-12 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                        >
                            Get Started <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}