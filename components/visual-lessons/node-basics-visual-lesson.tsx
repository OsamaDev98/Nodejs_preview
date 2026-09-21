"use client";

import { useEffect, useState } from "react";
import { ArrowDown, BookOpenText, Check, ChevronLeft, Chrome, Code2, Pause, Play, RotateCcw, SquareTerminal } from "lucide-react";

const LAST_STEP = 4;
const STEP_DURATION_MS = [4200, 5200, 5400, 5600, 7000];

const captions = [
  "عندنا ملف واحد اسمه app.js. الكود المكتوب بداخله هو JavaScript.",
  "المتصفح يستطيع تنفيذ JavaScript داخل بيئة التشغيل الخاصة به.",
  "لاحظ: app.js لم يتغير. سنشغّل نفس الكود في بيئة أخرى.",
  "Node.js يشغّل نفس JavaScript خارج المتصفح ويوفر لها بيئة تشغيل مختلفة.",
  "الخلاصة: JavaScript هي اللغة. Browser وNode.js بيئتان مختلفتان لتشغيلها.",
];

export function NodeBasicsVisualLesson({ onOpenReference }: { onOpenReference?: () => void }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!playing || step >= LAST_STEP) return;
    const timer = window.setTimeout(() => setStep((current) => Math.min(current + 1, LAST_STEP)), STEP_DURATION_MS[step]);
    return () => window.clearTimeout(timer);
  }, [playing, step]);

  useEffect(() => {
    if (step === LAST_STEP) setPlaying(false);
  }, [step]);

  function start() {
    setStarted(true);
    setStep(0);
    setPlaying(true);
  }

  function next() {
    setStarted(true);
    setPlaying(false);
    setStep((current) => Math.min(current + 1, LAST_STEP));
  }

  function replay() {
    setStarted(true);
    setStep(0);
    setPlaying(true);
  }

  return (
    <section className="visualLesson visualJourney" aria-labelledby="visual-lesson-title">
      <div className="visualLessonTopbar">
        <div>
          <span className="visualLive"><i /> VISUAL LESSON</span>
          <span className="visualLessonMeta">رحلة 01 · اللغة وبيئة التشغيل</span>
        </div>
        <div className="visualLessonProgress" aria-label="تقدم الرحلة">
          {Array.from({ length: LAST_STEP + 1 }, (_, index) => <span key={index} className={step >= index && started ? "active" : ""} />)}
        </div>
      </div>

      <div className="visualLessonStage">
        <div className="visualAmbient visualAmbientOne" /><div className="visualAmbient visualAmbientTwo" /><div className="visualGrid" />
        <div className="visualCopy">
          <span className="visualEyebrow">فكرة واحدة في أقل من دقيقة</span>
          <h2 id="visual-lesson-title">JavaScript هي اللغة، <em>لكن أين تعمل؟</em></h2>
          <p>تابع ملفًا واحدًا وهو يعمل داخل بيئتين مختلفتين.</p>
        </div>

        <div className={`runtimeStory journeyStep-${started ? step : "idle"}`}>
          <article className="runtimeWindow browserWindow">
            <div className="runtimeWindowHeader"><span className="windowDots"><i /><i /><i /></span><span><Chrome size={16} /> Browser</span></div>
            <div className="runtimeWindowBody"><span className="runtimeLabel">Browser Runtime</span><code><b>console</b>.log(<q>Hello JavaScript</q>);</code><div className="runtimeOutput">Hello JavaScript</div></div>
          </article>

          <div className="javascriptFile" aria-hidden="true"><Code2 size={22} /><strong>app.js</strong><small>JavaScript</small></div>
          <div className="runtimeConnector" aria-hidden="true"><span /><i /><span /></div>

          <article className="runtimeWindow terminalWindow">
            <div className="runtimeWindowHeader"><span className="windowDots"><i /><i /><i /></span><span><SquareTerminal size={16} /> Node.js</span></div>
            <div className="runtimeWindowBody"><span className="runtimeLabel">Node.js Runtime</span><code><b>$</b> node app.js</code><div className="runtimeOutput">Hello JavaScript</div></div>
          </article>
        </div>

        <div className={`runtimeConclusion ${started && step >= 4 ? "visible" : ""}`}>
          <div><strong>JavaScript</strong><span>Language</span></div><b>≠</b><div><strong>Browser / Node.js</strong><span>Runtime Environments</span></div>
        </div>

        <div className="visualLessonCaption" aria-live="polite">{started ? captions[step] : "اضغط «ابدأ الرحلة» وسنشرح الفكرة خطوة بخطوة."}</div>
        {started && step === LAST_STEP && <div className="visualAchievement"><Check size={16} /><span><strong>أنجزت 1 من 5</strong> · الآن تعرف الفرق بين JavaScript وبيئة التشغيل.</span></div>}
      </div>

      <div className="visualLessonControls">
        <div className="visualPlayback">
          {!started ? (
            <button className="visualPrimaryButton" onClick={start}><Play size={17} fill="currentColor" />ابدأ الرحلة</button>
          ) : (
            <>
              <button className="visualSecondaryButton" onClick={() => setPlaying((value) => !value)} disabled={step === LAST_STEP}>
                {playing ? <Pause size={16} /> : <Play size={16} />}{playing ? "إيقاف مؤقت" : "متابعة"}
              </button>
              {step < LAST_STEP && <button className="visualNextButton" onClick={next}>التالي <ChevronLeft size={15} /></button>}
              <button className="visualIconButton" onClick={replay} aria-label="إعادة الرحلة"><RotateCcw size={15} /></button>
            </>
          )}
        </div>
        <div className="visualLessonActions">
          <button className="visualReferenceButton" onClick={onOpenReference}><BookOpenText size={16} />التفاصيل والمرجع<ArrowDown size={15} /></button>
        </div>
      </div>
    </section>
  );
}
