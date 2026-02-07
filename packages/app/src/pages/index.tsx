import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type TimeLeft = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/* ---------------- Date diff ---------------- */

const diffParts = (from: Date, to: Date): TimeLeft => {
  const start = new Date(from);
  const end = new Date(to);

  /* -------- Total months -------- */

  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  const tempDate = new Date(start);
  tempDate.setMonth(tempDate.getMonth() + totalMonths);

  if (tempDate > end) {
    totalMonths -= 1;
    tempDate.setMonth(tempDate.getMonth() - 1);
  }

  /* -------- Years + months split -------- */

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  /* -------- Remaining time -------- */

  const diff = end.getTime() - tempDate.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { years, months, days, hours, minutes, seconds };
};

/* ---------------- Helpers ---------------- */

const getParamDate = (key: string, fallback: Date) => {
  if (globalThis.window === undefined) return fallback;

  const params = new URLSearchParams(globalThis.window.location.search);
  const v = params.get(key);

  return v ? new Date(v) : fallback;
};

const getInitialStart = () => getParamDate('start', new Date());

const getInitialEnd = () =>
  getParamDate('end', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

const getInitialTitle = () => {
  if (globalThis.window === undefined) return 'My Countdown';

  const params = new URLSearchParams(globalThis.window.location.search);
  return params.get('title') || 'My Countdown';
};

const calcProgress = (start: Date, end: Date) => {
  const now = Date.now();
  const s = start.getTime();
  const e = end.getTime();

  if (now <= s) return 0;
  if (now >= e) return 100;

  return ((now - s) / (e - s)) * 100;
};

/* ---------------- Page ---------------- */

const HomePage: NextPage = () => {
  const router = useRouter();

  /* ---------- State ---------- */

  const [start, setStart] = useState<Date>(getInitialStart);
  const [end, setEnd] = useState<Date>(getInitialEnd);

  const [title, setTitle] = useState<string>(getInitialTitle);

  const [startInput, setStartInput] = useState<string>(() =>
    getInitialStart().toISOString().slice(0, 10)
  );

  const [endInput, setEndInput] = useState<string>(() =>
    getInitialEnd().toISOString().slice(0, 10)
  );

  const [titleInput, setTitleInput] = useState<string>(getInitialTitle);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    const now = new Date();
    const start = getInitialStart();
    const end = getInitialEnd();

    if (now < start) return diffParts(now, start);
    if (now > end) return diffParts(end, now);
    return diffParts(now, end);
  });

  const [progress, setProgress] = useState(
    calcProgress(getInitialStart(), getInitialEnd())
  );

  /* ---------- Interval ---------- */

  useEffect(() => {
    const timer = setInterval(() => {
      const nowDate = new Date();

      /* -------- Countdown -------- */

      if (nowDate < start) {
        setTimeLeft(diffParts(nowDate, start));
      } else if (nowDate > end) {
        setTimeLeft(diffParts(end, nowDate));
      } else {
        setTimeLeft(diffParts(nowDate, end));
      }

      /* -------- Progress -------- */

      setProgress(calcProgress(start, end));
    }, 1000);

    return () => clearInterval(timer);
  }, [start, end]);

  /* ---------- UI ---------- */

  const openModal = () => {
    (
      document.getElementById('countdown_modal') as HTMLDialogElement
    )?.showModal();
  };

  const handleSave = () => {
    if (!startInput || !endInput) return;

    const s = new Date(startInput);
    const e = new Date(endInput);

    setStart(s);
    setEnd(e);
    setTitle(titleInput);

    router.replace(
      {
        pathname: router.pathname,
        query: {
          start: startInput,
          end: endInput,
          title: titleInput,
        },
      },
      undefined,
      { shallow: true }
    );

    (document.getElementById('countdown_modal') as HTMLDialogElement)?.close();
  };

  /* ---------- Share ---------- */

  const handleShare = async () => {
    const url = new URL(globalThis.window.location.href);

    url.searchParams.set('start', startInput);
    url.searchParams.set('end', endInput);
    url.searchParams.set('title', titleInput);

    const shareUrl = url.toString();

    if (navigator.share) {
      await navigator.share({
        title: titleInput,
        text: `Countdown: ${titleInput}`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  /* ---------- Render ---------- */

  console.log(progress);

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center gap-8 p-4">
      {/* Title */}
      <h1
        onClick={openModal}
        className="cursor-pointer text-center text-2xl font-bold md:text-3xl">
        {title}
      </h1>

      {/* Countdown */}
      <div
        onClick={openModal}
        className="grid cursor-pointer grid-cols-2 gap-4 text-center sm:grid-cols-3 lg:grid-cols-6">
        {[
          ['years', timeLeft.years],
          ['months', timeLeft.months],
          ['days', timeLeft.days],
          ['hours', timeLeft.hours],
          ['min', timeLeft.minutes],
          ['sec', timeLeft.seconds],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <span className="countdown font-mono text-5xl">
              <span
                style={
                  { '--value': value, '--digits': 2 } as React.CSSProperties
                }>
                {value}
              </span>
            </span>
            {label}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="flex w-full max-w-md flex-col gap-2 px-2">
        <progress
          className="progress progress w-full"
          value={progress}
          max="100"
        />

        <div className="flex justify-between text-xs opacity-70">
          <span>{start.toDateString()}</span>
          <span>{progress.toFixed(1)}%</span>
          <span>{end.toDateString()}</span>
        </div>
      </div>

      {/* Modal */}
      <dialog id="countdown_modal" className="modal">
        <div className="modal-box flex flex-col gap-4">
          <h3 className="text-lg font-bold">Countdown Settings</h3>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-semibold">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="input input-bordered w-full"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
            />
          </div>

          {/* Start date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="start-date" className="text-sm font-semibold">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              className="input input-bordered w-full"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
            />
          </div>

          {/* End date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="end-date" className="text-sm font-semibold">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              className="input input-bordered w-full"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>

            <button className="btn btn-secondary" onClick={handleShare}>
              Share
            </button>

            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default HomePage;
