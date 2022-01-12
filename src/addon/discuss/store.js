import { atom } from 'jotai';

const commentPromptInitialValue = { position: null, content: null };

const enabledAtom = atom(true);
const statusAtom = atom('DISCONNECTED');
const commentPromptAtom = atom(commentPromptInitialValue);
const commentsAtom = atom(Array.from([]));

export {
  commentPromptInitialValue,
  enabledAtom,
  statusAtom,
  commentPromptAtom,
  commentsAtom,
};
