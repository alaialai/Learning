<!--
 * @Author: xiangly
 * @Date: 2020-09-27 16:19:06
 * @LastEditors: xiangly
 * @LastEditTime: 2020-11-06 09:02:56
 * @Description: 表计报表
-->
<template>
    <div class="energyReportCommon report">
        <!-- 左边布局 -->
        <div class="report_leftArea" style="height: calc(100% - 50px);">
            <SearchBorder class="report_border">
                <div class="checkTitle">
                    <Checkbox
                        :indeterminate="indeterminate"
                        :value="checkAll"
                        @click.prevent.native="handleCheckAll"
                        >全选</Checkbox
                    >
                </div>
                <Checkbox-group
                    v-model="searchForm.areaIdList"
                    @on-change="checkAllGroupChange"
                    class="checks"
                    style="height: calc(100% - 60px);"
                >
                    <Checkbox
                        :label="item.id"
                        v-for="item in leftList"
                        :key="item.id"
                        >{{ item.name }}</Checkbox
                    >
                </Checkbox-group>
            </SearchBorder>
        </div>
        <!-- 右边布局 -->
        <div
            class="report_rightArea"
            style="width: calc(100% - 250px);height: calc(100% - 50px);"
            ref="rightArea"
        >
            <SearchBorder class="report_border">
                <div class="right_search">
                    <Form
                        ref="searchForm"
                        :model="searchForm"
                        :label-width="100"
                        inline
                    >
                        <FormItem>
                            <RadioGroup v-model="searchForm.timeType">
                                <Radio
                                    :label="item.value"
                                    v-for="item in timeRadios"
                                    :key="item.value"
                                >
                                    <span>{{ item.label }}</span>
                                </Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="时间">
                            <DatePicker
                                type="date"
                                placeholder="Select date"
                                style="width: 200px"
                                size="small"
                                v-model="searchForm.timeDt"
                            ></DatePicker>
                        </FormItem>
                        <FormItem label="属性">
                            <Select
                                v-model="searchForm.propertyCode"
                                style="width: 200px"
                                size="small"
                            >
                                <Option
                                    v-for="item in propertyList"
                                    :value="item.typeCode"
                                    :key="item.typeCode"
                                    >{{ item.typeName }}</Option
                                >
                            </Select>
                        </FormItem>
                        <FormItem class="btn_search btn_area">
                            <div class="buttons">
                                <Button @click="getTableData" type="primary"
                                    >查询</Button
                                >
                                <!-- <Button @click="showCharts('echartsEnergy')" type="primary"
                                    >图示</Button
                                > -->
                                <Button @click="handleExport" type="primary"
                                    >导出</Button
                                >
                            </div>
                        </FormItem>
                    </Form>
                </div>
                <div class="right_table" style="line-height: 30px">
                    <div class="table_header">{{ reportTitle }}</div>
                    <div class="tableArea">
                        <Table
                            :columns="tableHeader"
                            :data="tableData"
                            :height="tableHeight"
                            :row-class-name="rowClassName"
                        ></Table>
                    </div>
                </div>
                <loading-template v-show="loadingShow"></loading-template>
            </SearchBorder>
        </div>
        <Modal
            v-model="isOpenModel"
            :draggable="true"
            width="900"
            class="modalCommonSty"
            @on-cancel="cancelModal()"
        >
            <div slot="header">
                <img
                    class="headerImg"
                    src="/static/images/modal_heard_bg.png"
                />
                <div class="h5">图示</div>
            </div>
            <div class="content">
                <div
                    class="contain"
                    id="echartsEnergy"
                    style="width: 860px; height: 600px;"
                ></div>
            </div>
            <div slot="footer">
                <!-- <Button class="btn" type="primary" size="small" @click="confirmChoose_New">确定</Button> -->
            </div>
        </Modal>
    </div>
</template>

