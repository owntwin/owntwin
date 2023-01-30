import { useEffect, useState } from "react";

function Clock({ ...props }) {
  const [date, setDate] = useState<string>();

  useEffect(() => {
    tick();
    let timer = setInterval(() => tick(), 1000 * 30);

    return function cleanup() {
      clearInterval(timer);
    };
  }, []);

  function tick() {
    let _date = new Date().toLocaleString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
    setDate(_date);
  }

  return (
    <div className="h-full bg-white shadow rounded py-2 px-3 select-none">
      {date}
    </div>
  );
}

export default Clock;
