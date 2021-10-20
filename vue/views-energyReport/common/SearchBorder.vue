<!--
 * @Author: xiangly
 * @Date: 2020-09-24 10:47:24
 * @LastEditors: xiangly
 * @LastEditTime: 2020-10-27 15:01:15
 * @Description: 搜索框
-->
<template>
    <div class="searchBorder">
        <div class="search_left">
            <img src="/static/images/mainf_left.png" />
        </div>
        <div class="search_right">
            <img src="/static/images/mainf_right.png" />
        </div>
        <div class="search_bleft">
            <img src="/static/images/mainf_left.png" />
        </div>
        <div class="search_bright">
            <img src="/static/images/mainf_right.png" />
        </div>
        <div class="search_main">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {};
</script>

<style lang="less" scoped>
.searchBorder {
    position: relative;
    height: 80px;
    line-height: 80px;
    padding-top: 20px;
    border: 1px solid #0e6695;
    .search_left {
        position: absolute;
        left: -13px;
        top: -35px;
        transform: rotate(90deg);
    }
    .search_right {
        position: absolute;
        right: -13px;
        top: -35px;
        transform: rotate(270deg);
    }
    .search_bleft {
        position: absolute;
        left: -5px;
        bottom: -42px;
    }
    .search_bright {
        position: absolute;
        right: -5px;
        bottom: -42px;
    }
    .search_main {
        height: 100%;
    }
}
</style>
