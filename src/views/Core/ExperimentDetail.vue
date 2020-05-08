<template>
  <div>
    <p v-if="tamplateData.experiment"><span>实验名称：</span>{{tamplateData.experiment.name}}</p>
    <el-divider></el-divider>
    <p v-if="tamplateData.experiment"><span>实验类型：</span>{{tamplateData.experiment.expTemplate.code===1?'动物休克模型教学实验':'其他教学实验'}}</p>
    <p v-if="tamplateData.experiment"><span>指标观测：</span>{{tamplateData.experiment.expTemplate.indicator[0]}}</p>
    <p v-if="tamplateData.experiment"><span>实验药品：</span>{{tamplateData.experiment.expTemplate.medicine[0]}}</p>
    <p v-if="tamplateData.experiment"><span>实验器材：</span>{{tamplateData.experiment.expTemplate.apparatus[0]}}</p>
    <p v-if="tamplateData.experiment"><span>步骤：</span>{{tamplateData.experiment.expTemplate.steps[0]}}</p>
    <p v-if="tamplateData.experiment"><span>实验动物：</span></p>
    <el-table
      v-if="tamplateData.experiment"
      :data="tamplateData.experiment.expTemplate.expAnimalList"
      size="mini"
      border
      style="width: 100%">
      <el-table-column
        prop="name"
        label="动物名称"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="minWeight"
        label="最小体重(g)"
        width="100">
      </el-table-column>
      <el-table-column
        prop="maxWeight"
        label="最大体重(g)"
        width="100">
      </el-table-column>
      <el-table-column
        prop="amount"
        label="数量">
      </el-table-column>
      <el-table-column
        prop="mf"
        label="雌雄">
        <template slot-scope="scope">
          {{scope.row.mf === 0 ? '雌' : '雄'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="monthAge"
        label="月龄">
      </el-table-column>
    </el-table>
    <div style="margin-top:20px;" v-if="tamplateData.expShockResult">
      <p><span>实验过程：</span></p>
      <table border="1">
        <tr>
          <td>放血时间</td>
          <td>{{tamplateData.expShockResult.pj11}}</td>
          <td>放血时间段</td>
          <td>{{dateFormat1(tamplateData.expShockResult.pj11st,tamplateData.expShockResult.pj11et)}}</td>
          <td>得分</td>
          <td>{{tamplateData.expShockResult.pj11Score}}</td>
        </tr>
        <tr>
          <td>map上升至基础值的x</td>
          <td>{{tamplateData.expShockResult.pj12}}</td>
          <td>放血时间段</td>
          <td>{{dateFormat1(tamplateData.expShockResult.pj12st,tamplateData.expShockResult.pj12et)}}</td>
          <td>得分</td>
          <td>{{tamplateData.expShockResult.pj12Score}}</td>
        </tr>
        <tr>
          <td>血压平稳时间</td>
          <td>{{tamplateData.expShockResult.pj13}}</td>
          <td>放血时间段</td>
          <td>{{dateFormat1(tamplateData.expShockResult.pj13st,tamplateData.expShockResult.pj13et)}}</td>
          <td>得分</td>
          <td>{{tamplateData.expShockResult.pj13Score}}</td>

        </tr>
        <tr>
          <td>x分钟内进行wap测定</td>
          <td>{{tamplateData.expShockResult.pj21}}</td>
          <td>放血时间段</td>
          <td>{{dateFormat1(tamplateData.expShockResult.pj21st,tamplateData.expShockResult.pj21et)}}</td>
          <td>得分</td>
          <td>{{tamplateData.expShockResult.pj21Score}}</td>
        </tr>
        <tr>
          <td>map下降</td>
          <td>{{tamplateData.expShockResult.pj22}}</td>
          <td>放血时间段</td>
          <td>{{dateFormat1(tamplateData.expShockResult.pj22st,tamplateData.expShockResult.pj22et)}}</td>
          <td>得分</td>
          <td>{{tamplateData.expShockResult.pj22Score}}</td>

        </tr>
        <tr>
          <td>血压平稳时间</td>
          <td>{{tamplateData.expShockResult.pj23}}</td>
          <td>放血时间段</td>
          <td>{{dateFormat1(tamplateData.expShockResult.pj23st,tamplateData.expShockResult.pj23et)}}</td>
          <td>得分</td>
          <td>{{tamplateData.expShockResult.pj23Score}}</td>
        </tr>
        <tr>
          <td>存活时间</td>
          <td>{{tamplateData.expShockResult.pj31}}</td>
          <td>放血时间段</td>
          <td>{{dateFormat1(tamplateData.expShockResult.pj31st,tamplateData.expShockResult.pj31et)}}</td>
          <td>得分</td>
          <td>{{tamplateData.expShockResult.pj11Score}}</td>

        </tr>
        <tr>
          <td>随机复苏组</td>
          <td>{{tamplateData.expShockResult.fsz === 1 ?'全血组':'Ringers 溶液组'}}</td>
          <td></td>
          <td></td>
          <td>总得分</td>
          <td>{{tamplateData.totalScore}}</td>
        </tr>
      </table>
      <!--          <el-timeline >-->
      <!--            <el-timeline-item :key="1" :timestamp="dateFormat1(tamplateData.expShockResult.pj11st,tamplateData.expShockResult.pj11et)" placement="top">-->
      <!--              <el-card>-->
      <!--                <h4>休克模型制作</h4>-->
      <!--                <p v-if="tamplateData.expShockResult"><span>放血时间：</span>{{formatDataStep(tamplateData.expShockResult.pj11et-tamplateData.expShockResult.pj11st)}}</p>-->
      <!--                <p>得分：{{tamplateData.expShockResult.pj11Score}}</p>-->
      <!--                <p v-if="tamplateData.expShockResult"><span>map上升至基础值的x：</span>{{formatDataStep(tamplateData.expShockResult.pj12et-tamplateData.expShockResult.pj12st)}}</p>-->
      <!--                <p>得分：{{tamplateData.expShockResult.pj12Score}}</p>-->
      <!--                <p v-if="tamplateData.expShockResult"><span>血压平稳时间：</span>{{formatDataStep(tamplateData.expShockResult.pj13et-tamplateData.expShockResult.pj13st)}}</p>-->
      <!--                <p>得分：{{tamplateData.expShockResult.pj13Score}}</p>-->
      <!--              </el-card>-->
      <!--            </el-timeline-item>-->
      <!--            <el-timeline-item :key="2" :timestamp="dateFormat1(tamplateData.expShockResult.pj21st,tamplateData.expShockResult.pj21et)" placement="top">-->
      <!--              <el-card>-->
      <!--                <h4>复苏抢救阶段</h4>-->
      <!--                <p v-if="tamplateData.expShockResult"><span>x分钟内进行wap测定：</span>{{formatDataStep(tamplateData.expShockResult.pj21et-tamplateData.expShockResult.pj21st)}}</p>-->
      <!--                <p>得分：{{tamplateData.expShockResult.pj21Score}}</p>-->
      <!--                <p v-if="tamplateData.expShockResult"><span>map下降时间：</span>{{formatDataStep(tamplateData.expShockResult.pj22et-tamplateData.expShockResult.pj22st)}}</p>-->
      <!--                <p>得分：{{tamplateData.expShockResult.pj22Score}}</p>-->
      <!--                <p v-if="tamplateData.expShockResult"><span>血压平稳时间：</span>{{formatDataStep(tamplateData.expShockResult.pj23et-tamplateData.expShockResult.pj23st)}}</p>-->
      <!--                <p>得分：{{tamplateData.expShockResult.pj23Score}}</p>-->

      <!--              </el-card>-->
      <!--            </el-timeline-item>-->
      <!--            <el-timeline-item :key="3" :timestamp="dateFormat1(tamplateData.expShockResult.pj31st,tamplateData.expShockResult.pj31et)" placement="top">-->
      <!--              <el-card>-->
      <!--                <h4>动物存活时间</h4>-->
      <!--                <p v-if="tamplateData.expShockResult"><span>存活时间：</span>{{formatDataStep(tamplateData.expShockResult.pj31et-tamplateData.expShockResult.pj31st)}}</p>-->
      <!--              </el-card>-->
      <!--            </el-timeline-item>-->
      <!--          </el-timeline>-->
    </div>


  </div>
</template>

<script>
  import { formatDataAll,formatData,formatDataStep } from "@/utils/datetime"
  export default {
    name: "ExperimentDetail",
    props:{
      tamplateData:{
        type:Object,
        default:() =>{}
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
    }

  }
</script>

<style scoped>

</style>
