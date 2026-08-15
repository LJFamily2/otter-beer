import Image from "next/image";
import { auth, signOut } from "@/auth";
import { MODULE_KEYS } from "@/config/permissions";
import { NewsBlogIcon, LogoutIcon } from "@/components/admin/icons";
import { AdminNavLink } from "../AdminNavLink";
import styles from "../AdminShell.module.css";

/**
 * Shell for every authenticated admin page (sidebar + user card + logout).
 * Deliberately lives in a (protected) route group sibling to
 * admin/dang-nhap/ so the login page never gets wrapped in this chrome —
 * see src/proxy.ts for the actual auth gate.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const permissions = session?.user?.permissions;

  const navItems = [
    {
      key: MODULE_KEYS.NEWS_BLOG,
      href: "/admin/blog",
      label: "Tin tức & Blog",
      icon: <NewsBlogIcon />,
    },
  ].filter((item) => permissions?.[item.key]?.access);

  const initial = session?.user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.brand}>
            <div className={styles.brandTitle}>Otter Beer</div>
            <div className={styles.brandSubtitle}>Cổng quản trị nội dung</div>
          </div>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <AdminNavLink key={item.key} href={item.href} icon={item.icon}>
                {item.label}
              </AdminNavLink>
            ))}
          </nav>
        </div>

        <div className={styles.footerNav}>
          <div className={styles.userCard}>
            <span className={styles.userAvatar}>
              {session?.user?.image ? (
                <Image src={session.user.image} alt="" width={28} height={28} />
              ) : (
                initial
              )}
            </span>
            <span>{session?.user?.name ?? "Không xác định"}</span>
          </div>
          <form
            className={styles.logoutForm}
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/dang-nhap" });
            }}
          >
            <button type="submit">
              <span className={styles.navIcon}>
                <LogoutIcon />
              </span>
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
