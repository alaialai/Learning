<!--
 * @Author: xiangly
 * @Date: 2020-09-24 09:39:59
 * @LastEditors: xiangly
 * @LastEditTime: 2020-10-27 19:37:26
 * @Description: 分户报表
-->
<template>
    <div class="energyReportCommon Household">
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
                        <!-- <Button @click="showCharts('echartsHousehold')" type="primary">图示</Button> -->
                        <Button @click="handleExport" type="primary"
                            >导出</Button
                        >
                    </div>
                </FormItem>
            </Form>
        </SearchBorder>
        <div
            class="tableArea"
            style="height: calc(100% - 160px);"
            ref="tableArea"
        >
            <div class="table_header">{{ reportTitle }}</div>
            <Table
                :columns="tableHeader"
                :data="tableData"
                :height="tableHeight"
                :row-class-name="rowClassName"
                border
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
                    id="echartsHousehold"
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
import loadingTemplate from "../../views-common/loading-template";
import "echarts-gl";

import mixin from "../common/mixin";
import { mapState } from "vuex";
export default {
    components: {
        SearchBorder,
        InputTree,
        loadingTemplate
    },
    computed: {
        ...mapState({
            customText: state => state.customText
        })
    },
    mixins: [mixin],
    methods: {
        // handleExportCSV() {
        //   this.exportCSV({
        //     filename: "分户报表.csv",
        //     title: "title",
        //     code: "code",
        //     logo: "logo",
        //     coloum: this.tableHeader,
        //     data: this.tableData
        //   });
        // },
        changeHeight() {
            console.log(this.$refs.tableArea.offsetHeight);
            this.tableHeight = this.$refs.tableArea.offsetHeight - 40;
        }
    },
    created() {
        this.title = this.customText.report_hoursehold;
        this.reportTitle = this.title;
    },
    mounted() {
        console.log(this.$refs.tableArea.offsetHeight);
        this.tableHeight = this.$refs.tableArea.offsetHeight - 40;
        window.addEventListener("resize", () => this.changeHeight(), false);
    }
};
</script>

<style lang="less" scoped>
.Household {
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
        // margin-top: 100px;
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
