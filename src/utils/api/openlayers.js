import { getGeo } from '../request'
import axios from 'axios';
export const mdWslineGeoApi = paramsString => getGeo("geoserver/MD/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MD%3AWSLINE&maxFeatures=50000&outputFormat=application%2Fjson")
export const mdYslineGeoApi = paramsString => getGeo("geoserver/MD/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MD%3AYSLINE&maxFeatures=50000&outputFormat=application%2Fjson")
export const mdWsPointGeoApi = paramsString => getGeo("geoserver/MD/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MD%3AWSPOINT&maxFeatures=50000&outputFormat=application%2Fjson")
export const mdYsPointtGeoApi = paramsString => getGeo("geoserver/MD/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MD%3AYSPOINT&maxFeatures=50000&outputFormat=application%2Fjson")
export const typhoonGeoApi = paramsString => getGeo("geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Atyphooninfa&maxFeatures=50000&outputFormat=application%2Fjson")

export const jnWslineGeoApi = paramsString => getGeo("geoserver/JN4549/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=JN4549%3AWSLINE&maxFeatures=50&outputFormat=application%2Fjson")
// 获取边界数据
export const getMdData = () => {
    return axios.request({
        url: 'https://geo.datav.aliyun.com/areas_v3/bound/511402.json'
    })
}