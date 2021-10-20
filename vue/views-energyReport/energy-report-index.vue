<!--简介本组件:  -->

<template>
    <div class="energyReportCommon energyReport ">
        <!-- 页面头部 -->
        <div class="header">
            <h3 class="title">{{ customText.energy_report_title }}</h3>
            <img class="title_midImg" src="/static/images/title_middle1.gif" />
            <!-- <img class="title_midImg" src="/static/images/title_middle.gif"> -->
            <div class="pop_close1" @click="closeEnergyBusiness">
                <Icon class="des" type="md-close" />
            </div>
        </div>
        <transition
            appear
            enter-active-class="animated fadeInLeft"
            leave-active-class="animated fadeOutRight"
        >
            <div class="contain">
                <div class="content">
                    <div class="content_wrap">
                        <!-- 边框的样式图片布局 -->
                        <div class="border_left">
                            <img src="/static/images/mtop_left.png" />
                        </div>
                        <div class="border_right">
                            <img src="/static/images/mtop_right.png" />
                        </div>
                        <div class="bottom_left">
                            <img src="/static/images/mainf_left.png" />
                        </div>
                        <div class="bottom_right">
                            <img src="/static/images/mainf_right.png" />
                        </div>
                        <div class="tabArea">
                            <Tabs class="tabs">
                                <TabPane
                                    :label="customText.report_hoursehold"
                                    class="singeTab"
                                >
                                    <Household></Household>
                                </TabPane>
                                <TabPane
                                    :label="customText.report_subitem"
                                    class="singeTab"
                                >
                                    <SubItem></SubItem>
                                </TabPane>
                                <TabPane
                                    :label="customText.report_aggregate"
                                    class="singeTab"
                                >
                                    <Energy></Energy>
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
/*导入其它文件 import 组件名称 from '组件路径';*/
import { mapState, mapActions } from "vuex";
import loadingTemplate from "@/components/views-common/loading-template";
import treeTabVue from "../views-energyAnalysis/energyAnalysis-around/tree-tab.vue";
// 导入报表
import Household from "./reports/Household";
import SubItem from "./reports/SubItem";
import Energy from "./reports/Energy";
export default {
    name: "",
    components: {
        /*import引入的组件名称*/
        "loading-template": loadingTemplate,
        Household,
        SubItem,
        Energy
    },
    filters: {},
    props: {},
    data() {
        /*存放数据*/
        return {
            url: this.$reportUrl.reportUrl
        };
    },
    computed: {
        /*监听属性*/
        ...mapState({
            loadingShow: state => state.loadingShow,
            isHttpRequest: state => state.isHttpRequest,
            customText: state => state.customText
        })
    },
    watch: {
        /*监控数据变化*/
    },
    beforeCreate() {
        /*创建之前*/
    },
    created() {
        /*创建完成*/
    },
    beforeMount() {
        /*挂载之前*/
    },
    mounted() {
        /*挂载完成*/
        let self = this;
    },
    beforeUpdate() {
        /*更新之前*/
    },
    updated() {
        /* 更新之后*/
    },
    activated() {
        /*有keep-alive*/
    },
    deactivated() {
        /*有keep-alive*/
    },
    beforeDestroy() {
        /* 销毁之前*/
    },
    destroyed() {
        /*销毁完成*/
    },
    methods: {
        /*方法集合*/
        closeEnergyBusiness() {
            /* 关闭报警日志二级页 */
            this.$store.commit({
                type: "energyReport/isShowEnergyReport",
                data: false
            });
            this.$bus.$emit("startTimer_Home");
        }
    }
};
</script>
<style lang="less" scoped>
/*最外层为组件class名*/
.energyReport {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    background: url(/static/images/subItem_bg.png) no-repeat center;
    background-size: cover;
    z-index: 3;
    .header {
        position: relative;
        padding: 5px;
        // border-bottom: 1px solid #0197E1;
        .title_midImg {
            position: absolute;
            left: 50%;
            bottom: -8px;
            height: 6px;
            -webkit-transform: translate(-50%, 0);
            transform: translate(-50%, 0);
        }
        .title {
            color: #52c9fe;
            font-size: 20px;
            text-align: center;
            font-weight: 700;
            margin-right: 23px;
            // text-shadow: 0 0 10px #00e7e2;
            letter-spacing: 2px;
            span {
                font-size: 1em;
                margin-right: 5px;
            }
        }
        .pop_close1 {
            position: absolute;
            right: 20px;
            top: 21px;
            width: 83px;
            height: 49px;
            background: url(/static/images/closeBtn.png) no-repeat center;
            .des {
                font-size: 26px;
                position: relative;
                left: 45%;
                top: 10px;
                cursor: pointer;
                color: #4bcefc;
                z-index: 3;
            }
        }
        .pop_close1:hover {
            background: url(/static/images/closeActive.png) no-repeat center;
        }
    }
    .contain {
        position: relative;
        height: 93vh;
        margin: 0 20px 0 20px;
        border: 5px solid transparent;
        border-image: url(/static/images/subItem_border.png) 5 5 round;
        // border:1px solid #0468A2;
        // background: url(/static/images/subItem_border.png) no-repeat center;
        // background-size: contain;
        .content {
            position: absolute;
            top: 40px;
            left: 25px;
            right: 25px;
            bottom: 25px;
            .content_wrap {
                position: relative;
                height: 100%;
                border: 1.2px solid #0e6695;
                padding: 16px;
                .border_left {
                    position: absolute;
                    left: -6px;
                    top: -7px;
                }
                .border_right {
                    position: absolute;
                    right: -6px;
                    top: -7px;
                    text-align: right;
                }
                .bottom_left {
                    position: absolute;
                    left: -5px;
                    bottom: -12px;
                }
                .bottom_right {
                    position: absolute;
                    right: -5px;
                    bottom: -12px;
                }
            }
        }
    }
    .tabArea {
        width: 100%;
        height: 100%;
        .tabs {
            height: 100%;
        }
        .singeTab {
            height: 100%;
        }
    }
}
</style>
