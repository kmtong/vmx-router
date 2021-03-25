# How to Use

## Main Modification

```js
import VueModx from 'vue-modx'
import RouterModule from 'vmx-router'
import SomeModule from './somemodule'
// app
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(VueModx, {modules: [RouterModule, SomeModule], config: {
    router: {
        routes: [], // predefined routes if any
        scrollBehavior: () => ({ y: 0 }), // see https://router.vuejs.org/guide/advanced/scroll-behavior.html#async-scrolling
        mode: "history" // default "history"
    }
}})

// get router object from module
const router = RouterModule.router();

new Vue({
  router, // router to be initialized to vue instance
  render: h => h(App),
}).$mount('#app')

```

## Register an Extension of "router"

```js
import Foo from './foo.vue'

const mod = {
    name: "somemodule",
    dependsOn: ["router"],
    extensions: {
        "router": [
            // for static loading
            { path: '/foo', component: Foo },
            // for dynamic loading
            { path: '/bar', component: () => import('./bar.vue') }
            
            // same route definition as official document
            // for more information, see:
            // 1. https://router.vuejs.org/guide/#html
            // 2. https://router.vuejs.org/api/#routes

        ]
    }
}

export default mod
```

## Register an Extension of "routeFn"

```js
import MyLayout from './layout.vue'

const mod = {
    name: "layoutModule",
    dependsOn: ["router"],
    extensions: {
        "routeFn": () => ((route) => {
            route.component = MyLayout
        })
    }
}

export default mod
```

