import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { blogPostService } from "@/services/BlogPostService";
import { pickTranslation } from "@/lib/utils/BlogPostPresenter";
import { buildBlogListMetadata, localizedPath } from "@/lib/seo";
import { publicImageUrl } from "@/lib/storage/constants";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

interface BlogListPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export async function generateMetadata({
  params,
}: BlogListPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildBlogListMetadata(locale);
}

export default async function BlogListPage({
  params,
  searchParams,
}: BlogListPageProps) {
  const { locale } = await params;
  const { page: pageParam, tag } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;
  const isVi = locale === "vi";

  const result = await blogPostService
    .listPublished({
      page,
      pageSize: PAGE_SIZE,
      tag,
    })
    .catch(() => ({ items: [], totalPages: 1, total: 0 }));

  // Only feature a post on the unfiltered first page — a tag filter should
  // show a plain filtered grid, not a featured pick that may not match it.
  const showFeatured = page === 1 && !tag;
  const featured = showFeatured ? (result.items[0] ?? null) : null;
  const rest = showFeatured ? result.items.slice(1) : result.items;
  const featuredTranslation = featured ? pickTranslation(featured, locale) : null;

  const buildHref = (targetPage: number) =>
    `${localizedPath(locale, "/blog")}?page=${targetPage}`;

  return (
    <>
      <section className="bg-surface-container-low px-5 py-16 text-center">
        <h1 className="text-[clamp(40px,7vw,72px)] tracking-wide text-primary">
          {isVi ? "Biên Niên Sử Otter" : "The Otter Chronicles"}
        </h1>
        <p className="mx-auto mt-4 max-w-[640px] text-lg leading-relaxed text-on-surface-variant">
          {isVi
            ? "Câu chuyện từ vùng biển, cập nhật từ nhà máy bia, và những góc nhìn sâu về quy trình chế biến của chúng tôi."
            : "Tales from the coastal waters, brewery updates, and deep dives into our crafting process."}
        </p>
      </section>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-5 py-16">
        {featured && featuredTranslation ? (
          <Link
            href={localizedPath(locale, `/blog/${featuredTranslation.slug}`)}
            className="relative block min-h-[420px] overflow-hidden rounded-lg border border-[rgba(196,198,210,0.3)] text-inherit no-underline shadow-sm"
          >
            {featured.coverImageKey ? (
              <div className="absolute inset-0">
                <Image
                  src={publicImageUrl(featured.coverImageKey)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1320px) calc(100vw - 40px), 1280px"
                  priority
                />
              </div>
            ) : null}
            <div className="relative flex min-h-[420px] flex-col justify-end bg-gradient-to-t from-white from-10% via-white/55 via-55% to-white/10 p-12">
              {featured.tags[0] ? (
                <Badge variant="overlay" className="mb-2 self-start">
                  {featured.tags[0]}
                </Badge>
              ) : null}
              <h2 className="mb-2 text-[clamp(28px,4vw,44px)] tracking-wide text-primary">
                {featuredTranslation.title}
              </h2>
              <p className="mb-2 max-w-[640px] text-[17px] leading-relaxed text-on-surface-variant">
                {featuredTranslation.excerpt}
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                {isVi ? "Đọc câu chuyện →" : "Read Story →"}
              </span>
            </div>
          </Link>
        ) : null}

        {result.items.length === 0 ? (
          <p className="py-20 text-center text-on-surface-variant">
            {isVi ? "Chưa có bài viết nào." : "No posts yet."}
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {rest.map((post) => {
              const translation = pickTranslation(post, locale);
              if (!translation) return null;
              return (
                <Link
                  key={String(post._id)}
                  href={localizedPath(locale, `/blog/${translation.slug}`)}
                  className="flex flex-col overflow-hidden rounded-lg border border-[rgba(196,198,210,0.3)] bg-surface-container-lowest text-inherit no-underline shadow-[0px_1px_2px_0px_rgba(0,40,103,0.05)]"
                >
                  <div className="relative aspect-[16/10] border-b-2 border-secondary-fixed-dim bg-surface-container-high">
                    {post.coverImageKey ? (
                      <Image
                        src={publicImageUrl(post.coverImageKey)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    {post.tags[0] ? (
                      <Badge variant="overlay" className="mb-2 self-start">
                        {post.tags[0]}
                      </Badge>
                    ) : null}
                    <h3 className="mb-2 text-xl tracking-wide text-primary">
                      {translation.title}
                    </h3>
                    <p className="mb-2 line-clamp-3 flex-1 text-[15px] leading-relaxed text-on-surface-variant">
                      {translation.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                      {isVi ? "Đọc thêm →" : "Read More →"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={result.totalPages}
          buildHref={buildHref}
          variant="pill"
        />
      </div>
    </>
  );
}
