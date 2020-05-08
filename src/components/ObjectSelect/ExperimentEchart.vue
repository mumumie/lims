<template>
  <div :id="id" :class="className" :style="{height:height,width:width}" />
</template>

<script>
  import echarts from 'echarts'
  export default {
    name: "echarts111",
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      id: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '600px'
      },
      height: {
        type: String,
        default: '600px'
      }
    },
    data() {
      return {
        chart: null,
        data:[120, 110, 125, 145, 122, 165, 122, 220, 182, 191, 134, 150,120, 110, 125, 145, 122, 165, 122, 220, 182],
        time:['周一', '周二', '周三', '周四', '周五', '周六', '周日','周一', '周二', '周三', '周四', '周五', '周六', '周日','周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      }
    },
    mounted() {

      this.initChart()
    },
    methods: {
      initChart() {
        let that = this;
        console.log(document.getElementById(this.id));
        this.chart = echarts.init(document.getElementById(this.id))
        let option={
          backgroundColor: '#ffffff',
          title: {
            top: 10,
            text: '实验动态数据',
            textStyle: {
              fontWeight: 'normal',
              fontSize: 14,
              color: '#585858'
            },
            right: '1%'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              lineStyle: {
                color: '#57617B'
              }
            }
          },
          xAxis: [{
            type: 'category',
            data: this.time
          }],
          yAxis: [{
            type: 'value',
            name: 'Map值',
            axisLabel: {
              margin: 10,
              textStyle: {
                fontSize: 14
              }
            },
          }],
          series: [
            {
              name: 'Map值',
              type: 'line',
              symbolSize: 3,
              lineStyle: {
                normal: {
                  width: 1
                }
              },
              data: this.data
            }]
        };
        that.chart.setOption(option);
        console.log(that.chart.getOption());
        setInterval(function(){
          let data = that.data;
          let time =that.time;
          // let time1=time.shift();
          // data.shift();
          data.push(Math.random()*110+100);
          time.push(Math.random()*110+100);
          that.data = data;
          that.time = time;
          that.chart.setOption(option)
        },1000)
      }
    }
  }
</script>

<style scoped>

</style>
