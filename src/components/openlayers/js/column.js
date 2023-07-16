
//管线
let columns = [
    {
        title: "ID",
        dataIndex: "id",
        fixed: 'left',
        width: 100,
    },
    {
        title: "管线性",
        dataIndex: "pip_nature",
        width: 80,
    },
    {
        title: "起点",
        dataIndex: "to_point",
        width: 120,
    },
    {
        title: "终点",
        dataIndex: "end_point",
        width: 120,
    },
    {
        title: "起点埋",
        dataIndex: "to_depth",
        width: 80,
    },
    {
        title: "终点埋",
        dataIndex: "end_depth",
        width: 80,
    },
    {
        title: "起点高",
        dataIndex: "to_elevation",
        width: 160,
    },
    {
        title: "终点高",
        dataIndex: "end_elevation",
        width: 160,
    },
    {
        title: "管径",
        dataIndex: "pip_diameter",
        width: 80,
    },
    {
        title: "材质",
        dataIndex: "material",
        width: 120,
    },
    {
        title: "埋设类",
        dataIndex: "type",
        width: 120,
    },
    {
        title: "所在道",
        dataIndex: "rode_name",
        width: 120,
    },
    {
        title: "探测单",
        dataIndex: "detection_unit",
        width: 300,
    },
    {
        title: "长度",
        dataIndex: "pip_length",
        width: 160,
    },
    {
        title: "操作",
        fixed: 'right',
        width: 70,
        scopedSlots: { customRender: 'operation' }
    }
];
//管点
let columns2 = [
    {
        title: "ID",
        dataIndex: "id",
        fixed: 'left',
        width: 100,
    },
    {
        title: "管线性",
        dataIndex: "pip_nature",
        width: 80,
    },
    {
        title: "物探点",
        dataIndex: "gp_point",
        width: 120,
    },
    {
        title: "x坐标",
        dataIndex: "x",
        width: 160,
    },
    {
        title: "y坐标",
        dataIndex: "y",
        width: 160,
    },
    {
        title: "地面高",
        dataIndex: "elevation",
        width: 120,
    },
    {
        title: "附属物",
        dataIndex: "appendages",
        width: 80,
    },
    {
        title: "井底深",
        dataIndex: "well_depth",
        width: 80,
    },
    {
        title: "所在道",
        dataIndex: "rode_name",
        width: 120,
    },
    {
        title: "探测单",
        dataIndex: "detection_unit",
        width: 300,
    },
    {
        title: "操作",
        fixed: 'right',
        width: 70,
        scopedSlots: { customRender: 'operation' }
    }
];
//纵剖面分析//流向分析
let columns3 = [
    {
        title: "ID",
        dataIndex: "id",
        fixed: 'left',
        width: 100,
    },
    {
        title: "起点",
        dataIndex: "to_point",
        width: 120,
    },
    {
        title: "终点",
        dataIndex: "end_point",
        width: 120,
    },
    {
        title: "起点埋",
        dataIndex: "to_depth",
        width: 80,
    },
    {
        title: "终点埋",
        dataIndex: "end_depth",
        width: 80,
    },
    {
        title: "起点高",
        dataIndex: "to_elevation",
        width: 160,
    },
    {
        title: "终点高",
        dataIndex: "end_elevation",
        width: 160,
    },
    {
        title: "管径",
        dataIndex: "pip_diameter",
        width: 80,
    },
    {
        title: "材质",
        dataIndex: "material",
        width: 140,
    },
    {
        title: "埋设类",
        dataIndex: "type",
        width: 120,
    },
    {
        title: "所在道",
        dataIndex: "rode_name",
        width: 120,
    },
    {
        title: "探测单",
        dataIndex: "detection_unit",
        width: 300,
    },
    {
        title: "管线长度",
        dataIndex: "pip_length",
        width: 160,
    },
    {
        title: "流向",
        dataIndex: "flow",
        fixed: 'right',
        width: 80,
        scopedSlots: { customRender: 'flowScope' }
    },
];
//横断面分析
let columns4 = [
    {
        title: "ID",
        dataIndex: "id",
        fixed: 'left',
        width: 100,
    },
    {
        title: "起点",
        dataIndex: "to_point",
        width: 120,
    },
    {
        title: "终点",
        dataIndex: "end_point",
        width: 120,
    },
    {
        title: "起点埋",
        dataIndex: "to_depth",
        width: 80,
    },
    {
        title: "终点埋",
        dataIndex: "end_depth",
        width: 80,
    },
    {
        title: "起点高",
        dataIndex: "to_elevation",
        width: 160,
    },
    {
        title: "终点高",
        dataIndex: "end_elevation",
        width: 160,
    },
    {
        title: "材质",
        dataIndex: "material",
        width: 150,
    },
    {
        title: "埋设类",
        dataIndex: "type",
        width: 120,
    },
    {
        title: "所在道",
        dataIndex: "rode_name",
        width: 120,
    },
    {
        title: "探测单",
        dataIndex: "detection_unit",
        width: 300,
    },
    {
        title: "管线长度",
        dataIndex: "pip_length",
        width: 160,
    },
    {
        title: "管径",
        dataIndex: "pip_diameter",
        fixed: 'right',
        width: 80,
    },
];
export { columns, columns2,columns3,columns4}