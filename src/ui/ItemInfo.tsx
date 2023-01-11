import { ReactNode, useState } from "react";
import clsx from "clsx";

import ExportModal from "./ExportModal";

import { useAtom } from "jotai";
import * as store from "../lib/store";

import { Z_INDEX } from "../lib/constants";

import {
  // mdiChevronUp, mdiChevronDown,
  mdiMenuUp,
  mdiMenuDown,
  mdiInformationOutline,
  mdiOpenInNew,
  mdiDownload,
} from "@mdi/js";

import { Definition, ModuleDefinition } from "../types";

function getField(entity: Record<string, any> | null, key: string) {
  const splitted = key.split(":", 2);
  if (splitted.length === 2) {
    return entity && entity.properties && entity.properties[key]
      ? encodeURIComponent(entity.properties[key])
      : null;
  } else {
    return entity && entity[key] ? encodeURIComponent(entity[key]) : null;
  }
}

function ModulePane({
  id,
  module,
  properties,
  isOpen = false,
  ...props
}: {
  id: string;
  module: ModuleDefinition;
  properties: Record<string, any>;
  isOpen?: boolean;
}) {
  const [paneOpen, setPaneOpen] = useState<boolean>(isOpen);
  const [moduleInfoOpen, setModuleInfoOpen] = useState(false);

  const [layersState, setLayersState] = useAtom(store.layersStateAtom);
  const [entity] = useAtom(store.entityAtom);

  const definition = module.definition;
  const layers = definition.layers;
  const actions = definition.actions || [];
  const filters: { name: string }[] = [];

  properties = properties || {};

  return (
    <div className="border-b">
      <div
        className="px-3 py-2 cursor-pointer hover:bg-blue-100 flex flex-col"
        onClick={(ev) => {
          setPaneOpen(!paneOpen);
        }}
      >
        <div className="flex items-center">
          <div className="flex-grow">{definition.name}</div>
          <div className="flex items-center">
            <div
              className="rounded p-1 hover:bg-blue-200"
              onClick={(ev) => {
                if (paneOpen) {
                  ev.stopPropagation();
                  setModuleInfoOpen(!moduleInfoOpen);
                } else {
                  setModuleInfoOpen(true);
                }
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
      </div>
      {paneOpen && (
        <div className="px-3 pb-3 text-sm">
          {moduleInfoOpen && (
            <div className="mb-2 mt-1">
              <div className="my-1">説明</div>
              <div className="p-2 text-sm bg-gray-100 rounded">
                <pre className="break-words whitespace-pre-wrap">
                  {definition.description || (
                    <span className="text-gray-600">未登録</span>
                  )}
                </pre>
              </div>
              <div className="mt-2 mb-1">利用条件</div>
              <div className="p-2 text-sm bg-gray-100 rounded">
                <pre className="break-words whitespace-pre-wrap">
                  {definition.license || (
                    <span className="text-gray-600">未登録</span>
                  )}
                </pre>
              </div>
            </div>
          )}
          <div className="mb-2">
            <div className="my-1">アクション</div>
            <ul>
              {actions.length > 0 ? (
                actions.map((action, i: number) => {
                  const getProperty = (key: string) => {
                    return (
                      properties[`${id}:actions.${action.id}.${key}`] ||
                      action[key] ||
                      null
                    );
                  };
                  const missingFields = [];

                  if (!getProperty("href")) {
                    missingFields.push("href");
                  }

                  if (!!action.fields) {
                    action.fields.forEach((field) => {
                      const ok = getField(entity, field) !== null;
                      if (!ok) {
                        missingFields.push(field);
                      }
                    });
                  }

                  function href() {
                    const params = action.fields
                      ? action.fields.map((field) => {
                          const assign_to = getProperty(`fields.assign_to`); // TODO: Fix
                          if (!assign_to) return "";
                          const param = assign_to[field],
                            value = getField(entity, field);
                          if (!param || !value) return "";
                          return `${param}=${value}`;
                        })
                      : [];

                    return `${getProperty("href")}?${
                      action.default_param ? `${action.default_param}&` : ""
                    }${params.join("&")}`;
                  }

                  return (
                    <li key={i}>
                      <a
                        href={href()}
                        onClick={(ev) => {
                          if (missingFields.length > 0) {
                            ev.preventDefault();
                            return false;
                          }
                        }}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center cursor-pointer hover:text-gray-800"
                      >
                        <svg
                          className="fill-current text-black mr-0.5"
                          style={{ width: "14px", height: "14px" }}
                          viewBox="0 0 24 24"
                        >
                          <path d={mdiOpenInNew} />
                        </svg>
                        <div
                          className={clsx(
                            missingFields.length > 0 && "line-through",
                          )}
                        >
                          {action.text}
                        </div>
                      </a>
                      {missingFields.length > 0 && (
                        <div className="bg-gray-500 text-white rounded px-1 py-0.5 mb-0.5 text-xs">
                          情報を追加してください:{" "}
                          <code>{missingFields.join(", ")}</code>
                        </div>
                      )}
                    </li>
                  );
                })
              ) : (
                <li>
                  <span className="text-gray-600">未登録</span>
                </li>
              )}
            </ul>
          </div>
          <div className="mb-2">
            <div className="my-1">レイヤー</div>
            <ul>
              {layers.length > 0 ? (
                layers.map((item, i: number) => {
                  return (
                    <li key={i} className="flex items-center">
                      <input
                        className="mr-1"
                        type="checkbox"
                        checked={layersState[item.id].enabled}
                        onChange={(ev) => {
                          setLayersState((state) => {
                            state[item.id].enabled = !state[item.id].enabled;
                            return Object.assign({}, state);
                          });
                        }}
                      />
                      <span>{item.name}</span>
                      {["csv"].includes(item.format) && ( // TODO: Improve
                        <span className="ml-1">
                          <a href={item.path}>
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
                    </li>
                  );
                })
              ) : (
                <li>
                  <span className="text-gray-600">未登録</span>
                </li>
              )}
            </ul>
          </div>
          <div className="mb-2">
            <div className="my-1">フィルター</div>
            <ul>
              {filters.length > 0 ? (
                filters.map((item, i) => (
                  <li key={i}>
                    <span className="text-gray-600">{item.name}</span>
                  </li>
                ))
              ) : (
                <li>
                  <span className="text-gray-600">未登録</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemInfo({
  name,
  type,
  iri,
  item,
  modules,
  properties,
  isOpen,
  back,
  ...props
}: Pick<Definition, "name" | "type" | "iri" | "modules" | "properties"> & {
  item: { description?: string }; // TODO: Fix
  isOpen: boolean;
  back: ReactNode;
  style?: Record<string, string>;
}) {
  const [paneOpen, setPaneOpen] = useState(isOpen || false);
  const [helpClicked, setHelpClicked] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const description = item.description || null;

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
        {back}
        <div className={clsx(back && "border-t", "py-2 px-3 rounded bg-white")}>
          <div className="text-xs">{type}</div>
          <div>{name}</div>
          <div className="text-xs text-gray-600 break-all">
            {iri ? (
              <span
                className="hover:bg-gray-100 hover:rounded-full hover:px-1 cursor-pointer"
                onClick={() => setExportModalOpen(true)}
              >
                {iri}
              </span>
            ) : (
              "未登録"
            )}
          </div>
          {exportModalOpen && (
            <ExportModal iri={iri} setOpen={setExportModalOpen} />
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
        <div className="mt-0 px-2 py-1 text-xs text-gray-800">
          インフォメーション
        </div>
        <div className="border rounded-sm py-2 px-3 m-2 mt-0">
          <div className={clsx("text-sm", !description && "text-gray-600")}>
            {description ? description : "未登録"}
          </div>
        </div>
        <div className="py-2">
          <div className="px-2 py-1 border-b text-xs text-gray-800">
            モジュール
          </div>
          {Object.entries(modules).map(([id, module]) => (
            <ModulePane
              key={id}
              id={id}
              module={module}
              properties={properties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ItemInfo;
