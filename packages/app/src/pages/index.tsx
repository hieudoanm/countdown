import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type TimeLeft = {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const diffParts = (from: Date, to: Date): TimeLeft => {
  const start = new Date(from);
  const end = new Date(to);

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  const tempDate = new Date(start);
  tempDate.setMonth(tempDate.getMonth() + months);

  if (tempDate > end) {
    months -= 1;
    tempDate.setMonth(tempDate.getMonth() - 1);
  }

  const diff = end.getTime() - tempDate.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { months, days, hours, minutes, seconds };
};

/* ---------------- Helpers ---------------- */

const getInitialDate = () => {
  if (typeof window === 'undefined') {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const params = new URLSearchParams(window.location.search);
  const d = params.get('date');

  return d ? new Date(d) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
};

const getInitialTitle = () => {
  if (typeof window === 'undefined') return 'My Countdown';

  const params = new URLSearchParams(window.location.search);
  return params.get('title') || 'My Countdown';
};

/* ---------------- Page ---------------- */

const HomePage: NextPage = () => {
  const router = useRouter();

  /* ---------- State (initialized from params) ---------- */

  const [target, setTarget] = useState<Date>(getInitialDate);

  const [title, setTitle] = useState<string>(getInitialTitle);

  const [inputValue, setInputValue] = useState<string>(() =>
    getInitialDate().toISOString().slice(0, 10)
  );

  const [titleInput, setTitleInput] = useState<string>(getInitialTitle);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    diffParts(new Date(), getInitialDate())
  );

  const [isPast, setIsPast] = useState(false);

  /* ---------- Countdown interval ---------- */

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      if (target <= now) {
        setIsPast(true);
        setTimeLeft(diffParts(target, now));
      } else {
        setIsPast(false);
        setTimeLeft(diffParts(now, target));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [target]);

  /* ---------- UI actions ---------- */

  const openModal = () => {
    (
      document.getElementById('countdown_modal') as HTMLDialogElement
    )?.showModal();
  };

  const handleSetDate = () => {
    if (!inputValue) return;

    const d = new Date(inputValue);

    setTarget(d);
    setTitle(titleInput);

    router.replace(
      {
        pathname: router.pathname,
        query: {
          date: inputValue,
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
    const url = new URL(window.location.href);

    url.searchParams.set('date', inputValue);
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

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center gap-8 p-4">
      {/* Title */}
      <h1
        onClick={openModal}
        className="cursor-pointer text-center text-2xl font-bold md:text-3xl">
        {title}
      </h1>

      {/* Past mode */}
      {isPast && <span className="badge badge-secondary">Since</span>}

      {/* Countdown */}
      <div
        onClick={openModal}
        className="grid cursor-pointer grid-cols-2 gap-4 text-center sm:grid-cols-3 md:grid-cols-5">
        {[
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
                }
                aria-live="polite">
                {value}
              </span>
            </span>
            {label}
          </div>
        ))}
      </div>

      {/* Modal */}
      <dialog id="countdown_modal" className="modal">
        <div className="modal-box flex flex-col gap-4">
          <h3 className="text-lg font-bold">Countdown Settings</h3>

          {/* Title input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Title</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
            />
          </div>

          {/* Date input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Date</label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleSetDate}>
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
