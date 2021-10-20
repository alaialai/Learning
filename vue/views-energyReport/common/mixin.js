import { toExcel } from "./until/toexcel";
import $echarts from "echarts";
import { mapState } from "vuex";
export default {
    data() {
        return {
            searchForm: {
                nodeNo: "",
                type: "TYYD",
                timeType: "month",
                time: null,
                timeDt: new Date()
            },
            // 显示已搜索的条件
            confirmData:{
                timeDt: new Date(),
                timeType: "month",
                type:'月报',
                time:''
            },
            isOpenModel: false,
            timeRadios: [
                {
                    value: "year",
                    label: "年"
                },
                {
                    value: "month",
                    label: "月"
                },
                {
                    value: "weekend",
                    label: "周"
                },
                {
                    value: "day",
                    label: "日"
                }
            ],
            tableHeader: [],
            headers: {
                year: [],
                month: [],
                weekend: [],
                day: []
            },
            chartData: [],
            tableData: [],
            dataTress: [],
            title:'',
            reportTitle:' ',
            loadingShow:false,
            tableHeight:0
        };
    },
    computed:{
        ...mapState({
            customText:state => state.customText,
        })
    },
    methods: {
        async getTableDataPort() {
            if(!this.searchForm.nodeNo){
                this.$Message.error('请输入分户信息')
                return
            }
            if(!this.searchForm.timeDt){
                this.$Message.error('请输入时间信息')
                return
            }
            if (this.searchForm.timeDt) {
                this.loadingShow = true
                this.searchForm.time = (this.searchForm.timeDt.setHours(0,0,0));
                this.confirmData = Object.assign({},this.searchForm)
                if(this.searchForm.timeType == 'weekend'){
                    let dayth = this.searchForm.timeDt.getUTCDay()
                    if(dayth !== 6){
                        this.confirmData.time = this.searchForm.time-(dayth+1)*24*3600*1000
                    }
                }

                let res = (await this.$api.energyReport.householdReport(
                    this.confirmData
                )).data;

                this.confirmData.type = `${this.timeRadios.find(e => e.value ==  this.confirmData.timeType).label}报`
                // 月tableHeader设定
                if( this.confirmData.timeType == 'month'){
                     let days = this.getMonthDay();
                    this.getMonthHeader(days)
                    this.tableHeader = [].concat(
                        this.headers[this.confirmData.timeType]
                    );
                }
                console.log(res);

                this.loadingShow = false
                this.reportTitle = this.getCSVTitle()
                if (res.result.resultCode == 0) {
                    return  res['data']
                }
                return [];
            }
        },
        getTableData() {
            this.tableHeader = [].concat(
                this.headers[this.searchForm.timeType]
            );

            this.getTableDataPort().then(res => {
                this.tableData = []
                this.tableData = this.normalizeTableData(res) });
        },
        // 整合表格数据，表格内data数据保留两位小数及除去大于当选中月天数的key（为导出的数据）
        normalizeTableData(data){
            if(data.length == 0){
                return
            }
            let days = this.getMonthDay();
            let arr = [];
            let key = {
                year: "monthData",
                month: "dayData",
                weekend: "weekendData",
                day: "hourDatas"
            };
            data[this.confirmData.timeType].forEach(item => {
                let value = {
                    name: item["name"]
                };
                console.log( item[key[this.confirmData.timeType]])
                value = Object.assign(
                    value,
                    item[key[this.confirmData.timeType]]
                );
                delete value["type"];
                for (const key in value) {
                    if (value.hasOwnProperty(key)) {
                       if(key !== 'name'){
                           if(key.replace(/[^\d.]/g, '')<=days){
                               if( value[key] == null ){
                                   value[key] = "0.00"
                               }else{
                                value[key] = Number(value[key]).toFixed(2)
                               }

                           }else{
                            delete value[key];
                           }

                       }
                    }
                }
                arr.push(value);
            });
            return arr
        },
        async getTreeData() {
            let res = (await this.$api.logReport.getLineInfor()).data;
            if (res.result.resultCode == 0) {
                res.data.expend = true;
                this.dataTress.push(res.data);
            }
        },
        getYearHeader() {
            this.headers.year.push({
                key: "name",
                title: this.title.substring(0,2),
                width: "260",
                className: 'title-td'
            });
            for (let i = 1; i < 13; i++) {
                let obj = {};
                if (i < 10) {
                    obj["key"] = `month0${i}`;
                } else {
                    obj["key"] = `month${i}`;
                }
                obj["title"] = `${i}月`;
                // obj["tooltip"] = true;
                obj["render"] = (h, params) => {
                    let texts = params.row[obj.key];
                    return h("div", [
                        h(
                            "Tooltip",
                            {
                                props: {
                                    placement: "top",
                                    transfer: true
                                },
                                class:['ivu-table-cell-tooltip']
                            },
                            [
                                h(
                                    "span",
                                    {
                                        class:['ivu-table-cell-tooltip-content']

                                    },
                                   texts
                                ),
                                h(
                                    "span",
                                    {
                                        slot: "content",
                                        style: {
                                            whiteSpace: "normal",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",

                                        }
                                    },
                                    params.row[obj.key]
                                )
                            ]
                        )
                    ]);
                };

                this.headers.year.push(obj);
            }
        },
        getMonthHeader(day = 31) {
            this.headers.month = []
            this.headers.month.push({
                key: "name",
                title: this.title.substring(0,2),
                width: "260",
                fixed: "left",
                className: 'title-td'
            });
            for (let i = 1; i <= day; i++) {
                let obj = {};
                if (i < 10) {
                    obj["key"] = `day0${i}`;
                } else {
                    obj["key"] = `day${i}`;
                }
                obj["width"] = `80`;
                obj["title"] = `${i}日`;
                //  obj["ellipsis"] = true;

                // obj["tooltip"] = true;
                obj["render"] = (h, params) => {
                    let texts = params.row[obj.key];
                    return h("div",{
                        style:{
                            display:'block'
                        }
                    }, [
                        h(
                            "Tooltip",
                            {
                                props: {
                                    placement: "top",
                                    transfer: true
                                },
                                class:['ivu-table-cell-tooltip']
                            },
                            [
                                h(
                                    "span",
                                    {
                                        class:['ivu-table-cell-tooltip-content']

                                    },
                                   texts
                                ),
                                h(
                                    "span",
                                    {
                                        slot: "content",
                                        style: {
                                            whiteSpace: "normal",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",

                                        }
                                    },
                                    params.row[obj.key]
                                )
                            ]
                        )
                    ]);
                };
                this.headers.month.push(obj);
            }
        },
        getWeekendHeader() {
            this.headers.weekend.push({
                key: "name",
                title: this.title.substring(0,2),
                width: "260",
                className: 'title-td'
            });
            let week = ['','日','一','二','三','四','五','六']
            for (let i = 1; i < 8; i++) {
                let obj = {};
                obj["key"] = `day0${i}`;
                obj["title"] = `周${week[i]}`;
                // obj["tooltip"] = true;
                obj["render"] = (h, params) => {
                    let texts = params.row[obj.key];
                    return h("div", [
                        h(
                            "Tooltip",
                            {
                                props: {
                                    placement: "top",
                                    transfer: true
                                },
                                class:['ivu-table-cell-tooltip']
                            },
                            [
                                h(
                                    "span",
                                    {
                                        class:['ivu-table-cell-tooltip-content']

                                    },
                                   texts
                                ),
                                h(
                                    "span",
                                    {
                                        slot: "content",
                                        style: {
                                            whiteSpace: "normal",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",

                                        }
                                    },
                                    params.row[obj.key]
                                )
                            ]
                        )
                    ]);
                };
                this.headers.weekend.push(obj);
            }
        },
        getDayHeader() {
            this.headers.day.push({
                key: "name",
                title: this.title.substring(0,2),
                width: "260",
                fixed: "left",
                className: 'title-td'
            });
            for (let i = 0; i < 24; i++) {
                let obj = {};
                if (i < 9) {
                    obj["key"] = `hour0${i+1}`;
                } else {
                    obj["key"] = `hour${i+1}`;
                }
                obj["width"] = `80`;
                obj["title"] = `${i+1}时`;
                // obj["tooltip"] = true;
                obj["render"] = (h, params) => {
                    let texts = params.row[obj.key];
                    return h("div", [
                        h(
                            "Tooltip",
                            {
                                props: {
                                    placement: "top",
                                    transfer: true
                                },
                                class:['ivu-table-cell-tooltip','ivu-tooltip']
                            },
                            [
                                h(
                                    "span",
                                    {
                                        class:['ivu-table-cell-tooltip-content']

                                    },
                                   texts
                                ),
                                h(
                                    "span",
                                    {
                                        slot: "content",
                                        style: {
                                            whiteSpace: "normal",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",

                                        }
                                    },
                                    params.row[obj.key]
                                )
                            ]
                        )
                    ]);
                };
                this.headers.day.push(obj);
            }
        },
        makeHeader() {
            this.getYearHeader();
            this.getMonthHeader();
            this.getWeekendHeader();
            this.getDayHeader();
            this.tableHeader = [].concat(
                this.headers[this.searchForm.timeType]
            );
            // this.getTableData();
        },
        handleExport() {
            if(this.tableData.length ==0){
                this.$Message.error('请先进行查询操作')
                return
            }
            toExcel({
            filename:`${this.reportTitle}(kW•h)`,
                title: this.reportTitle,
                code: this.customText.document_number,
                logo: this.customText.index_title,
                tableHeader: this.tableHeader,
                tableData: this.tableData
            });

        },
        /* 获取csv文件名字 */
        getCSVTitle() {
            let title = this.title;
            switch (this.confirmData.timeType) {
                case "year":
                    title = `${this.confirmData.timeDt.getFullYear()}年${title}`;
                    break;
                case "month":
                    title = `${this.confirmData.timeDt.getFullYear()}年${this.confirmData.timeDt.getMonth()+1}月${title}`;
                    break;
                case "weekend":
                    let time = this.confirmData.time;
                    let start = new Date(time);
                    let end = new Date(time + 6*24*3600*1000)
                    title = `${start.getFullYear()}年${start.getMonth()+1}月${start.getDate()}日~${end.getFullYear()}年${end.getMonth()+1}月${end.getDate()}日${title}`;
                    break;
                case "day":
                    title =  `${this.confirmData.timeDt.getFullYear()}年${this.confirmData.timeDt.getMonth()+1}月${this.confirmData.timeDt.getDate()}日${title}`;
                    break;
                default:
                    break;
            }

            return title;
        },
        /* 整理charts需要的的数据格式 */
        normalizeChartsData(data) {
            let { XArray, YArray } = this.chartsAxis();
            let week = ['','日','一','二','三','四','五','六']
            let res = [["分户", "分项", "值"]];
            data.forEach(item => {
                let Xindex = XArray.findIndex(e => e == item.name);
                for (let key in item) {
                    if(key !== 'name'){
                        console.log(YArray, key);
                        let Yindex;

                        switch (this.confirmData.timeType) {
                            case 'year':
                                Yindex = YArray.findIndex(
                                    e => e == +key.substring(5) + "月"
                                );
                                console.log(key,+key.substring(5) + "月");
                            break;
                            case 'month':
                                Yindex = YArray.findIndex(
                                    e => e == +key.substring(3) + "日"
                                );
                                console.log(key,+key.substring(3) + "日");
                            break;
                            case 'weekend':
                                Yindex = YArray.findIndex(
                                    e => e == '周'+ week[(+key.substring(4))]
                                );
                                console.log(key,'周'+ (+key.substring(4)));
                            break;
                            case 'day':
                                Yindex = YArray.findIndex(
                                    e => e == +key.substring(4) + "时"
                                );
                                console.log(key,+key.substring(4) + "时");
                            break;
                            default:
                                break;
                        }

                        let arr = [Xindex, Yindex, +item[key]];
                        res.push(arr);
                    }

                }
            });
            console.log(res);
            return res
        },
        /* 展示表格点击事件 */
        showCharts(chartId) {
            this.chartData = this.normalizeChartsData(this.tableData);
            this.isOpenModel=true
            this.initCharts(chartId,this.chartData);
        },
        /* 获取XArray, YArray */
        chartsAxis() {
            let XArray = this.tableData.reduce((acc, cur) => {
                return acc.concat([cur.name]);
            }, []);
            let YArray = this.headers[this.confirmData.timeType].reduce(
                (acc, cur) => {
                    return acc.concat([cur.title]);
                },
                []
            );
            YArray.shift();
            return { XArray, YArray };
        },
        /* 初始化图表 */
        initCharts(chartId,data) {
            let { XArray, YArray } = this.chartsAxis();
            let myChart = null;
            myChart = $echarts.getInstanceByDom(
                document.getElementById(chartId)
            );
            if (myChart == undefined) {
                myChart = $echarts.init(
                    document.getElementById(chartId)
                );
            }
            //   myChart.clear();
            let option = {
                tooltip: {},
                visualMap: {
                    max: 20,
                    inRange: {
                        color: [
                            "#313695",
                            "#4575b4",
                            "#74add1",
                            "#abd9e9",
                            "#e0f3f8",
                            "#ffffbf",
                            "#fee090",
                            "#fdae61",
                            "#f46d43",
                            "#d73027",
                            "#a50026"
                        ]
                    }
                },
                xAxis3D: {
                    type: "category",
                    data: XArray
                },
                yAxis3D: {
                    type: "category",
                    data: YArray
                },
                zAxis3D: {
                    type: "value"
                },
                grid3D: {
                    axisLine: {
                        lineStyle: { color: '#fff' }
                    },
                    axisPointer: {
                        lineStyle: { color: '#fff' }
                    },
                    boxWidth: 200,
                    boxDepth: 80,
                    viewControl: {
                        // projection: 'orthographic'
                    },
                    light: {
                        main: {
                            intensity: 1.2,
                            shadow: true
                        },
                        ambient: {
                            intensity: 0.3
                        }
                    }
                },
                series: [
                    {
                        type: "bar3D",
                        name:'报表',
                        data: data.map(function(item) {
                            return {
                                value: [item[0], item[1], item[2]]
                            };
                        }),
                        tooltip: {
                            formatter: function (params) {
                                let value = params.value
                                return `${XArray[value[0]]}-${YArray[value[1]]}-${[value[2]]}`;
                                }
                        },
                        shading: "lambert",

                        label: {
                            textStyle: {
                                fontSize: 16,
                                borderWidth: 1
                            }
                        },

                        emphasis: {
                            label: {
                                textStyle: {
                                    fontSize: 20,
                                    color: "#900"
                                }
                            },
                            itemStyle: {
                                color: "#900"
                            }
                        }
                    }
                ]
            };
            myChart.setOption(option);
        },
        cancelModal() {
            this.isOpenModel = false
        },
        // 表格每行的class类名
        rowClassName (row, index) {
            if (index%2 === 1) {
                return 'odd-row';
            }
            return 'even-row';
        },
        // 获取当前页的天数
        getMonthDay(){
            let days = 0;
            let year = this.confirmData.timeDt.getFullYear();
            let month = (this.confirmData.timeDt.getMonth())+1;
            days = new Date(year,month,0).getDate()
            return days
        },
    },
    created() {
        this.getTreeData();
    },
    beforeMount(){
        this.makeHeader();
    }
};
