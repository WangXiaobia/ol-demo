module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/', //打包后放服务器的路径 例如/https://csi.tmuyun.com/land-system/
    outputDir: 'gisDemo', //打包后文件的存放目录 __dirname表示当前目录的绝对路径，path.resolve
    assetsDir: 'assets', //放置静态文件的目录 js,css等
    filenameHashing: true,
    pages: {
        index: {
            // page 的入口
            entry: 'src/main.js',
            // 模板来源
            template: 'public/index.html',
            // 在 dist/index.html 的输出
            filename: 'index.html',
            // 当使用 title 选项时，
            // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: 'gis实例',
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        },
    },
    lintOnSave: process.env.NODE_ENV !== 'production',
    runtimeCompiler: false,
    transpileDependencies: [],
    productionSourceMap: false,
    chainWebpack: config => {
        config.optimization.minimize(true);//进行代码压缩
        config.externals({
            "jquery": "$",
            // 'echarts': 'echarts',
        });
    },
    css: {
        loaderOptions: {
            less: {
                javascriptEnabled: true
            }
        }
    }
};
