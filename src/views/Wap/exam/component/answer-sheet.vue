<template>
  <div class="sheet-box">
    <p class="sheet-title">答题卡 <span @click="$emit('close')">返回</span></p>
    <div class="sheet-content">
      <div v-for="(item, index) in list" @click="$emit('sildeTo', index)">
        <div :class="['sheet-btn', item.answer ? 'answer' : '']">
          {{index + 1}}
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'answer-sheet',
    props: {
      list: {
        type: Array
      }
    },
    methods: {

    }
  }
</script>

<style scoped>
  .sheet-box{
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    background: #fff;
    z-index: 50;
    padding: 0.2rem 0;
  }
  .sheet-title{
    line-height: 0.8rem;
    font-size: 0.5rem;
    font-weight: 600;
    color: #0C96FF;
    text-align: center;
    margin-bottom: 0.2rem;
  }
  .sheet-title span{
    float: right;
    font-weight: normal;
    font-size: 0.24rem;
    padding: 0 0.4rem;
  }
  .sheet-content{
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    width: 100%;
  }
  .sheet-content > div{
    width: 20%;
    padding-bottom: 0.2rem;
  }
  .sheet-btn{
    width: 0.8rem;
    height: 0.6rem;
    line-height: 0.6rem;
    text-align: center;
    cursor: pointer;
    background: #ccc;
    border-radius: 3px;
    margin: 0 auto;
    color: #fff;
    font-weight: 600;
  }
  .sheet-btn.answer{
    background: #0C96FF;
  }
</style>
