import { useEffect, useRef, useState } from "react";

import { mdiSend } from "@mdi/js";

import { useAtom } from "jotai";
import * as store from "../store";

import { client, twinId } from "../index";

function Input({ ...props }) {
  const [value, setValue] = useState("");
  const inputRef = useRef();

  const [commentPrompt, setCommentPrompt] = useAtom(store.commentPromptAtom);
  const [, setComments] = useAtom(store.commentsAtom);
  const [enabled] = useAtom(store.enabledAtom);
  const [, setStatus] = useAtom(store.statusAtom);

  useEffect(() => inputRef.current.focus(), [commentPrompt]);

  // TODO: Here or somewhere else?
  useEffect(() => {
    client.service("api/discuss").on("created", (message) => {
      // console.log(message);
      setComments((comments) => [...comments, message]);
    });
  }, [setComments]);

  // useEffect(() => console.log(comments), [comments]);

  const submit = () => {
    if (!commentPrompt.position) return;
    const comment = {
      ...commentPrompt,
      content: value,
      twinId: twinId, // TODO: Use anonymous auth instead
    };
    client
      .service("api/discuss")
      .create(comment)
      .catch((err) => {
        console.log("err", err);
        setStatus("ERROR");
      });
    setCommentPrompt(store.commentPromptInitialValue);
    setValue("");
  };

  return (
    enabled && (
      <div className="relative w-full md:w-[32rem]">
        <input
          ref={inputRef}
          className="w-full h-10 px-6 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 appearance-none border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
          type="text"
          placeholder="場所をダブルクリックしてコメント..." // コメント...
          value={value}
          onChange={(ev) => setValue(ev.target.value)}
          onKeyPress={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              submit();
            }
          }}
        />
        <div className="absolute inset-y-0 right-0 flex justify-center items-center w-10 h-10">
          <button
            className="flex justify-center items-center w-5 h-5 text-gray-300 hover:text-gray-600"
            onClick={() => {
              submit();
            }}
          >
            <svg
              className="fill-current"
              style={{ width: "24px", height: "24px" }}
              viewBox="0 0 24 24"
            >
              <path d={mdiSend} />
            </svg>
          </button>
        </div>
      </div>
    )
  );
}

export default Input;
