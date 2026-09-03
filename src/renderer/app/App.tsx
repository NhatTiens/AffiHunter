import { Routes, Route, Link } from "react-router-dom";

function Placeholder() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Project foundation</h1>
      <p className="mt-2 text-content-secondary">
        Application scaffold is ready. Business screens will be implemented in
        later phases.
      </p>
    </div>
  );
}

export function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border-subtle bg-surface-sidebar p-4">
        <Link to="/" className="font-semibold">
          AffiHunter
        </Link>
      </nav>
      <section className="mx-auto max-w-5xl p-gutter">
        <Routes>
          <Route path="*" element={<Placeholder />} />
        </Routes>
      </section>
    </main>
  );
}
