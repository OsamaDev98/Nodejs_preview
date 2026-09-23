"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, Search, X } from "lucide-react";
import { MarkdownLesson } from "@/components/markdown-lesson";
import { NodeBasicsVisualLesson } from "@/components/visual-lessons/node-basics-visual-lesson";
import type { StudyChapter } from "@/types/study";

export function StudyShell({ chapters }: { chapters: StudyChapter[] }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredChapters = useMemo(() => {
    if (!normalizedQuery) return chapters;
    return chapters.filter((chapter) =>
      [chapter.title, chapter.subtitle, chapter.keywords.join(" "), chapter.content]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [chapters, normalizedQuery]);

  const activeChapter = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0];
  const activeIndex = chapters.findIndex((chapter) => chapter.id === activeChapter?.id);
  const previousChapter = activeIndex > 0 ? chapters[activeIndex - 1] : undefined;
  const nextChapter = activeIndex >= 0 && activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : undefined;

  function chooseChapter(id: string) {
    setActiveId(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!activeChapter) return null;

  return (
    <main className="studyApp dark cinematicApp">
      <button className="mobileMenuButton" onClick={() => setMenuOpen(true)} aria-label="فتح قائمة الفصول">
        <Menu size={20} />
      </button>

      <aside className={menuOpen ? "studySidebar open" : "studySidebar"}>
        <div className="sidebarHeader">
          <div>
            <div className="brandMark">N</div>
            <div><strong>Node.js Study Hub</strong><span>Cinematic Backend Course</span></div>
          </div>
          <button className="iconButton mobileOnly" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة"><X size={18} /></button>
        </div>

        <div className="searchBox">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في كل الشرح..." aria-label="البحث في الشرح" />
        </div>

        <div className="sidebarMeta"><span>{chapters.length} فصول</span><span>مشاهد تعليمية</span></div>

        <nav className="chapterNav" aria-label="فصول Node.js">
          {filteredChapters.length === 0 ? <div className="emptySearch">لا توجد نتائج مطابقة.</div> : filteredChapters.map((chapter) => (
            <button key={chapter.id} onClick={() => chooseChapter(chapter.id)} className={activeChapter.id === chapter.id ? "chapterLink active" : "chapterLink"}>
              <span className="chapterNumber">{String(chapter.number).padStart(2, "0")}</span>
              <span className="chapterLinkText"><strong>{chapter.title}</strong></span>
            </button>
          ))}
        </nav>
      </aside>

      {menuOpen && <button className="sidebarBackdrop" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة" />}

      <section className="studyContent cinematicContent">
        <div className="chapterStageLabel">
          <span>CHAPTER {String(activeChapter.number).padStart(2, "0")}</span>
          <strong>{activeChapter.title}</strong>
        </div>

        {activeChapter.id === "foundations" ? (
          <NodeBasicsVisualLesson content={activeChapter.content} />
        ) : (
          <MarkdownLesson content={activeChapter.content} chapterId={activeChapter.id} />
        )}

        <footer className="lessonNavigation cinematicNavigation">
          {previousChapter ? (
            <button onClick={() => chooseChapter(previousChapter.id)} className="lessonNavButton">
              <ChevronRight size={18} /><span><small>الفصل السابق</small><strong>{previousChapter.title}</strong></span>
            </button>
          ) : <span />}
          {nextChapter && (
            <button onClick={() => chooseChapter(nextChapter.id)} className="lessonNavButton next">
              <span><small>الفصل التالي</small><strong>{nextChapter.title}</strong></span><ChevronLeft size={18} />
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}
