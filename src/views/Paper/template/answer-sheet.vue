<template>
  <!--准确率界面-->
  <el-dialog
    title="答题卡"
    width="340px"
    :visible.sync="switchBtn"
    :close-on-click-modal="false"
    :before-close="() => $emit('close')"
    append-to-body>
    <div class="tooltip">
      <span class="answer">已作答</span>
      <span>未作答</span>
    </div>
    <div class="sheet-box">
      <div
        v-for="(item, index) in list"
        :key="index">
        <span :class="{ answer: item }">{{ index + 1 }}</span>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="$emit('close')" >关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'answer-sheet',
    props: ['switchBtn', 'list']
  }
</script>

<style scoped>
  .sheet-box{
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
  }
  .sheet-box > div{
    width: 20%;
    height: 60px;
  }
  .sheet-box > div span{
    display: block;
    line-height: 50px;
    border: 1px solid #eee;
    border-radius: 25px;
    background: #e0e0e0;
    margin: 5px;
    text-align: center;
    color: #fff;
    font-weight: 600;
    font-size: 25px;
  }
  .sheet-box > div span.answer{
    background: #43a0ae;
  }
  .tooltip {
    line-height: 30px;
    overflow: hidden;
  }
  .tooltip span {
    display: block;
    float: left;
    padding-left: 30px;
    position: relative;
  }
  .tooltip span:before {
    content: '';
    display: block;
    width: 15px;
    height: 15px;
    background: #e0e0e0;
    border-radius: 7px;
    position: absolute;
    top: 7px;
    left: 10px;
  }
  .tooltip span.answer:before {
    background: #43a0ae;
  }
</style>
