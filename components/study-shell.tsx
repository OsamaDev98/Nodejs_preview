"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { MarkdownLesson } from "@/components/markdown-lesson";
import { NodeBasicsVisualLesson } from "@/components/visual-lessons/node-basics-visual-lesson";
import type { StudyChapter } from "@/types/study";

const PROGRESS_KEY = "nodejs-study-progress-v2";
const THEME_KEY = "nodejs-study-theme-v2";

export function StudyShell({ chapters }: { chapters: StudyChapter[] }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(true);
  const [done, setDone] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "[]") as string[];
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (Array.isArray(savedProgress)) setDone(savedProgress);
      if (savedTheme === "light") setDark(false);
    } catch {
      // Invalid local persistence should never block the study experience.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(done));
  }, [done, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark, hydrated]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredChapters = useMemo(() => {
    if (!normalizedQuery) return chapters;
    return chapters.filter((chapter) => {
      const searchable = [
        chapter.title,
        chapter.subtitle,
        chapter.keywords.join(" "),
        chapter.content,
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [chapters, normalizedQuery]);

  const activeChapter =
    chapters.find((chapter) => chapter.id === activeId) ?? chapters[0];
  const activeIndex = chapters.findIndex((chapter) => chapter.id === activeChapter?.id);
  const previousChapter = activeIndex > 0 ? chapters[activeIndex - 1] : undefined;
  const nextChapter = activeIndex >= 0 && activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : undefined;
  const progress = chapters.length === 0 ? 0 : Math.round((done.length / chapters.length) * 100);

  function chooseChapter(id: string) {
    setActiveId(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openReference() {
    document.getElementById("lesson-reference")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleDone(id: string) {
    setDone((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  if (!activeChapter) return null;

  return (
    <main className={dark ? "studyApp dark" : "studyApp"}>
      <button className="mobileMenuButton" onClick={() => setMenuOpen(true)} aria-label="فتح قائمة الفصول">
        <Menu size={20} />
      </button>

      <aside className={menuOpen ? "studySidebar open" : "studySidebar"}>
        <div className="sidebarHeader">
          <div>
            <div className="brandMark">N</div>
            <div>
              <strong>Node.js Study Hub</strong>
              <span>Backend Reference</span>
            </div>
          </div>
          <button className="iconButton mobileOnly" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة">
            <X size={18} />
          </button>
        </div>

        <div className="searchBox">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث في كل الشرح..."
            aria-label="البحث في الشرح"
          />
        </div>

        <div className="sidebarMeta">
          <span>{chapters.length} فصول</span>
          <span>مرجع تفصيلي</span>
        </div>

        <nav className="chapterNav" aria-label="فصول Node.js">
          {filteredChapters.length === 0 ? (
            <div className="emptySearch">لا توجد نتائج مطابقة.</div>
          ) : (
            filteredChapters.map((chapter) => {
              const completed = done.includes(chapter.id);
              return (
                <button
                  key={chapter.id}
                  onClick={() => chooseChapter(chapter.id)}
                  className={activeChapter.id === chapter.id ? "chapterLink active" : "chapterLink"}
                >
                  <span className="chapterNumber">{String(chapter.number).padStart(2, "0")}</span>
                  <span className="chapterLinkText">
                    <strong>{chapter.title}</strong>
                    <small>{chapter.readingTime}</small>
                  </span>
                  {completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
              );
            })
          )}
        </nav>

        <div className="progressCard">
          <div className="progressHeader">
            <span>تقدم المذاكرة</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progressTrack"><span style={{ width: `${progress}%` }} /></div>
          <small>{done.length} من {chapters.length} فصول مكتملة</small>
        </div>
      </aside>

      {menuOpen && <button className="sidebarBackdrop" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة" />}

      <section className="studyContent">
        <header className="lessonHeader">
          <div className="lessonHeaderTop">
            <div className="breadcrumbs">
              <BookOpen size={16} />
              <span>مرجع Node.js العربي</span>
              <span>/</span>
              <span>الفصل {activeChapter.number}</span>
            </div>
            <button className="themeButton" onClick={() => setDark((value) => !value)}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
              <span>{dark ? "الوضع الفاتح" : "الوضع الداكن"}</span>
            </button>
          </div>

          <div className="lessonIntro">
            <span className="lessonKicker">الفصل {String(activeChapter.number).padStart(2, "0")}</span>
            <h1>{activeChapter.title}</h1>
            <p>{activeChapter.subtitle}</p>
            <div className="lessonStats">
              <span><Clock3 size={16} />{activeChapter.readingTime}</span>
              <span><BookOpen size={16} />شرح تفصيلي + أمثلة + مراجعة</span>
            </div>
            <div className="keywordList">
              {activeChapter.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
            </div>
          </div>

          <button
            className={done.includes(activeChapter.id) ? "completeButton completed" : "completeButton"}
            onClick={() => toggleDone(activeChapter.id)}
          >
            {done.includes(activeChapter.id) ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            {done.includes(activeChapter.id) ? "تمت مذاكرة الفصل" : "علّم الفصل كمكتمل"}
          </button>
        </header>

        {activeChapter.id === "foundations" && <NodeBasicsVisualLesson />}

        <MarkdownLesson content={activeChapter.content} chapterId={activeChapter.id} />

        <footer className="lessonNavigation">
          {previousChapter ? (
            <button onClick={() => chooseChapter(previousChapter.id)} className="lessonNavButton">
              <ChevronRight size={18} />
              <span><small>السابق</small><strong>{previousChapter.title}</strong></span>
            </button>
          ) : <span />}

          {nextChapter && (
            <button onClick={() => chooseChapter(nextChapter.id)} className="lessonNavButton next">
              <span><small>التالي</small><strong>{nextChapter.title}</strong></span>
              <ChevronLeft size={18} />
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}
