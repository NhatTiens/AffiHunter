import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-gutter text-center">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-status-warning">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-content-primary">
          Không tìm thấy trang
        </h1>
        <p className="mt-2 max-w-copy text-sm text-content-secondary">
          Đường dẫn này chưa được đăng ký trong AffiHunter.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Về tổng quan</Link>
        </Button>
      </div>
    </main>
  );
}
