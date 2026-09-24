export default function AuthShell({ children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf3] px-5 py-10 text-[#2d3559] sm:px-6 sm:py-12">
      <div className="paper-dots pointer-events-none absolute inset-0 opacity-40" />
      <span className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-[#e8e2ff]/70 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-[#dff5e8]/80 blur-3xl" />
      <div className="relative w-full">{children}</div>
    </main>
  );
}
