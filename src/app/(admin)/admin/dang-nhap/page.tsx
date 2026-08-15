import type { Metadata } from "next";
import { signIn } from "@/auth";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
};

interface AdminLoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { callbackUrl, error } = await searchParams;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.goldAccent} />
          <div className={styles.cardInner}>
            <div className={styles.branding}>
              <h1 className={styles.wordmark}>Otter Beer</h1>
              <p className={styles.tagline}>Cổng quản trị</p>
            </div>

            <div className={styles.divider} />

            {error ? (
              <p className={styles.errorBanner} role="alert">
                Truy cập bị từ chối. Tài khoản của bạn chưa được cấp quyền
                hoặc đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.
              </p>
            ) : null}

            <form
              className={styles.form}
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl || "/admin" });
              }}
            >
              <button type="submit" className={styles.googleButton}>
                <GoogleIcon className={styles.googleIcon} />
                Đăng nhập với Google
              </button>
            </form>

            <p className={styles.helperText}>
              Chỉ những tài khoản đã được cấp quyền mới có thể đăng nhập.
            </p>
          </div>
        </div>

        <div className={styles.footer}>Chỉ dành cho nhân viên được ủy quyền</div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#fff",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
        />
      </svg>
    </span>
  );
}
