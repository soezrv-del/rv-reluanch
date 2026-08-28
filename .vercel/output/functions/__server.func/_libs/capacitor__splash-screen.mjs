import { n as __exportAll } from "../_runtime.mjs";
import { n as WebPlugin, r as registerPlugin } from "./capacitor__core.mjs";
//#region node_modules/@capacitor/splash-screen/dist/esm/index.js
var esm_exports = /* @__PURE__ */ __exportAll({ SplashScreen: () => SplashScreen });
var SplashScreen = registerPlugin("SplashScreen", { web: () => Promise.resolve().then(() => web_exports).then((m) => new m.SplashScreenWeb()) });
//#endregion
//#region node_modules/@capacitor/splash-screen/dist/esm/web.js
var web_exports = /* @__PURE__ */ __exportAll({ SplashScreenWeb: () => SplashScreenWeb });
var SplashScreenWeb = class extends WebPlugin {
	async show(_options) {}
	async hide(_options) {}
};
//#endregion
export { esm_exports as t };
