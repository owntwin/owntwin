import { useCallback, useState } from "react";
import clsx from "clsx";

import ExportModal from "./ExportModal";

import Suggestion from "../actions-basic/Feedback";
import Manual from "../actions-bousai/Manual";
import Anpi from "../actions-bousai/Anpi";

import { useAtom } from "jotai";
import * as store from "../lib/store";

// import * as Checkbox from "@radix-ui/react-checkbox";

import { Z_INDEX } from "../lib/constants";

import {
  // mdiChevronUp, mdiChevronDown,
  mdiMenuUp,
  mdiMenuDown,
  mdiInformationOutline,
  mdiOpenInNew,
  mdiDownload,
} from "@mdi/js";

import type { Model } from "@owntwin/core";

function LayerItem({ id, layer }: { id: string; layer: any }) {
  const [layersState, setLayersState] = useAtom(store.layersStateAtom);

  const [layerInfoOpen, setLayerInfoOpen] = useState(false);

  const handleCheck = useCallback(() => {
    setLayersState((state) => {
      state[id].enabled = !state[id].enabled;
      return Object.assign({}, state);
    });
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div
        className="flex flex-col px-3 py-2 hover:bg-blue-50"
        onClick={(ev) => {
          ev.stopPropagation();
          handleCheck();
        }}
      >
        <div className="flex items-center text-sm">
          {/* <Checkbox.Root
                className=""
                defaultChecked={layersState[item.id].enabled}
              >
                <Checkbox.Indicator className=""></Checkbox.Indicator>
              </Checkbox.Root> */}
          <input
            id={`layer-${id}-checkbox`}
            className="mr-1.5"
            type="checkbox"
            checked={layersState[id]?.enabled}
            readOnly
            // onChange={(ev) => {
            //   ev.preventDefault();
            //   ev.stopPropagation();
            //   handleCheck();
            // }}
          />
          <label
          // htmlFor={`layer-${id}-checkbox`}
          >
            {layer.displayName}
          </label>
          {["csv"].includes(layer.format) && ( // TODO: Improve
            <span className="ml-1">
              <a href={layer.path}>
                <svg
                  className="fill-current text-gray-500 hover:text-gray-600"
                  style={{ width: "14px", height: "14px" }}
                  viewBox="0 0 24 24"
                >
                  <path d={mdiDownload} />
                </svg>
              </a>
            </span>
          )}
        </div>
        <div className="flex justify-end items-center">
          <div className="mr-1 text-gray-600">{layer.provider}</div>
          <div
            className="hover:cursor-pointer"
            onClick={(ev) => {
              ev.stopPropagation();
              setLayerInfoOpen(!layerInfoOpen);
            }}
          >
            <svg
              className="fill-current text-gray-600"
              style={{ width: "18px", height: "18px" }}
              viewBox="0 0 24 24"
            >
              <path d={mdiInformationOutline} />
            </svg>
          </div>
        </div>
      </div>
      {layerInfoOpen && (
        <div className="px-3 py-2">
          <div className="mb-2 mt-1">
            <div className="my-1">説明</div>
            <div className="p-2 text-sm bg-gray-50 rounded">
              <pre className="break-words whitespace-pre-wrap">
                {layer.description || (
                  <span className="text-gray-600">未登録</span>
                )}
              </pre>
            </div>
            <div className="mt-2 mb-1">利用条件</div>
            <div className="p-2 text-sm bg-gray-50 rounded">
              <pre className="break-words whitespace-pre-wrap">
                {layer.license || <span className="text-gray-600">未登録</span>}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LayerListSection({
  properties,
  ...props
}: {
  properties?: Record<string, any>;
}) {
  const [layers] = useAtom(store.layersAtom);

  return (
    <ul>
      {Object.entries(layers).map(([id, layer], i: number) => {
        return (
          <li key={i} className="flex items-center text-sm x-border">
            <LayerItem id={id} layer={layer} />
          </li>
        );
      })}
    </ul>
  );
}

function ItemInfo({
  displayName,
  type,
  homepage,
  description,
  properties = {},
  actions = [],
  layers = [],
  isOpen,
  ...props
}: Partial<
  Pick<
    Model,
    | "type"
    | "homepage"
    | "displayName"
    | "description"
    | "properties"
    | "actions"
    | "layers"
  >
> & {
  isOpen?: boolean;
  style?: Record<string, string>;
}) {
  const [paneOpen, setPaneOpen] = useState(isOpen || false);
  const [helpClicked, setHelpClicked] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <div
      className={clsx(
        "fixed top-4 left-4 flex flex-col bg-white shadow rounded right-4 sm:right-auto sm:w-72",
        paneOpen ? "bottom-20" : "bottom-auto",
      )}
      style={{
        ...props.style,
        maxHeight: "40rem",
        zIndex: Z_INDEX.itemInfo,
      }}
    >
      <div>
        <div className="py-2 px-3 rounded bg-white">
          <div className="text-xs">{type}</div>
          <div>{displayName}</div>
          <div className="text-xs text-gray-600 break-all">
            {homepage ? (
              <span
                className="hover:bg-gray-100 hover:rounded-full hover:px-1 cursor-pointer"
                onClick={() => setExportModalOpen(true)}
              >
                {homepage}
              </span>
            ) : (
              "未登録"
            )}
          </div>
          {exportModalOpen && homepage && (
            <ExportModal homepage={homepage} setOpen={setExportModalOpen} />
          )}
        </div>
      </div>
      <div
        className="border-t flex justify-center cursor-pointer py-1 hover:bg-gray-100"
        onClick={() => {
          setPaneOpen(!paneOpen);
          !helpClicked && setHelpClicked(true);
        }}
      >
        <div className="text-xs text-gray-800 flex items-center">
          <svg
            className="fill-current text-gray-600"
            style={{ width: "18px", height: "18px" }}
            viewBox="0 0 24 24"
          >
            <path d={paneOpen ? mdiMenuUp : mdiMenuDown} />
          </svg>
          {!helpClicked && <div>クリックで開く/閉じる</div>}
        </div>
      </div>
      <div
        className={clsx(
          paneOpen ? "block" : "hidden",
          "flex-grow overflow-y-scroll",
        )}
      >
        <div className="mt-0 px-2 py-1 text-sm text-gray-800">
          インフォメーション
        </div>
        <div className="border rounded-sm py-2 px-3 m-2 mt-0">
          <div className={clsx("text-sm", !description && "text-gray-600")}>
            {description ? description : "未登録"}
          </div>
        </div>
        <div className="mt-0 px-2 py-1 text-sm text-gray-800">アクション</div>
        <div className="text-sm py-1">
          <ul>
            {actions.length > 0 ? (
              actions.map((action, i: number) => {
                return (
                  <li key={i} className="py-1 px-3 hover:bg-blue-50">
                    <div className="flex items-center cursor-pointer hover:text-gray-800">
                      <svg
                        className="fill-current text-black mr-1 flex-none"
                        style={{ width: "14px", height: "14px" }}
                        viewBox="0 0 24 24"
                      >
                        <path d={mdiOpenInNew} />
                      </svg>
                      <div>
                        {action.component ===
                          "@owntwin/actions-basic/suggestion" && <Suggestion />}
                        {action.component ===
                          "@owntwin/actions-bousai/manual" && (
                          <Manual href={action.href} {...action} />
                        )}
                        {action.component ===
                          "@owntwin/actions-bousai/anpi" && (
                          <Anpi href={action.href} />
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li>
                <span className="py-1 px-3 text-gray-600">未登録</span>
              </li>
            )}
          </ul>
        </div>
        <div className="py-2">
          <div className="px-2 py-1 text-sm text-gray-800">レイヤー</div>
          <div>
            <LayerListSection />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemInfo;
