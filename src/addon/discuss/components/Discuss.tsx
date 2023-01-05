import { useEffect } from "react";
import { useAtom } from "jotai";
import { useThree } from "@react-three/fiber";

import Comment, { CommentPrompt } from "./Comment";

import { BACKEND_URL, defaultClient, twinId } from "../index";
import * as store from "../store";

import socketio from "@feathersjs/socketio-client";
import io from "socket.io-client";

export default function Discuss({ ...props }) {
  const [client, setClient] = useAtom(store.clientAtom);
  const [comments] = useAtom(store.commentsAtom);
  const [commentPrompt, setCommentPrompt] = useAtom(store.commentPromptAtom);

  const { scene, raycaster } = useThree();

  const [enabled, setEnabled] = useAtom(store.enabledAtom);
  const [, setStatus] = useAtom(store.statusAtom);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });
    defaultClient.configure(socketio(socket));
    setClient(defaultClient);

    defaultClient
      .service("api/subscription")
      .create({ uid: twinId })
      .catch((err: unknown) => {
        // console.log({ err });
      });
  }, []);

  useEffect(() => {
    if (!client) return;
    if (enabled) {
      client.io.connect();
    } else {
      // client.io.disconnect();
    }
  }, [enabled, client]);

  useEffect(() => {
    if (!client) return;
    client.io.on("reconnect", (err: unknown) => {
      setEnabled(true);
      setStatus("CONNECTED");
    });
    client.io.on("connect_error", (err: unknown) => {
      setEnabled(false);
      setStatus("ERROR");
    });
    return () => {
      // client.io.off('connect');
      client.io.off("connect_error");
    };
  }, [client]);
  // useEffect(() => console.log({ comments }), [comments]);

  return enabled ? (
    <>
      <mesh
        onPointerMissed={(ev) => {
          // console.log(ev);
          if (ev.type !== "dblclick") return;
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
  ) : null;
}
