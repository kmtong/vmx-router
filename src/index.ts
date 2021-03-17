import VueRouter from 'vue-router'

const ROUTER_MODULE = "router";

// to be exposed
let router = null;
let routes = null;
let startListener = [];

export default {
    name: ROUTER_MODULE,
    dependsOn: null,
    extensionPoints: {
        "router": function ({ registry }, obj) {
            if (Array.isArray(obj)) {
                obj.forEach(o => {
                    registry.moduleVarAppend(ROUTER_MODULE, "routes", o);
                });
            } else {
                registry.moduleVarAppend(ROUTER_MODULE, "routes", obj);
            }
        }
    },
    start({ vue, registry }) {
        vue.use(VueRouter)
        const routerConfig = registry.configGet("router");

        // calculate config routes + extended routes
        const predefRoutes = (routerConfig && routerConfig.routes) ? routerConfig.routes : [];
        const extRoutes = registry.moduleVarGet(ROUTER_MODULE, "routes");
        routes = predefRoutes.concat(extRoutes ? extRoutes : []);

        // scrollBehavior
        const scrollBehavior = (routerConfig && routerConfig.scrollBehavior) ? routerConfig.scrollBehavior : null;
        const mode = (routerConfig && routerConfig.mode) ? routerConfig.mode : "history";

        // expose router object for final initialization
        router = new VueRouter({
            mode,
            scrollBehavior,
            routes
        });

        // notify all callback listeners
        startListener.forEach(cb => cb(router, routes));
    },
    onStart(callback: (router, routes) => void) {
        startListener.push(callback)
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
    }
}
