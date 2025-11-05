import InputBar from "../components/ui/inputBar";
import AuthButton from "../components/AuthButton";
import PdfGenerator from "../components/pdfGenerator";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tighter sm:text-5xl">
          Guessify
        </h1>
        <AuthButton />
        <div className="w-[680px]">
          <InputBar />
        </div>
        <div className="w-full">
          <PdfGenerator />
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div className="flex gap-4 items-center flex-col sm:flex-row"></div>
      </footer>
    </div>
  );
}
