import { useEffect } from "react";
import { useAtom } from "jotai";
import { useThree } from "@react-three/fiber";

import Comment, { CommentPrompt } from "./Comment";

import { BACKEND_URL, twinId } from "../index";
import * as store from "../store";

// @ts-ignore
import { io } from "socket.io-client";

export default function DiscussAddon({ ...props }) {
  const [client, setClient] = useAtom(store.clientAtom);
  const [comments, setComments] = useAtom(store.commentsAtom);
  const [commentPrompt, setCommentPrompt] = useAtom(store.commentPromptAtom);

  const { scene, raycaster } = useThree();

  const [enabled, setEnabled] = useAtom(store.enabledAtom);
  const [, setStatus] = useAtom(store.statusAtom);

  useEffect(() => {
    const apiUrl = `${BACKEND_URL}/discuss/${twinId}`;

    const socket = io(apiUrl, {
      transports: ["websocket"],
      autoConnect: false,
    });

    socket.on("connect", () => {
      socket.emit("read", null, (comments: store.Comment[]) => {
        setComments(comments);
      });
    });
    socket.io.on("reconnect", () => {
      setEnabled(true);
      setStatus("CONNECTED");
      socket.emit("read", null, (comments: store.Comment[]) => {
        setComments(comments);
      });
    });
    socket.on("connect_error", () => {
      setEnabled(false);
      setStatus("ERROR");
    });

    setClient(socket);

    return () => {
      // client.off('connect');
      client && client.io.off("connect_error");
    };
  }, []);

  useEffect(() => {
    if (!client) return;
    if (enabled) {
      // console.log("connecting");
      client.connect();
    } else {
      // client.disconnect();
    }
  }, [enabled, client]);

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