<script>
import SearchBorder from "../common/SearchBorder";
import mixin from "../common/mixin";
import $echarts from "echarts";
import loadingTemplate from "../../views-common/loading-template";
import { toExcel } from "../common/until/toexcel";
export default {
    components: {
        SearchBorder,
        loadingTemplate
    },
    mixins: [mixin],
    data() {
        return {
            leftList: [],
            timeRadios: [
                {
                    value: "month",
                    label: "月"
                },
                {
                    value: "day",
                    label: "日"
                }
            ],
            indeterminate: true,
            checkAll: false,
            propertyList: [],
            searchForm: {
                areaIdList: [],
                type: "TYYD",
                timeType: "month",
                time: null,
                timeDt: new Date(),
                propertyCode: ""
            },
            title: ""
        };
    },
    methods: {
        async getLeftListPort() {
            let res = (await this.$api.moduleConfig.queryMeterArea()).data;
            console.log(res);
            if (res.result.resultCode == 0) {
                this.leftList = res.data;
            }
        },
        handleCheckAll() {
            if (this.indeterminate) {
                this.checkAll = false;
            } else {
                this.checkAll = !this.checkAll;
            }
            this.indeterminate = false;

            if (this.checkAll) {
                this.searchForm.areaIdList = this.leftList.reduce(
                    (acc, cur) => {
                        return acc.concat([cur.id]);
                    },
                    []
                );
                // console.log(this.checkAllGroupChange)
            } else {
                this.searchForm.areaIdList = [];
            }
        },
        checkAllGroupChange() {},
        async getProperty() {
            let res = (await this.$api.energyReport.getProperty()).data;
            //   console.log(res);
            if (res.result.resultCode == 0) {
                this.propertyList = res.data;
            }
        },
        getTableData() {
            this.tableHeader = [].concat(
                this.headers[this.searchForm.timeType]
            );
            this.loadingShow = true;
            this.tableData = [];
            this.getTableDataPort().then(res => {
                this.tableData = res;
                this.loadingShow = false;
            });
        },
        getDayHeader() {
            this.headers.day.push({
                key: "name",
                title: this.title.substring(0, 2),
                width: "260",
                fixed: "left",
                className: "title-td"
            });
            for (let i = 0; i < 24; i++) {
                let obj = {};
                if (i < 9) {
                    obj["key"] = `hour0${i + 1}`;
                } else {
                    obj["key"] = `hour${i + 1}`;
                }
                obj["width"] = `80`;
                obj["title"] = `${i}时`;
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
                                class: ["ivu-table-cell-tooltip", "ivu-tooltip"]
                            },
                            [
                                h(
                                    "span",
                                    {
                                        class: [
                                            "ivu-table-cell-tooltip-content"
                                        ]
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
                                            whiteSpace: "nowrap"
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
        async getTableDataPort() {
            if (!this.searchForm.propertyCode) {
                this.$Message.error("请输入属性信息");
                return;
            }
            if (this.searchForm.areaIdList.length == 0) {
                this.$Message.error("请勾选分户");
                return;
            }
            if (this.searchForm.timeDt) {
                this.searchForm.time = this.searchForm.timeDt.getTime();
                this.confirmData = Object.assign({}, this.searchForm);
                this.confirmData.type = `${
                    this.timeRadios.find(
                        e => e.value == this.confirmData.timeType
                    ).label
                }报`;
                this.confirmData["prorty"] = this.searchForm.propertyCode;

                // 月tableHeader设定
                if (this.confirmData.timeType == "month") {
                    let days = this.getMonthDay();
                    this.getMonthHeader(days);
                    this.tableHeader = [].concat(
                        this.headers[this.confirmData.timeType]
                    );
                }

                let params = {
                    areaIdList: this.searchForm.areaIdList.join(),
                    timeType: this.searchForm.timeType,
                    time: this.searchForm.time,
                    propertyCode: this.searchForm.propertyCode
                };

                let res = (await this.$api.energyReport.energyReport(params))
                    .data;
                let obj = {
                    month: "dayData",
                    day: "hourDatas"
                };
                let arr = [];
                let days = this.getMonthDay();

                if (res.result.resultCode == 0) {
                    this.reportTitle = this.getCSVTitle();
                    res["data"]["meterDataVoList"].forEach(item => {
                        let value = {};
                        value["name"] = item["name"];
                        value = Object.assign(
                            value,
                            item[obj[this.confirmData.timeType]]
                        );
                        delete value["type"];
                        delete value["empty"];
                        // 小数点保留两位
                        for (const key in value) {
                            if (value.hasOwnProperty(key)) {
                                if (key !== "name") {
                                    if (key.replace(/[^\d.]/g, "") <= days) {
                                        if (value[key] == null) {
                                            value[key] = "0.00";
                                        } else {
                                            value[key] = Number(
                                                value[key]
                                            ).toFixed(2);
                                        }
                                    } else {
                                        delete value[key];
                                    }
                                }
                            }
                        }
                        arr.push(value);
                    });
                }
                console.log(res);

                return arr;
            }
        },
        handleExport() {
            if (this.tableData.length == 0) {
                this.$Message.error("请先进行查询操作");
                return;
            }
            let prorty = this.propertyList.find(
                item => this.confirmData.prorty == item.typeCode
            ).typeName;
            toExcel({
                filename: `${this.reportTitle}(${prorty})`,
                title: `${this.reportTitle}(${prorty})`,
                code: this.customText.document_number,
                logo: this.customText.index_title,
                tableHeader: this.tableHeader,
                tableData: this.tableData
            });
        }
    },
    created() {
        this.getLeftListPort();
        this.getProperty();
        this.title = this.customText.report_aggregate;
        this.reportTitle = this.title;
    },
    mounted() {
        console.log(this.$refs.rightArea.offsetHeight);
        this.tableHeight = this.$refs.rightArea.offsetHeight - 140;
        window.onresize = () => {
            console.log(this.$refs.rightArea.offsetHeight);
            this.tableHeight = this.$refs.rightArea.offsetHeight - 140;
        };
    }
};
</script>

<style lang="less" scoped>
.report {
    display: flex;
    height: 100%;
    width: 100%;
    color: rgb(41, 152, 203);
    &_border {
        height: 100%;
        padding: 10px;
    }
    &_leftArea {
        width: 300px;

        margin-right: 30px;
        .checkTitle {
            width: 100%;
            line-height: 40px;
            border-bottom: 1px solid rgb(41, 152, 203);
        }
        .checks {
            line-height: 30px;
            margin-top: 10px;
            display: flex;
            flex-direction: column;

            overflow: auto;
        }
    }
    &_rightArea {
        line-height: 30px;
        height: 100%;
        width: calc(100% - 250px);
        .right_search {
            height: 60px;
        }
        // margin-right: 330px;
        height: 100%;
        .table_header {
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .tableArea {
            background-color: #03355d;
        }
        .btn_area {
            margin-top: 5px;
            width: 240px;
            float: right;
            .buttons {
                display: flex;
                justify-content: flex-end;
                button {
                    margin-left: 10px;
                }
            }
        }
    }
}
</style>
