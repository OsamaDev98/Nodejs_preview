import { StudyShell } from "@/components/study-shell";
import { chapters } from "@/data/chapters";

export default function Home() {
  return <StudyShell chapters={chapters} />;
}
