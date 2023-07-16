import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

//获取原型对象上的push函数
const originalPush = VueRouter.prototype.push;
//修改原型对象中的push方法
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
};

const routes = [{
    path: '/',
    name: '/home',
    component: () => import('@/views/home/Home.vue')
}, {
    path: '/view',
    name: 'view',
    component: () => import('@/components/basicLayout/BasicLayout.vue'),
    children: [{
        path: 'openlayers/initMap',
        name: 'initMap',
        component: () => import('@/views/openlayers/initMap')
    }, {
        path: 'openlayers/mapDataSource',
        name: 'mapDataSource',
        component: () => import('@/views/openlayers/mapDataSouce')
    },
    {
        path: 'openlayers/enclosure',
        name: 'enclosure',
        component: () => import('@/views/openlayers/enclosure')
    },
    {
        path: 'openlayers/geojsonTocsv',
        name: 'geojsonTocsv',
        component: () => import('@/views/openlayers/geojsonTocsv')
    },
    {
        path: 'openlayers/trace',
        name: 'trace',
        component: () => import('@/views/openlayers/trace')
    },
    {
        path: 'openlayers/analys',
        name: 'analys',
        component: () => import('@/views/openlayers/analys')
    },
    {
        path: 'openlayers/olTurf',
        name: 'olTurf',
        component: () => import('@/views/openlayers/olTurf')
    },
    {
        path: 'openlayers/cover',
        name: 'cover',
        component: () => import('@/views/openlayers/cover')
    },
    {
        path: 'openlayers/telescope',
        name: 'telescope',
        component: () => import('@/views/openlayers/telescope')
    },
    {
        path: 'openlayers/customColor',
        name: 'customColor',
        component: () => import('@/views/openlayers/customColor')
    },
    {
        path: 'openlayers/typhoon2',
        name: 'typhoon2',
        component: () => import('@/views/openlayers/typhoon2')
    },
    {
        path: 'openlayers/wind',
        name: 'wind',
        component: () => import('@/views/openlayers/wind')
    },
    {
        path: 'openlayers/three',
        name: 'three',
        component: () => import('@/views/openlayers/three')
    },
    {
        path: 'openlayers/hightLight',
        name: 'hightLight',
        component: () => import('@/views/openlayers/hightLight')
    },
    {
        path: 'openlayers/dynamicLine',
        name: 'dynamicLine',
        component: () => import('@/views/openlayers/dynamicLine')
    },
    {
        path: 'openlayers/wmsTile',
        name: 'wmsTile',
        component: () => import('@/views/openlayers/wmsTile')
    },
    {
        path: 'openlayers/webGl',
        name: 'wmsTile',
        component: () => import('@/views/openlayers/webgl')
    },
    {
        path: 'openlayers/canvasLine',
        name: 'canvasLine',
        component: () => import('@/views/openlayers/canvasLine')
    },
    ]
}]

const router = new VueRouter({
    routes: [...routes],
})

export default router;
