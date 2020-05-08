<template>
  <div>
    <m-echarts
      v-if="finishData.length>0"
      :titleText="finishChart.titleText"
      :opinion="finishChart.opinion"
      :opinionData="finishData"
      :id="'zz'"
      v-on:currentEchartData="getEchartData"
    ></m-echarts>
    <el-divider></el-divider>
    <m-echarts
      v-if="rightData.length>0"
      :titleText="rightChart.titleText"
      :opinion="rightChart.opinion"
      :opinionData="rightData"
      :id="'cc'"
      v-on:currentEchartData="getEchartData"
    ></m-echarts>
  </div>
</template>

<script>
    import {post} from "../../http/base";
    import mEcharts from "./EchartsPie";
    export default {
      components: {mEcharts},
      props:['studentId', 'practiceId'],
      data(){
        return {
          finishData: [],
          rightData: [],
          finishChart: {
            titleText: '完成情况',
            opinion: ['已完成', '未完成']
          },
          rightChart: {
            titleText: '对错情况',

            opinion: ['答对', '答错']
          }
        }
      },
      methods: {
        getEchartData(val){
          console.log(val);
        },
      },
      created() {
        post("studentPracticeStat", {
          studentId: this.studentId,
          practiceId: this.practiceId
        }).then(res => {
          this.$nextTick(() =>{
            this.finishData = [...res.result.finishList] ;
            this.rightData = [...res.result.rightList];
          })

        })
      }
    }
</script>

<style scoped>

</style>
