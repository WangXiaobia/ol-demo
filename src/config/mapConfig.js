let rand = Math.floor(Math.random() * 7)
export default {
  tianDiTuKey: 'ae1e6a3adc4c27dd750b964d94d2f964',
  center: [27.973594, 119.635686], //景宁
  olcenter: [103.916, 30.0665], //岷东
  //污水厂位置
  positionWaste: [{
    id: 1,
    latlng: [119.797626, 28.957596],
    name: '武义中成污水厂',
    description: '武义县中成污水处理厂远期设计处理规模10万吨/日，目前已建成运行的一期、二期建设规模均为2.5万吨/日。中成污水厂占地5.94公顷，位于武义县白杨街道新金塘西侧。服务范围主要是武义县规划城区和周边工业区，主要包括壶山街道、白羊街道和熟溪街道3个街道、武义经济开发区和履坦镇等。'
  },
  {
    id: 2,
    latlng: [119.85741, 28.88028],
    name: '武义桑德污水厂',
    description: '武义县桑德污水处理厂位于泉溪镇湖沿村工业区内，是武义县“五水共智”配套的重点项目。项目采用BOT模式，由桑德国际有限公司投资建设运营，项目总投资9000万元，占地面积3.8万平方米。项目服务范围为桐琴镇、泉溪镇，熟溪街道的东南工业园区和冷水坑工业园区及沿线纳管村庄等。'
  },
  ],
  //卫星图
  tianditu_imgUrl: 'http://t' + rand + '.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=dcfbdb7e0f9b4a7cfcecdab008ae97bc',
  //地形图
  dixingUrl: 'http://t' + rand + '.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=dcfbdb7e0f9b4a7cfcecdab008ae97bc',
  //行政图
  tianditu_vecUrl: 'http://t' + rand + '.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=dcfbdb7e0f9b4a7cfcecdab008ae97bc',
  //文字注记
  tianditu_cvaUrl: 'http://t' + rand + '.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=dcfbdb7e0f9b4a7cfcecdab008ae97bc',

  tileArcGISURL: 'http://81.69.13.65:6080/arcgis/rest/services/jnlw/%E6%99%AF%E5%AE%81%E8%B7%AF%E7%BD%91/MapServer',
  geoServeUrl: 'http://150.158.34.72:8080'
}