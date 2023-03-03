console.log("[vite] connecting");

const socket = new WebSocket("ws://localhost:__HMR_PORT__", "vite-hmr");

socket.addEventListener("message", async ({ data }) => {
  handleMessage(JSON.parse(data));
});
interface Update {
  type: "js-update" | "css-update";
  path: string;
  acceptedPath: string;
  timestamp: number;
}

const handleMessage = (payload: any) => {
  switch (payload.type) {
    case "connected":
      console.log("[vite] connected.");
      setInterval(() => {
        socket.send("ping");
      }, 1000);
      break;

    case "update":
      payload.updates.forEach((update: Update) => {
        if (update.type === "js-update") {
          //
          fetchUpdate(update);
        }
      });
      break;
  }
};

// ownerPath -> accept的模块以及accept模块更新后的callback
interface HotModule {
  id: string;
  callbacks: HotCallback[];
}

interface HotCallback {
  // deps: fetchable paths
  deps: string[]; //
  fn: (modules: object[]) => void;
}

// ownerPath -> hotModule
const hotModulesMap = new Map<string, HotModule>();

//ownerPath: mod req url
export const createHotContext = (ownerPath: string) => {
  // when a file is hot updated, a new context is created
  // clear its stale callbacks
  const mod = hotModulesMap.get(ownerPath);
  if (mod) {
    mod.callbacks = [];
  }

  function acceptDeps(deps: string[], callback: any) {
    const mod: HotModule = hotModulesMap.get(ownerPath) || {
      id: ownerPath,
      callbacks: [],
    };

    /** accept deps */
    mod.callbacks.push({
      deps,
      fn: callback,
    });

    hotModulesMap.set(ownerPath, mod);
  }

  return {
    /**
     * only self-update
     * import.meta.hot.accept()
     * */
    accept(deps: any, callback?: any) {
      if (typeof deps === "function" || !deps) {
        acceptDeps([ownerPath], ([mod]: any) => {
          deps && deps(mod);
        });
      }
    },
  };
};

/** dispatch update */
async function fetchUpdate({ path, timestamp }: Update) {
  const mod = hotModulesMap.get(path);
  if (!mod) {
    return;
  }

  /** new Module */
  const modulesMap = new Map<string, any>();
  /** deps module? */
  const modulesToUpdate = new Set<string>();

  //
  modulesToUpdate.add(path);

  await Promise.all(
    Array.from(modulesToUpdate).map(async (dep) => {
      const [path, query] = dep.split("?");

      try {
        const newMod = await import(
          path + `?t=${timestamp}${query ? `&${query}` : ""}`
        );

        modulesMap.set(dep, newMod);
      } catch (e) {
        console.error(`dynamic import err: `, e);
      }
    })
  );

  return () => {
    /** invoke mod cb after hmr boundary is fetched(modulesMap store latest dep module) */
    for (const { deps, fn } of mod.callbacks) {
      fn(deps.map((dep) => modulesMap.get(dep)));
    }
    console.log(`[vite] hot updated: ${path}`);
  };
}

export const sheetMap = new Map();

export const updateStyle = (id: string, content: string) => {
  let style = sheetMap.get(id);
  if (!style) {
    style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.innerHTML = content;
    document.head.appendChild(style);
  } else {
    style.innerHTML = content;
  }
  sheetMap.set(id, style);
};
