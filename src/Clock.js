import { useEffect, useState } from 'react';
import tw from 'twin.macro';

function Clock({ ...props }) {
  const [date, setDate] = useState();

  useEffect(() => {
    tick();
    let timer = setInterval(() => tick(), 1000 * 30);

    return function cleanup() {
      clearInterval(timer);
    };
  });

  function tick() {
    let _date = new Date().toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    setDate(_date);
  }

  return (
    <div css={[tw`flex items-center`]}>
      <div css={[tw`bg-white shadow rounded py-2 px-3 select-none`]}>{date}</div>
    </div>
  );
}

export default Clock;
