import { Dispatch, SetStateAction } from "react";

import { Z_INDEX } from "../lib/constants";

import { mdiDownload } from "@mdi/js";
// import { Icon } from "@mdi/react";

export default function ExportModal({
  homepage,
  setOpen,
}: {
  homepage?: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className="fixed z-10 inset-0 overflow-y-auto"
      style={{ zIndex: Z_INDEX.exportModal }}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 sm:p-0 text-center">
        <div
          className="fixed inset-0 bg-gray-500/10 transition-opacity"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        ></div>
        <span className="hidden align-middle h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden border shadow-xl transform transition-all my-8 sm:max-w-lg w-full">
          <div className="bg-white px-5 pt-5 pb-5">
            <div className="flex flex-col">
              <div className="text-center mt-0 sm:ml-0 sm:text-left">
                <h3 className="leading-6 font-medium text-gray-900">共有</h3>
                <div className="mt-2">
                  <input
                    type="text"
                    className="border rounded w-full px-2 py-1 bg-gray-100 text-gray-600"
                    value={homepage}
                    placeholder="未登録"
                    onFocus={(ev) => ev.target.select()}
                  />
                </div>
              </div>
              <div className="text-center mt-4 sm:ml-0 sm:text-left">
                <h3 className="leading-6 font-medium text-gray-900">
                  ダウンロード・編集
                </h3>
                <div className="mt-2 flex justify-center sm:justify-start">
                  <a
                    href={`${homepage}/twin.json`} // TODO: Fix
                    className="flex items-center text-gray-600 hover:text-gray-700"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <svg
                      className="fill-current mr-1"
                      style={{ width: "16px", height: "16px" }}
                      viewBox="0 0 24 24"
                    >
                      <path d={mdiDownload} />
                    </svg>
                    <span>定義ファイル</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* <div
            className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
          >
          </div> */}
        </div>
      </div>
    </div>
  );
}
