import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";

const App2 = () => {
  return <div>1234686</div>;
};

ReactDOM.render(<App2 />, document.getElementById("root"));

//@ts-ignore
import.meta.hot.accept((mod) => {
  console.log({ mod });
  ReactDOM.render(<App2 />, document.getElementById("root"));
});
