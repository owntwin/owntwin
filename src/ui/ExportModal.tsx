import "styled-components/macro";
import tw from "twin.macro";

import { mdiDownload } from "@mdi/js";
// import { Icon } from "@mdi/react";

export default function ExportModal({ iri, setOpen, ...props }) {
  return (
    <div
      css={[tw`fixed z-10 inset-0 overflow-y-auto`]}
      role="dialog"
      aria-modal="true"
    >
      <div
        css={[
          tw`flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center block sm:p-0`,
        ]}
      >
        <div
          css={[tw`fixed inset-0 bg-gray-500/10 transition transition-opacity`]}
          aria-hidden="true"
          onClick={() => setOpen(false)}
        ></div>
        <span
          css={[tw`hidden inline-block align-middle h-screen`]}
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div
          css={[
            tw`inline-block align-middle bg-white rounded-lg text-left overflow-hidden border shadow-xl transform transition-all my-8 sm:max-w-lg w-full`,
          ]}
        >
          <div css={[tw`bg-white px-5 pt-5 pb-5`]}>
            <div css={[tw`flex flex-col`]}>
              <div css={[tw`text-center mt-0 sm:ml-0 sm:text-left`]}>
                <h3 css={[tw`leading-6 font-medium text-gray-900`]}>共有</h3>
                <div css={[tw`mt-2`]}>
                  <input
                    type="text"
                    css={[
                      tw`border rounded w-full px-2 py-1 bg-gray-100 text-gray-600`,
                    ]}
                    value={iri}
                    onFocus={(ev) => ev.target.select()}
                  />
                </div>
              </div>
              <div css={[tw`text-center mt-4 sm:ml-0 sm:text-left`]}>
                <h3 css={[tw`leading-6 font-medium text-gray-900`]}>
                  ダウンロード・編集
                </h3>
                <div css={[tw`mt-2 flex justify-center sm:justify-start`]}>
                  <a
                    href={`${iri}/twin.json`} // TODO: Fix
                    css={[
                      tw`flex items-center text-gray-600 hover:text-gray-700`,
                    ]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <svg
                      css={[tw`fill-current mr-1`]}
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
            css={[tw`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`]}
          >
          </div> */}
        </div>
      </div>
    </div>
  );
}
