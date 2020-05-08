<template>
  <div class="experiment_detail" ref="print">
    <div v-if="tamplateData.id" >
      <div class="experiment_dict">
        <div class="experiment_title">实验名称 :</div>
        <div>{{tamplateData.experiment.name}}</div>
        <el-button size="mini" style="margin-left:30px;" @click="getMockExpRecord" v-if="tamplateData.status < 2">发送模拟数据</el-button>
      </div>
      <div class="experiment_dict">
        <div class="experiment_title">实验结果ID :</div>
        <div>{{tamplateData.id}}</div>
      </div>
      <div class="experiment_dict">
        <div class="experiment_title">状态 :</div>
        <div>{{statusFilter(tamplateData.status) }}</div>
        <el-button size="mini" style="margin-left:30px;" v-if="tamplateData.status < 2" @click="getFinish">结束</el-button>
      </div>
      <div class="experiment_dict">
        <div class="experiment_title">实验类型 :</div>
        <div>{{tamplateData.publicType===1?'教学实验':'开放实验'}}</div>
      </div>
      <ExperimentAppear
        :name="item"
        v-for="item in experimentNav"
        :list="tamlateInfo"
        :key="item.name">
      </ExperimentAppear>
      <div>
        <p>实验结果 <span class="download_red" @click="handleDownload(putData)">【打印实验结果】</span></p>
        <el-table
          :data="putData"
          size="mini"
          border
          style="width: 100%">
          <el-table-column
            v-for="item in putDataNav"
            :key="item.name"
            :prop="item.name"
            :label="item.zhName"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column label="总分">
            <template slot-scope="scope">
              <span>{{tamplateData.totalScore}}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div id="mychart" class="mychart" style="height:300px;width:600px" ></div>
  </div>
</template>

