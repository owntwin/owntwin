const BACKEND_URL =
  import.meta.env.VITE_DISCUSS_BACKEND_URL || window.location.origin;
// console.log(BACKEND_URL);

const m = window.location.pathname.match(/^\/twin\/([^/]*)\/?/);
const twinId = m && m.length > 1 ? m[1] : "nowhere";
// console.log(twinId);

export { BACKEND_URL, twinId };
