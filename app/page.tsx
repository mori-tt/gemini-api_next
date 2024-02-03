import Image from "next/image";
import Gemini from "./components/gemini";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Gemini />
    </main>
  );
}
