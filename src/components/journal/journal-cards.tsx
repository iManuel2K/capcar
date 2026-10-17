import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  journalArticlePath,
  type JournalArticle,
} from "@/features/journal/articles";

export function JournalCards({ articles }: { articles: JournalArticle[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={journalArticlePath(article.slug)}
          className="group overflow-hidden rounded-[1.5rem] border border-[#0e2d30]/15 bg-[#f5f2e8] transition hover:border-[#92644d] focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <div className="relative aspect-[16/9] overflow-hidden bg-[#0e2d30]">
            <Image
              src={article.image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-widest text-[#79503c] uppercase">
              {article.category} · {article.minutes} Min.
            </p>
            <h2 className="mt-4 flex items-start justify-between gap-4 text-2xl leading-tight font-medium tracking-tight">
              {article.title}
              <ArrowUpRight
                className="mt-1 size-5 shrink-0"
                aria-hidden="true"
              />
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#0e2d30]/75">
              {article.description}
            </p>
            <p className="mt-6 text-sm font-semibold">
              Artikel und Vorlage ansehen →
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
