export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-bg/80 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>Built for focused, mobile-first CGPA planning.</span>
        <span>CGPA Mate - {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
