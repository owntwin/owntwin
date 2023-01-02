import { useState } from "react";

import { mdiExportVariant } from "@mdi/js";
// NOTE: https://github.com/Templarian/MaterialDesign-React/issues/69#issuecomment-1107975402
import { Icon } from "@mdi/react";

import ExportModal from "./ExportModal";

export default function ExportButton({ iri }: { iri?: string }) {
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <>
      <button
        className="h-full bg-white hover:bg-gray-100 shadow rounded py-2 px-3 select-none flex items-center gap-1"
        onClick={() => setExportModalOpen(true)}
      >
        <Icon path={mdiExportVariant} size={0.75} />
        {/* <div>共有</div> */}
      </button>
      {exportModalOpen && !!iri && (
        <ExportModal iri={iri} setOpen={setExportModalOpen} />
      )}
    </>
  );
}
