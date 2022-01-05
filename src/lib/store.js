import { atom } from 'jotai';

const layersStateAtom = atom({});
const entityAtom = atom(null);
const detailEntityAtom = atom(null);
const debugAtom = atom(null);
// const zoomAtom = atom(0xffff);
const closeupAtom = atom(false);

export { layersStateAtom, entityAtom, detailEntityAtom, debugAtom, closeupAtom };
