import { atom } from 'jotai';

const layersStateAtom = atom({});
const entityAtom = atom(null);
const detailEntityAtom = atom(null);
const debugAtom = atom(null);

export { layersStateAtom, entityAtom, detailEntityAtom, debugAtom };
