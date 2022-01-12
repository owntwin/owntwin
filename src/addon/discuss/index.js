import feathers from '@feathersjs/client';
import socketio from '@feathersjs/socketio-client';
import io from 'socket.io-client';

const BACKEND_URL =
  process.env.REACT_APP_DISCUSS_BACKEND_URL || window.location.origin;
// console.log(BACKEND_URL);

const m = window.location.pathname.match(/^\/twin\/([^/]*)\/?/);
const twinId = m && m.length > 1 ? m[1] : 'nowhere';
// console.log(twinId);

const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
});
const client = feathers();

client.configure(socketio(socket));

export { client, twinId };