<script>
  import '../../utils/databus_js/dist/pako.min.js';
  import '../../utils/databus_js/dist/bytebuffer.min.js';
  import '../../utils/databus_js/protobuf/bundle.js';
  import '../../utils/databus_js/jbuscore.js';
  import jbus from '../../utils/databus_js/index.js';
  import { formatDataAll,formatData,formatDataStep } from "@/utils/datetime";
  import {getBean,mockExpRecord,updateBean} from "@/http/base";
  import ExperimentAppear from "@/components/DataManager/ExperimentAppear"
  import echarts from 'echarts'
  export default {
    name: "ExperimentDetail",
    components:{
      ExperimentAppear
    },
    data(){
      return {
        tamplateData:{},
        tamlateInfo:{},
        putData:{},
        putDataNav:[],
        experimentNav:[],
        chart: null,
        optionTime:[],
        optionMap:[],
      }
    },
    methods:{
      // 实验时间格式化
      dateFormat1: function (et,st){
        if(et && st){
          return formatDataAll(et)+'-'+formatDataAll(st)
        }else if(et){
          return formatDataAll(et)
        }else{
          return 0
        }
      },
      //时间差 时分秒
      formatDataStep:function(date){
        return formatDataStep(date)
      },
      getResult(){
        getBean('ExperimentResult',this.$route.query.id).then(res =>{
          this.tamplateData = res.bean;
          let expTypeName = res.bean.experiment.expTypeName.replace(res.bean.experiment.expTypeName[0],res.bean.experiment.expTypeName[0].toLowerCase())
          this.putData = [res.bean[expTypeName+'Result']];
          if(this.putData.length>0){
            this.putData[0].totalScore = res.bean.totalScore;
          }

        })
      },
      getTamplateData:function(){
        getBean('ExperimentResult',this.$route.query.id).then(res =>{
          this.tamplateData = res.bean;
          let expTypeName = res.bean.experiment.expTypeName.replace(res.bean.experiment.expTypeName[0],res.bean.experiment.expTypeName[0].toLowerCase())
          this.$api.data.findTableInfo(res.bean.experiment.expTypeName + 'Result')
            .then(res =>{
              let arr=[];
              res.bean.fieldProps.map(item =>{
                if (item.name !== 'id'  && item.name !== 'insertDt' && item.name !== 'updateDt' && item.name !== 'status') {
                  arr.push(item);
                }
              });
              this.putDataNav = arr
            })
          this.$api.data.findTableInfo(res.bean.experiment.expTypeName)
            .then(res =>{
              let arr=[];
              res.bean.fieldProps.map(item =>{
                if (item.name !== 'id'  && item.name !== 'insertDt' && item.name !== 'updateDt' && item.name !== 'status') {
                  arr.push(item);
                }
              });
              this.experimentNav = arr
            })
          this.tamlateInfo = res.bean.experiment[expTypeName];
          this.putData = [res.bean[expTypeName+'Result']];
          if(this.putData[0] && this.putData.length>0){
            this.putData[0].totalScore = res.bean.totalScore;
          }
        })
      },
      open: function() {
        let that = this;
        //开启心跳
        jbus.setHeartBeatIntervalSecond(5);
        //设定订阅和接收处理
        let topicList = ["Exp.ExperimentRecordToWeb","Exp.ExperimentRefresh"];
        jbus.setPublish((data) => {
          // if (data instanceof proto.Exp.ExpResultRsp) {
          //   // console.log('接受结果是' + data.toString());
          //   // console.log(data.getExpshockresultid());
          //   if(data.getExpshockresultid() === this.tamplateData.expShockResultId){
          //     this.getTamplateData();
          //   }
          // }
          if (data instanceof proto.Exp.ExperimentRecordToWeb) {
            let dataInfo = data.toString().split(',');
            if(dataInfo[0] === this.$route.query.id){
              that.optionTime.push(dataInfo[1]);
              that.optionMap.push(dataInfo[2]);
              this.initChart();
              let mapData = {
                time: dataInfo[1],
                map:dataInfo[2]
              };
              console.log(mapData);
            }
          }
          if (data instanceof proto.Exp.ExperimentRefresh) {
            // console.log('接受结果是ExperimentRecord ' + data.toString());
            let dataInfo = data.toString().split(',');
            if(dataInfo[0] === this.$route.query.id){
              console.log(data.toString());
              this.getResult();
            }
          }
        });
        //开始连接
        //https://bihaiwei.net/ws
        //ws://139.224.234.131:2222
        // jbus.open('ws://139.224.234.131:2222', topicList).then(function (json) {
        jbus.open('wss://bihaiwei.net/ws', topicList).then((json) =>{
          console.log('open ' + json);

        }).catch(function (err) {
          that.$message(JSON.stringify(err));
          console.log(JSON.stringify(err));
          jbus.close();
        });
      },
      // 导出excel数据
      handleDownload(data1) {
        console.log(data1);
        if (data1.length > 0) {
          this.$confirm('确定将此数据导出Excel文件?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            import('@/vendor/Export2Excel').then(excel => {
              const tHeader = this.putDataNav.map(item =>{
                return item.zhName;
              })// 表头
              tHeader.push('总分');
              const filterVal =  this.putDataNav.map(item =>{
                return item.name;
              }) // 需要导出的项目
              filterVal.push('totalScore');
              const list = data1 ;// 所有列表数据
              const data = this.formatJson(filterVal, list);
              excel.export_json_to_excel({
                header: tHeader,
                data,
                autoWidth: this.autoWidth,
                filename: '实验报告' // 文件名称
              })
              this.downloadLoading = false
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消导出'
            })
          })
        } else {
          this.$message('暂无数据可导出')
        }
      },
      // 过滤需要的数据
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      },
      //过滤状态字段
      statusFilter:function(status){
        if(status===0){
          return '未开始';
        }else if(status === 1){
          return '进行中';
        }else if(status === 2){
          return '已完成';
        }else{
          return '已作废';
        }
      },
      getMockExpRecord(){
        let postData={
          experimentResultId:this.$route.query.id
        };
        mockExpRecord(postData).then(res =>{
          console.log(res)
        })
      },
      getFinish(){
        let postData={
          id:this.$route.query.id,
          status:2
        };
        updateBean('ExperimentResult',postData.id,postData).then(res =>{
          if (res.retCode === 0) {
            this.getResult();
          }
        })
      },
      initChart() {
        this.chart = echarts.init(document.getElementById('mychart'));
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
            x:'center',
            y:'top',
          },
          toolbox: {
            show: true,
            feature: {
              saveAsImage: {
                show:true,
                // excludeComponents :['toolbox'],
                // pixelRatio: 2
              }
            }
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
            data: this.optionTime
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
              data: this.optionMap
            }
          ]
        };
        this.chart.setOption(option);
        // setInterval(function(){
        //   let data = that.data;
        //   let time =that.time;
        //   // let time1=time.shift();
        //   // data.shift();
        //   data.push(Math.random()*110+100);
        //   time.push(Math.random()*110+100);
        //   that.data = data;
        //   that.time = time;
        //   that.chart.setOption(option)
        // },1000)
      },
      printHandle(){
        let that = this;
        this.$print(that.$refs.print,{'no-print':'.download_red'})
      },
    },
    created(){
      this.getTamplateData();
      this.open();
    },
    mounted() {
      this.initChart()
    },
  }
</script>

<style scoped>

  .experiment_detail{
    padding:0 20px 20px;
    line-height: 30px;
  }
  .experiment_detail p{
    margin:0;
  }
  .experiment_dict{
    display: flex;
  }
  .experiment_title{
    padding-right:20px;
    font-weight: 600;
  }
  .download_red{
    color:#ba1c23;
    cursor: pointer;
  }
</style>
