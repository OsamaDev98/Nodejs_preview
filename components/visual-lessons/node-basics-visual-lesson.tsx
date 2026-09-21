"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, BookOpenText, Chrome, Code2, Play, RotateCcw, TerminalSquare } from "lucide-react";

const AUTO_STEP_MS = 1550;
const LAST_STEP = 4;

export function NodeBasicsVisualLesson({ onOpenReference }: { onOpenReference?: () => void }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= LAST_STEP) {
      setPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setStep((current) => Math.min(current + 1, LAST_STEP));
    }, AUTO_STEP_MS);

    return () => window.clearTimeout(timer);
  }, [playing, step]);

  function start() {
    setStep(0);
    setPlaying(true);
  }

  function replay() {
    setPlaying(false);
    setStep(0);
    window.setTimeout(() => setPlaying(true), 80);
  }

  return (
    <section className="visualLesson" aria-labelledby="visual-lesson-title">
      <div className="visualLessonTopbar">
        <div>
          <span className="visualLive"><i /> VISUAL LESSON</span>
          <span className="visualLessonMeta">الفصل 01 · المشهد 01</span>
        </div>
        <div className="visualLessonProgress" aria-label="تقدم المشهد">
          {Array.from({ length: LAST_STEP + 1 }, (_, index) => (
            <span key={index} className={step >= index ? "active" : ""} />
          ))}
        </div>
      </div>

      <div className="visualLessonStage">
        <div className="visualAmbient visualAmbientOne" />
        <div className="visualAmbient visualAmbientTwo" />
        <div className="visualGrid" />

        <div className="visualCopy">
          <span className="visualEyebrow">قبل ما نفهم Node.js</span>
          <h2 id="visual-lesson-title">
            JavaScript <em>مش عايشة جوه المتصفح</em>
          </h2>
          <p>اللغة واحدة، لكن البيئة التي تشغّلها يمكن أن تتغير.</p>
        </div>

        <div className={`runtimeStory step-${step}`}>
          <article className="runtimeWindow browserWindow">
            <div className="runtimeWindowHeader">
              <span className="windowDots"><i /><i /><i /></span>
              <span><Chrome size={16} /> Browser</span>
            </div>
            <div className="runtimeWindowBody">
              <span className="runtimeLabel">Browser Runtime</span>
              <code><b>console</b>.log(<q>Hello JavaScript</q>);</code>
              <div className="runtimeOutput">Hello JavaScript</div>
            </div>
          </article>

          <div className="javascriptFile" aria-hidden="true">
            <Code2 size={22} />
            <strong>app.js</strong>
            <small>JavaScript</small>
          </div>

          <div className="runtimeConnector" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>

          <article className="runtimeWindow terminalWindow">
            <div className="runtimeWindowHeader">
              <span className="windowDots"><i /><i /><i /></span>
              <span><TerminalSquare size={16} /> Node.js</span>
            </div>
            <div className="runtimeWindowBody">
              <span className="runtimeLabel">Node.js Runtime</span>
              <code><b>$</b> node app.js</code>
              <div className="runtimeOutput">Hello JavaScript</div>
            </div>
          </article>
        </div>

        <div className={`runtimeConclusion ${step >= 4 ? "visible" : ""}`}>
          <div><strong>JavaScript</strong><span>Language</span></div>
          <b>≠</b>
          <div><strong>Browser / Node.js</strong><span>Runtime Environments</span></div>
        </div>

        <div className="visualLessonCaption" aria-live="polite">
          {step === 0 && "ابدأ المشهد وشاهد نفس ملف JavaScript يعمل في بيئتين مختلفتين."}
          {step === 1 && "في البداية نرى JavaScript تعمل داخل Browser Runtime."}
          {step === 2 && "لكن ملف JavaScript نفسه ليس جزءًا من المتصفح."}
          {step === 3 && "Node.js يوفر Runtime آخر يستطيع تشغيل الملف خارج المتصفح."}
          {step === 4 && "ثبّت الفكرة: JavaScript لغة، أما Browser وNode.js فهما بيئتا تشغيل."}
        </div>
      </div>

      <div className="visualLessonControls">
        <div>
          {step === 0 && !playing ? (
            <button className="visualPrimaryButton" onClick={start}>
              <Play size={17} fill="currentColor" />
              ابدأ المشهد
            </button>
          ) : (
            <button className="visualSecondaryButton" onClick={replay}>
              <RotateCcw size={16} />
              إعادة المشهد
            </button>
          )}
        </div>

        <div className="visualLessonActions">
          <button className="visualReferenceButton" onClick={onOpenReference}>
            <BookOpenText size={16} />
            التفاصيل والمرجع
            <ArrowDown size={15} />
          </button>
          <div className="visualLessonHint">
            <span>المشهد التالي</span>
            <strong>ما معنى Runtime؟</strong>
            <ArrowLeft size={17} />
          </div>
        </div>
      </div>
    </section>
  );
}
