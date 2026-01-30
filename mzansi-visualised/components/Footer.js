export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950/90 text-center py-4 text-xs text-slate-400 mt-8">
      <div>
        &copy; {new Date().getFullYear()} Mzansi Visualised. Sample data for MVP
        UI demo.
      </div>
    </footer>
  );
}
