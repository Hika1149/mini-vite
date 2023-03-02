

## mini-vite hmr 
- follow ESM-HMR spec
- over native esm (import feature)

[hmr-server]
- file watcher & start websocket server
- when file changes, propagate **hmr boundary**
  (send boundary info to the client)

[hmr-client]
- implement hmr interface (import.meta.hot)
- received **hmr boundary info**, dynamic import boundary deps
- invoke boundary callback 

[project file]
- invoke import.meta.hot.accept() (normally done by plugin)


[mini-vite-inject-plugin]
- inject [hmr-client].js file to index.html

[mini-vite-importAnalysis-plugin]
- inject hmr variable (import.meta.hot) to every js source file
- analysis import.meta syntax, compute some hmr var (hasHMR, isSelfAccepting. ...)



### HMR usage example:
```javascript
//main.js deps on [a.js, b.js]
//a.js deps on [c.js]
//main.js
import a from './a'
import b from './b'
import.meta.hot.accept(
  ["./src/a","./src/b"],
  ()=>{
    customUpdate(main.a,main.b)
  }
)

//a.js
import c from './c'
export const a = 1 + c

//c.js
export const c = 1

```





Here boundary of c.js is main.js, main.js boundaryDeps are [a.js,b.js]  
So when c.js changes: 
#### vite-server
1. vite-server will find its hmr boundary and hmrBoundaryDeps   
2. send boundary info to client (will send multiple updates if there are multiple boundary)  

  

#### vite-client
1. dynamic import HmrBoundaryDeps (a.js)
2. a is c's importer so the fetch request for c.js will be triggered by native browser 
3. after all fetches are done, every module is up-to-date, 
Now we can invoke boundary(main.js) callback with latest module value.





