<template>
  <div>
    <mt-header title="自测历史" fixed >
      <router-link to="/wap/my" slot="left">
        <mt-button icon="back">返回</mt-button>
      </router-link>
    </mt-header>
    <div class="practice_list">
      <div class="practice_list_box" @click="clickPractice(item)" v-for="item in practiceData" :key="item.id">
        <div class="list_img">
          <img src="../../../static/images/user.png" alt="">
        </div>
        <div class="list_content">
          <div class="list_content_box">
            <span>{{item.name}}</span>
            <p>{{item.questType.toString()}}</p>
          </div>
          <span>{{dateFormat(item.insertDt)}}</span>
        </div>
        <div class="list_right">
          {{item.status === 0 ? '继续' : '查看'}}<i class="el-icon-arrow-right"></i>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import {queryBean} from "../../http/base";
  import { format,formatData } from "@/utils/datetime"
  export default {
    name:'SelfHistory',
    data(){
      return{
        practiceData: [],
      }
    },
    methods: {
      getPractice(){
        let postData = {
          openType : 2,
          userid: sessionStorage.getItem('userid')
        }
        queryBean("Practice",postData).then(res => {
          this.practiceData  =res.bean.data
        })
      },
      clickPractice(row) {
        let questType = row.questType.toString();
        let chapter = row.chapter.toString();
        if(row.status === 0){
          this.$router.push({path:"/wap/selfPractice",query:{questType:questType,chapter:chapter,questBankId:row.questBankId,name:row.name,id:row.id}})
        }else{
          this.$router.push({path:"/wap/selfPracticeDetail",query:{questType:questType,chapter:chapter,questBankId:row.questBankId,name:row.name,id:row.id}})
        }

      },
      // 时间格式化
      dateFormat: function (time){
        return formatData(time)
      },
    },
    created() {
      this.getPractice();
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
</style>
