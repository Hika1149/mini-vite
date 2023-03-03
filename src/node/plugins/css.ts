import { NextHandleFunction } from "connect";
import { Plugin } from "../plugin";
import fs from "fs-extra";
import { CLIENT_PUBLIC_PATH } from "../constants";
import { cleanUrl, getShortName } from "../utils";
import { ServerContext } from "../server";

export const cssPlugin = (): Plugin => {
  let serverContext: ServerContext;
  return {
    name: "m-vite:css",
    configServer(s) {
      serverContext = s;
    },
    load(id: string) {
      if (id.endsWith(".css")) {
        return fs.readFile(id, "utf-8");
      }
    },

    transform(code, id) {
      if (id.endsWith(".css")) {
        let res =
          `import {createHotContext as __vite__createHotContext, updateStyle} 
          from "${CLIENT_PUBLIC_PATH}";
        ` +
          `import.meta.hot = __vite__createHotContext(${JSON.stringify(
            `/` + getShortName(id, serverContext.root)
          )});
         
          `;

        res += `
       
        const css = \`${code.replace(/\n/g, "")}\`;
        const id = "${id}"
        
        updateStyle(id,css);
       
      
        
        
        
        
        
              
        
        
           import.meta.hot.accept()
        export default css;  
       
        `.trim();

        return {
          code: res,
        };
      }
      return null;
    },
  };
};
