
export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-bg/80 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span>Built for focused, mobile-first CGPA planning.</span>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-1">
          <span>CGPA Mate &copy; {new Date().getFullYear()}</span>
          <span className="text-xs text-muted/70">Design and Developed by Samin</span>
        </div>
      </div>
    </footer>
  );
}
