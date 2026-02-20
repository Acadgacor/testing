export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-100 bg-neutral-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <span className="text-lg font-bold text-brand-dark tracking-tight">Beaulytics</span>
            <p className="mt-2 text-sm text-brand-light">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium">
            <a href="#" className="text-brand-light hover:text-brand-dark transition-colors">Privacy</a>
            <a href="#" className="text-brand-light hover:text-brand-dark transition-colors">Terms</a>
            <a href="#" className="text-brand-light hover:text-brand-dark transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
