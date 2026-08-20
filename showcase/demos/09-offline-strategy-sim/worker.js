self.onmessage = (event) => {
  self.postMessage({ type: "placeholder", echo: event.data });
};
