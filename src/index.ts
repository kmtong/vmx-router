import {
    createRouter,
    createWebHistory,
    createWebHashHistory
} from "vue-router";

const ROUTER_MODULE = "router";

// to be exposed
let router = null;
let routes = null;
let startListener = [];

export default {
    name: ROUTER_MODULE,
    dependsOn: null,
    extensionPoints: {
        router: function ({ registry }: any, obj: any[]) {
            if (Array.isArray(obj)) {
                obj.forEach((o) => {
                    registry.moduleVarAppend(ROUTER_MODULE, "routes", o);
                });
            } else {
                registry.moduleVarAppend(ROUTER_MODULE, "routes", obj);
            }
        },
        // extend to augment any route if required
        routeFn: function ({ registry }: any, obj: any[]) {
            if (Array.isArray(obj)) {
                obj.forEach((o) => {
                    if (typeof o === "function") {
                        registry.moduleVarAppend(ROUTER_MODULE, "routeFn", o);
                    } else {
                        console.error("Extension routesFn not a function", obj);
                    }
                });
            } else {
                if (typeof obj === "function") {
                    registry.moduleVarAppend(ROUTER_MODULE, "routeFn", obj);
                } else {
                    console.error("Extension routeFn not a function", obj);
                }
            }
        }
    },
    start({ vue, registry }) {
        const routerConfig = registry.configGet("router");

        // calculate config routes + extended routes
        const predefRoutes =
            routerConfig && routerConfig.routes ? routerConfig.routes : [];
        const extRoutes = registry.moduleVarGet(ROUTER_MODULE, "routes");
        routes = this.applyRouteFns(
            predefRoutes.concat(extRoutes ? extRoutes : []),
            registry.moduleVarGet(ROUTER_MODULE, "routeFn")
        );

        // scrollBehavior
        const scrollBehavior =
            routerConfig && routerConfig.scrollBehavior
                ? routerConfig.scrollBehavior
                : null;
        const mode =
            routerConfig && routerConfig.mode ? routerConfig.mode : "history";

        // expose router object for final initialization
        router = createRouter({
            history: mode === "history" ? createWebHistory() : createWebHashHistory(),
            scrollBehavior,
            routes
        });

        // notify all callback listeners
        startListener.forEach((cb) => cb(router, routes));

        vue.use(router);
    },
    onStart(callback: (router: any, routes: any) => void) {
        startListener.push(callback);
    },
    /**
     * should be called by main initialization
     */
    router() {
        return router;
    },
    /**
     * Return all routes used to configure router
     */
    routes() {
        return routes;
    },
    applyRouteFns(routes: any, fns: any[]) {
        if (fns) {
            let fixRoutes = routes;
            fns.forEach((fn: (arg0: any) => any) => {
                fixRoutes = fixRoutes.map((r: any) => fn(r));
            });
            return fixRoutes;
        }
        return routes;
    }
};
