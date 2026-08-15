import Image from "next/image";
import { auth, signOut } from "@/auth";
import { MODULE_KEYS } from "@/config/permissions";
import { NewsBlogIcon, LogoutIcon } from "@/components/admin/icons";
import { AdminNavLink } from "../AdminNavLink";

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
    <div className="flex min-h-dvh bg-surface">
      <aside className="sticky top-0 flex h-dvh w-64 shrink-0 flex-col justify-between border-r border-[rgba(196,198,210,0.2)] bg-surface-container-low py-8 shadow-[0px_4px_6px_-1px_rgba(0,40,103,0.05),0px_2px_4px_-2px_rgba(0,40,103,0.05)] max-[900px]:hidden">
        <div>
          <div className="px-6 pb-8">
            <div className="text-2xl leading-[1.3] tracking-wide text-primary">
              Otter Beer
            </div>
            <div className="mt-1 text-xs font-medium leading-[1.3] text-on-surface-variant">
              Cổng quản trị nội dung
            </div>
          </div>
          <nav className="flex flex-col gap-1 px-6 pt-1">
            {navItems.map((item) => (
              <AdminNavLink key={item.key} href={item.href} icon={item.icon}>
                {item.label}
              </AdminNavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-1 px-6">
          <div className="flex items-center gap-2 px-4 pb-4 pt-2 text-xs text-on-surface-variant">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-display text-xs text-on-primary">
              {session?.user?.image ? (
                <Image src={session.user.image} alt="" width={28} height={28} />
              ) : (
                initial
              )}
            </span>
            <span>{session?.user?.name ?? "Không xác định"}</span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/dang-nhap" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-bold tracking-wide text-on-surface-variant hover:bg-surface-container"
            >
              <span className="h-[18px] w-[18px] shrink-0">
                <LogoutIcon />
              </span>
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      <main className="max-w-[1280px] flex-1 min-w-0 p-16 max-[900px]:px-5 max-[900px]:py-8">
        {children}
      </main>
    </div>
  );
}
