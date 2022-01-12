import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useThree } from '@react-three/fiber';

import Comment, { CommentPrompt } from './Comment';

import { client, twinId } from '../index';
import * as store from '../store';

export default function Discuss({ ...props }) {
  const [comments] = useAtom(store.commentsAtom);
  const [commentPrompt, setCommentPrompt] = useAtom(store.commentPromptAtom);

  const { scene, raycaster } = useThree();

  const [enabled, setEnabled] = useAtom(store.enabledAtom);
  const [, setStatus] = useAtom(store.statusAtom);

  useEffect(() => {
    client
      .service('subscription')
      .create({ uid: twinId })
      .catch((err) => {
        // console.log({ err });
      });
  }, []);

  useEffect(() => {
    if (enabled) {
      client.io.connect();
    } else {
      // client.io.disconnect();
    }
  }, [enabled]);

  useEffect(() => {
    client.io.on('reconnect', (err) => {
      setEnabled(true);
      setStatus('CONNECTED');
    });
    client.io.on('connect_error', (err) => {
      setEnabled(false);
      setStatus('ERROR');
    });
    return () => {
      // client.io.off('connect');
      client.io.off('connect_error');
    };
  }, [setEnabled, setStatus]);
  // useEffect(() => console.log({ comments }), [comments]);

  return (
    enabled && (
      <>
        <mesh
          onPointerMissed={() => {
            if (!raycaster || !scene) return;
            const intersects = raycaster.intersectObjects(scene.children);
            // console.log(intersects);
            if (intersects.length > 0) {
              const closest = intersects[0];
              setCommentPrompt({ ...commentPrompt, position: closest.point });
            } else {
              setCommentPrompt(store.commentPromptInitialValue);
            }
          }}
        ></mesh>
        {!!commentPrompt.position && (
          <CommentPrompt position={commentPrompt.position} />
        )}
        {comments.map((comment, i) => (
          <Comment
            key={i}
            position={comment.position}
            content={comment.content}
          />
        ))}
      </>
    )
  );
}
