<template>
  <div>
    <mt-header title="考试查询" fixed >
      <router-link to="/wap/my" slot="left">
        <mt-button icon="back">返回</mt-button>
      </router-link>
    </mt-header>
    <div class="practice_list" v-if="practiceData.length> 0">
      <div class="practice_list_box" @click="toExamResult(item)" v-for="item in practiceData" :key="item.id">
        <div class="list_img">
          <img src="../../../../static/images/user.png" alt="">
        </div>
        <div class="list_content">
          <div class="list_content_box">
            <span>{{item.name}}</span>
            <p>{{examStatus(item.status)}}</p>
          </div>
          <span>{{item.date + ' ' + item.startTime + '~' + item.endTime}}</span>
        </div>
        <div class="list_right">
          查看
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>
    </div>
    <div v-else class="noPractice_box">
      <div class="practice_icon">
        <i class="el-icon-s-order"></i>
      </div>
      <p>暂无数据</p>
    </div>
  </div>
</template>

<script>
  import {queryBean} from "../../../http/base";
  import { format,formatData } from "@/utils/datetime"
  export default {
    name:'exam-enquirise',
    data(){
      return{
        practiceData: [],
      }
    },
    created() {
      this.getExam();
    },
    methods: {
      getExam(page = 1) {
        const pageRequest = {
          pageNum: 0,
          pageSize: 0,
          sort: {
            insertDt: -1,
          },
          condition: {
            status: 2
          }
        };
        let loadding = this.$toast({
          message: '数据加载中...',
          iconClass: 'el-icon-loading'
        });
        queryBean("Paper", pageRequest.condition, pageRequest).then(res => {
          this.practiceData = res.bean.data.filter(v => v.paperResult !== null);
        }).catch(() => {}).finally(() => {
          loadding.close();
        })
      },
      toExamResult(row) {
        this.$router.push({ name: 'exam-result', params: { id: row.id }})
      },
      examStatus (val) {
        switch(val) {
          case 0:
            return '未开始';
          case 1:
            return '进行中';
          case 2:
            return '已结束';
          default:
            return '-'
        }
      }
    }
  }
</script>

<style scoped>
  .swiperOption img{
    width:100%;
    height:100%
  }
  .tabbar_box{
    position:fixed;
    bottom:0;
    left:0;
    width:100%;
    display: flex;
    justify-content: space-around;
    height:1.2rem;
    padding:0.1rem 0;
    box-sizing: border-box;
    background: #f9f9f9;
    border-top:1px solid #e0e0e0;
  }
  .tabbar_box div{
    text-align: center;
    cursor:pointer;
    line-height: 0.5rem;
  }
  .tabbar_box p{
    text-align: center;
    font-size:0.5rem;
  }
  .active{
    color:#26a2ff;
  }
  .practice_list_box{
    display: flex;
    padding:0.1rem 0.2rem;
    height:1.6rem;
    box-sizing: border-box;
    border-bottom: 1px solid #e0e0e0;
  }
  .list_img img{
    display: block;
    width:1.4rem;
    height:1.4rem;
  }
  .list_content{
    margin-left:0.2rem;
  }
  .list_content>span{
    color:#999;
    line-height: 0.4rem;
  }
  .list_content_box{
    height:1rem;
  }
  .list_content_box span{
    line-height: 0.5rem;
    font-weight: 700;
  }
  .list_content_box p{
    line-height: 0.5rem;
  }
  .list_right{
    margin-left:auto;
    line-height: 1.4rem;
    font-size: 0.36rem;
    padding-right:0.2rem;
  }
  .noPractice_box p{
    text-align: center;
    line-height: 0.5rem;
  }
  .practice_icon{
    width:1rem;
    height:1rem;
    line-height: 1rem;
    text-align: center;
    font-size: 0.8rem;
    color:#fff;
    background: #0c96ff;
    margin:2rem auto 0;
    border-radius: 50%;
  }
</style>
