<template>
    <div class="warnObjSty">
        <Input
            v-model="label"
            icon="ios-arrow-down"
            :readonly="true"
            :placeholder="placeholder"
            :style="{ width: width + 'px' }"
            size="small"
            @on-clear="clearInput"
            @on-focus="treeClick"
            @on-click="treeClick"
            clearable
        >
        </Input>
        <div class="iconSty" v-show="iconShow">
            <Icon type="ios-arrow-down" />
        </div>
        <div class="treeObj" v-show="treeShow">
            <Tree
                ref="warningNode"
                :data="dataTress"
                @on-select-change="treeSelect"
            ></Tree>
        </div>
    </div>
</template>
<script>
export default {
    name: "InputTree",
    props: {
        value: {
            type: String,
            default: ""
        },
        placeholder: {
            type: String,
            default: ""
        },
        width: {
            type: Number,
            default: 148
        },
        dataTress: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            iconShow: false,
            treeShow: false,
            label: ""
        };
    },
    methods: {
        clearInput() {
            this.iconShow = false;
            let arr = this.$refs.warningNode.getSelectedNodes();
            arr[0].selected = false;
            console.log("清除", arr);
        },
        treeClick() {
            this.treeShow = true;
            this.zhezaoShow = true;
            this.iconShow = false;
            $(".warnObjSty .ivu-input-wrapper i").removeClass(
                "ivu-icon-ios-arrow-down"
            );
            $(".warnObjSty .ivu-input-wrapper i").addClass(
                "ivu-icon-ios-arrow-up"
            );
        },
        treeSelect(data) {
            console.log("ddddddddddddddddd", data);
            // this.zhezaoShow = false;
            this.treeShow = false;
            console.log(data);
            this.$emit("update:value", data[0].modelId);
            this.label = data[0].title;
            this.iconShow = true;
            $(".warnObjSty .ivu-input-wrapper i").removeClass(
                "ivu-icon-ios-arrow-up"
            );
            $(".warnObjSty .ivu-input-wrapper i").removeClass(
                "ivu-icon-ios-arrow-down"
            );
        },
        treeHide() {
            this.treeShow = false;
            this.zhezaoShow = false;
            this.iconShow = true;
            console.log("shujiedian");
            $(".warnObjSty .ivu-input-wrapper i").removeClass(
                "ivu-icon-ios-arrow-up"
            );
            $(".warnObjSty .ivu-input-wrapper i").removeClass(
                "ivu-icon-ios-arrow-down"
            );
        }
    }
};
</script>
<style lang="less" scoped>
.warnObjSty{
                cursor: pointer;
                .iconSty{
                    position: absolute;
                    color: #1BACFB;
                    font-size: 16px;
                    right: 5px;
                    top: 0
                }
                .treeObj{
                    position: absolute;
                    z-index: 2;
                    background-color: #02295A;
                    max-width: 410px;
                    min-width: 150px;
                    max-height: 600px;
                    overflow: auto;
                    border-radius:  5px;
                    border: 1px solid #30A8FB;
                }
            }
</style>
