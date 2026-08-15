import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { blogPostService } from "@/services/BlogPostService";
import { pickTranslation } from "@/lib/utils/BlogPostPresenter";
import { PlusIcon, SearchIcon, EditIcon, TrashIcon } from "@/components/admin/icons";
import { DeletePostButton } from "./DeletePostButton";
import styles from "./BlogListPage.module.css";

export const metadata: Metadata = {
  title: "Tin tức & Blog",
  robots: { index: false, follow: false },
};

interface PopulatedAuthor {
  name: string;
  email: string;
  image?: string;
}

interface BlogListPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default async function BlogListPage({
  searchParams,
}: BlogListPageProps) {
  const session = await auth();
  const grant = session?.user?.permissions?.news_blog;

  if (!grant?.view) {
    return (
      <div className={styles.emptyState}>
        Bạn không có quyền xem nội dung này.
      </div>
    );
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const search = params.search?.trim() || undefined;

  const [stats, result] = await Promise.all([
    blogPostService.getDashboardStats(),
    blogPostService.list({ search }, { page, pageSize: 10 }),
  ]);

  const buildPageHref = (targetPage: number) => {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    qs.set("page", String(targetPage));
    return `/admin/blog?${qs.toString()}`;
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Quản lý Tin tức & Blog</h1>
          <p className={styles.headerSubtitle}>
            Theo dõi bài viết, thông báo, và cập nhật từ nhà máy bia.
          </p>
        </div>
        {grant.add ? (
          <Link href="/admin/blog/moi" className={styles.createButton}>
            <PlusIcon width={14} height={14} />
            Tạo bài viết
          </Link>
        ) : null}
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiAccent} />
          <div className={styles.kpiLabel}>Tổng số bài viết</div>
          <div className={styles.kpiValue}>{stats.total}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Đã xuất bản</div>
          <div className={styles.kpiValue}>{stats.published}</div>
          <div className={styles.kpiHint}>Đang hiển thị trên trang web</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Bản nháp</div>
          <div className={styles.kpiValue}>{stats.draft}</div>
          <div className={styles.kpiHint}>Cần xem lại</div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <h2 className={styles.tableTitle}>Bài viết gần đây</h2>
          <form className={styles.searchForm} action="/admin/blog" method="get">
            <input
              className={styles.searchInput}
              type="search"
              name="search"
              placeholder="Tìm kiếm bài viết..."
              defaultValue={search}
            />
            <button
              type="submit"
              className={styles.rowActionButton}
              aria-label="Tìm kiếm"
            >
              <SearchIcon width={16} height={16} />
            </button>
          </form>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tiêu đề bài viết</th>
                <th>Tác giả</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((post) => {
                const translation = pickTranslation(post, "vi");
                const author = post.authorId as unknown as PopulatedAuthor;
                const postId = String(post._id);

                return (
                  <tr key={postId}>
                    <td className={styles.postTitleCell}>
                      <Link
                        href={`/admin/blog/${postId}/sua`}
                        className={styles.postTitleLink}
                      >
                        {translation?.title ?? "(Chưa có tiêu đề)"}
                      </Link>
                    </td>
                    <td>{author?.name ?? "—"}</td>
                    <td>{dateFormatter.format(post.createdAt)}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          post.status === "published"
                            ? styles.badgePublished
                            : styles.badgeDraft
                        }`}
                      >
                        {post.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        {grant.edit ? (
                          <Link
                            href={`/admin/blog/${postId}/sua`}
                            className={styles.rowActionButton}
                            aria-label="Sửa"
                          >
                            <EditIcon width={15} height={15} />
                          </Link>
                        ) : null}
                        {grant.delete ? (
                          <DeletePostButton postId={postId}>
                            <TrashIcon width={15} height={15} />
                          </DeletePostButton>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {result.items.length === 0 ? (
            <div className={styles.emptyState}>
              {search
                ? `Không tìm thấy bài viết nào khớp với "${search}".`
                : "Chưa có bài viết nào."}
            </div>
          ) : null}
        </div>

        <div className={styles.tableFooter}>
          <span>
            Hiển thị {result.items.length === 0 ? 0 : (result.page - 1) * result.pageSize + 1}
            {" "}đến {Math.min(result.page * result.pageSize, result.total)} trong tổng số{" "}
            {result.total} bài viết
          </span>
          <div className={styles.pagination}>
            <Link
              href={buildPageHref(Math.max(1, result.page - 1))}
              className={`${styles.pageLink} ${
                result.page <= 1 ? styles.pageLinkDisabled : ""
              }`}
            >
              Trước
            </Link>
            {Array.from({ length: result.totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((p) => (
                <Link
                  key={p}
                  href={buildPageHref(p)}
                  className={`${styles.pageLink} ${
                    p === result.page ? styles.pageLinkActive : ""
                  }`}
                >
                  {p}
                </Link>
              ))}
            <Link
              href={buildPageHref(Math.min(result.totalPages, result.page + 1))}
              className={`${styles.pageLink} ${
                result.page >= result.totalPages ? styles.pageLinkDisabled : ""
              }`}
            >
              Sau
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
