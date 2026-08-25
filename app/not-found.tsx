import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="app-shell">
      <Topbar />
      <main id="main-content" className="container" tabIndex={-1}>
        <div className="state-block mt-5" role="alert">
          <div className="icon-bubble" aria-hidden="true">
            <Icon name="warning" size={28} />
          </div>
          <p className="state-title">Page not found</p>
          <p className="state-body">That page does not exist.</p>
          <p>
            <Link href="/" className="btn btn-primary">
              <Icon name="arrow-left" size={18} aria-hidden />
              Go home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
