<!--
 * @Author: xiangly
 * @Date: 2020-09-24 09:39:59
 * @LastEditors: xiangly
 * @LastEditTime: 2020-10-28 10:58:43
 * @Description: 分项报表
-->
<template>
    <div class="energyReportCommon SubItem">
        <SearchBorder>
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
                <FormItem label="分户">
                    <InputTree
                        :value.sync="searchForm.nodeNo"
                        :dataTress="dataTress"
                    ></InputTree>
                </FormItem>
                <FormItem class="btn_search btn_area">
                    <div class="buttons">
                        <Button @click="getTableData" type="primary"
                            >查询</Button
                        >
                        <!-- <Button @click="showCharts('echartsSubItem')" type="primary">图示</Button> -->
                        <Button @click="handleExport" type="primary"
                            >导出</Button
                        >
                    </div>
                </FormItem>
            </Form>
        </SearchBorder>
        <div
            class="tableArea"
            ref="tableArea"
            style="height: calc(100% - 160px);"
        >
            <div class="table_header">{{ reportTitle }}</div>
            <Table
                :columns="tableHeader"
                :data="tableData"
                :height="tableHeight"
                :row-class-name="rowClassName"
            ></Table>
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
                    id="echartsSubItem"
                    style="width: 860px; height: 600px;"
                ></div>
            </div>
            <div slot="footer">
                <!-- <Button class="btn" type="primary" size="small" @click="confirmChoose_New">确定</Button> -->
            </div>
        </Modal>
        <loading-template v-show="loadingShow"></loading-template>
    </div>
</template>

<script>
import SearchBorder from "../common/SearchBorder";
import InputTree from "../common/InputTree";
import $echarts from "echarts";
import loadingTemplate from "../../views-common/loading-template";
import "echarts-gl";

import mixin from "../common/mixin";
export default {
    components: {
        SearchBorder,
        InputTree,
        loadingTemplate
    },
    mixins: [mixin],
    methods: {
        async getTableDataPort() {
            if (!this.searchForm.nodeNo) {
                this.$Message.error("请输入分户信息");
                return;
            }
            if (this.searchForm.timeDt) {
                this.loadingShow = true;
                this.searchForm.time = this.searchForm.timeDt.setHours(0, 0, 0);
                this.confirmData = Object.assign({}, this.searchForm);
                if (this.searchForm.timeType == "weekend") {
                    let dayth = this.searchForm.timeDt.getUTCDay();
                    if (dayth !== 6) {
                        this.confirmData.time =
                            this.searchForm.time -
                            (dayth + 1) * 24 * 3600 * 1000;
                    }
                }

                // 月tableHeader设定
                if (this.confirmData.timeType == "month") {
                    let days = this.getMonthDay();
                    this.getMonthHeader(days);
                    this.tableHeader = [].concat(
                        this.headers[this.confirmData.timeType]
                    );
                }

                let res = (await this.$api.energyReport.subItemReport(
                    this.confirmData
                )).data;
                console.log(res);

                this.loadingShow = false;
                this.reportTitle = this.getCSVTitle();
                if (res.result.resultCode == 0) {
                    return res["data"];
                }
                return [];
            }
        },
        changeHeight() {
            console.log(this.$refs.tableArea.offsetHeight);
            this.tableHeight = this.$refs.tableArea.offsetHeight - 40;
        }
    },
    created() {
        this.title = this.customText.report_subitem;
        this.reportTitle = this.title;
    },
    mounted() {
        console.log(this.$refs.tableArea.offsetHeight);
        this.tableHeight = this.$refs.tableArea.offsetHeight - 40;
        // window.onresize = () => {
        //     console.log(this.$refs.tableArea.offsetHeight);
        //     this.tableHeight = this.$refs.tableArea.offsetHeight - 40;
        //     console.log(this.tableHeight);
        // };
        window.addEventListener("resize", () => this.changeHeight(), false);
    }
};
</script>

<style lang="less" scoped>
.SubItem {
    height: 100%;
    .tableArea {
        margin-top: 15px;
        background-color: #03355d;
        .table_header {
            text-align: center;
            color: rgb(41, 152, 203);
            font-size: 16px;
            margin: 15px auto;
            font-weight: 600;
        }
    }
    .btn_area {
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
</style>
