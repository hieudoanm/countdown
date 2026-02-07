import { NextPage } from 'next';
import { useEffect, useState } from 'react';

type TimeLeft = {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const now = new Date();

  if (targetDate.getTime() <= now.getTime()) {
    return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  // Calculate months difference (calendar‑aware)
  let months =
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
    (targetDate.getMonth() - now.getMonth());

  const tempDate = new Date(now);
  tempDate.setMonth(tempDate.getMonth() + months);

  // If overshoot, step back 1 month
  if (tempDate > targetDate) {
    months -= 1;
    tempDate.setMonth(tempDate.getMonth() - 1);
  }

  // Remaining difference after removing months
  const diff = targetDate.getTime() - tempDate.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { months, days, hours, minutes, seconds };
};

const HomePage: NextPage = () => {
  const [target, setTarget] = useState<Date>(
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
  );

  const [title, setTitle] = useState<string>('My Countdown');

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(target));

  const [inputValue, setInputValue] = useState<string>('');
  const [titleInput, setTitleInput] = useState<string>('My Countdown');

  // Countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [target]);

  const openModal = () => {
    (
      document.getElementById('countdown_modal') as HTMLDialogElement
    )?.showModal();
  };

  const handleSetDate = () => {
    if (inputValue) {
      setTarget(new Date(inputValue));
    }

    setTitle(titleInput || 'My Countdown');

    const modal = document.getElementById(
      'countdown_modal'
    ) as HTMLDialogElement;
    modal?.close();
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8">
      {/* Title */}
      <h1
        onClick={openModal}
        className="cursor-pointer text-center text-2xl font-bold md:text-3xl">
        {title}
      </h1>

      {/* Countdown (clickable) */}
      <div
        onClick={openModal}
        className="grid cursor-pointer auto-cols-max grid-flow-col gap-5 text-center">
        {/* Months */}
        <div className="flex flex-col">
          <span className="countdown font-mono text-5xl">
            <span
              style={
                {
                  '--value': timeLeft.months,
                  '--digits': 2,
                } as React.CSSProperties
              }
              aria-live="polite">
              {timeLeft.months}
            </span>
          </span>
          months
        </div>

        {/* Days */}
        <div className="flex flex-col">
          <span className="countdown font-mono text-5xl">
            <span
              style={
                {
                  '--value': timeLeft.days,
                  '--digits': 2,
                } as React.CSSProperties
              }
              aria-live="polite">
              {timeLeft.days}
            </span>
          </span>
          days
        </div>

        {/* Hours */}
        <div className="flex flex-col">
          <span className="countdown font-mono text-5xl">
            <span
              style={
                {
                  '--value': timeLeft.hours,
                  '--digits': 2,
                } as React.CSSProperties
              }
              aria-live="polite">
              {timeLeft.hours}
            </span>
          </span>
          hours
        </div>

        {/* Minutes */}
        <div className="flex flex-col">
          <span className="countdown font-mono text-5xl">
            <span
              style={
                {
                  '--value': timeLeft.minutes,
                  '--digits': 2,
                } as React.CSSProperties
              }
              aria-live="polite">
              {timeLeft.minutes}
            </span>
          </span>
          min
        </div>

        {/* Seconds */}
        <div className="flex flex-col">
          <span className="countdown font-mono text-5xl">
            <span
              style={
                {
                  '--value': timeLeft.seconds,
                  '--digits': 2,
                } as React.CSSProperties
              }
              aria-live="polite">
              {timeLeft.seconds}
            </span>
          </span>
          sec
        </div>
      </div>

      {/* Modal */}
      <dialog id="countdown_modal" className="modal">
        <div className="modal-box flex flex-col gap-4">
          <h3 className="text-lg font-bold">Countdown Settings</h3>

          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Title</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Countdown title"
            />
          </div>

          {/* Date Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Date & Time</label>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleSetDate}>
              Save
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
