import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Mzansi Visualised | Cost of Living Explorer",
  description: "South Africa’s data, beautifully explained.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto px-2 md:px-6 py-4 md:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
