export const testTouch = () => {
  return window.matchMedia("(pointer: coarse)").matches ? true : false;
};
