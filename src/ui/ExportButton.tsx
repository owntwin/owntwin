import "styled-components/macro";
import tw from "twin.macro";

import { useState } from "react";

import { mdiExportVariant } from "@mdi/js";
import Icon from "@mdi/react";

import ExportModal from "./ExportModal";

export default function ExportButton({ iri }: { iri: string }) {
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <>
      <button
        css={[
          tw`h-full bg-white hover:bg-gray-100 shadow rounded py-2 px-3 select-none flex items-center gap-1`,
        ]}
        onClick={() => setExportModalOpen(true)}
      >
        <Icon path={mdiExportVariant} size="18px" />
        {/* <div>共有</div> */}
      </button>
      {exportModalOpen && (
        <ExportModal iri={iri} setOpen={setExportModalOpen} />
      )}
    </>
  );
}
