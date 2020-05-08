<template>
  <div>
    <!-- echart表格 -->
    <div :id="id" :style="echartStyle"></div>
  </div>
</template>

<script>
  export default {
    props: {
      id:{
        type:String,
        default:'myChart'
      },
      // 样式
      echartStyle: {
        type: Object,
        default(){
          return {height: '400px'}
        }
      },
      // 标题文本
      titleText: {
        type: String,
        default: ''
      },
      // 提示框键名
      tooltipFormatter: {
        type: String,
        default: '数量'
      },
      // 扇形区域名称
      opinion: {
        type: Array,
        default(){
          return []
        }
      },
      // 提示框标题
      seriesName: {
        type: String,
        default: '数量/比例'
      },
      // 扇形区域数据
      opinionData: {
        type: Array,
        default(){
          return []
        }
      },
    },
    data(){
      return {
        //
      }
    },
    mounted(){
      this.$nextTick(function() {
        this.drawPie(this.id)
      })
    },
    methods: {
      // 监听扇形图点击
      eConsole(param) {
        // 向父组件传值
        this.$emit("currentEchartData",param.name);
      },
      // 绘制饼状图
      drawPie(id){
        this.charts = this.$echarts.init(document.getElementById(id));
        this.charts.on("click", this.eConsole);
        this.charts.setOption({
          title: {
            text: this.titleText, // 标题文本
            left: 'center'
          },
          tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>  {b}  :{c} ({d}%)"
          },
          legend: {
            bottom: 20,
            left: 'center',
            data: this.opinion // 扇形区域名称
          },
          series : [
            {
              name:this.seriesName,  // 提示框标题
              type: 'pie',
              radius : '65%',
              center: ['50%', '50%'],
              selectedMode: 'single',
              data:this.opinionData, // 扇形区域数据
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        })
      }
    }
  }
</script>

<style scoped>
  #myChart{
    width: 100%;
  }
</style>
