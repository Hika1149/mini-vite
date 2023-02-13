import { NextHandleFunction } from "connect";
import { Plugin } from "../plugin";
import fs from "fs-extra";

export const cssPlugin = (): Plugin => {
  return {
    name: "m-vite:css",

    load(id: string) {
      if (id.endsWith(".css")) {
        return fs.readFile(id, "utf-8");
      }
    },

    transform(code, id) {
      if (id.endsWith(".css")) {
        const jsContent = `
        const css = \`${code.replace(/\n/g, "")}\`;
        const style = document.createElement("style");
        style.setAttribute("type","text/css");
        style.innerHTML = css;
        document.head.appendChild(style);
        export default css;  
       
        `.trim();
        return {
          code: jsContent,
        };
      }
      return null;
    },
  };
};
