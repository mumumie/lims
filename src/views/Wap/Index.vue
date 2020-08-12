<template>
  <div>
    <mt-header title="考试系统首页" fixed ></mt-header>
    <swiper :options="swiperOption" ref="mySwiper" class="swiperOption">
      <!-- slides -->
      <swiper-slide  style="height:5rem;">
          <img src="../../../static/images/banner1.png" alt="" >
      </swiper-slide>
      <swiper-slide  style="height:5rem;">
        <img src="../../../static/images/banner2.png" alt="" >
      </swiper-slide>
      <swiper-slide  style="height:5rem;">
        <img src="../../../static/images/banner3.png" alt="" >
      </swiper-slide>
      <!-- Optional controls -->
      <div class="swiper-pagination"  slot="pagination"></div>
    </swiper>
    <div class="practice_list">
      <mt-navbar v-model="selected">
        <mt-tab-item id="1">考试</mt-tab-item>
        <mt-tab-item id="2">练习</mt-tab-item>
      </mt-navbar>

      <!-- tab-container -->
      <mt-tab-container v-model="selected">
        <mt-tab-container-item id="1">
          <div class="practice_list_box" @click="clickExam(item)" v-for="item in examData" :key="item.id">
            <div class="list_img">
              <img src="../../../static/images/user.png" alt="">
            </div>
            <div class="list_content">
              <div class="list_content_box">
                <span>{{item.name}}</span>
                <p>{{examStatus(item.status)}}</p>
              </div>
              <span>{{item.date + ' ' + item.startTime + '~' + item.endTime}}</span>
            </div>
            <div class="list_right">
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
          <div style="padding:0.2rem;">
            <mt-button type="default" size="small" plain style="width:100%;" @click="getExam(++examPages)" v-if="examData.length < examTotal">查看更多>></mt-button>
          </div>
        </mt-tab-container-item>
        <mt-tab-container-item id="2">
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
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
          <div style="padding:0.2rem;">
            <mt-button type="default" size="small" plain style="width:100%;" @click="getPractice(++practicePages)" v-if="practiceData.length < practiceTotal">查看更多>></mt-button>
          </div>
        </mt-tab-container-item>
      </mt-tab-container>

    </div>
<!--    底部tabbar-->
    <div class="tabbar_box">
      <div class="active">
        <p>
          <i class="el-icon-s-shop"></i>
        </p>
        首页
      </div>
      <div @click="toPath('exam')">
        <p>
          <i class="el-icon-s-opportunity"></i>
        </p>
        考试
      </div>
      <div @click="toPath('practice')">
        <p>
          <i class="el-icon-s-claim"></i>
        </p>
        自测
      </div>
      <div @click="toPath('my')">
        <p>
          <i class="el-icon-s-custom"></i>
        </p>
        我的
      </div>
    </div>
  </div>
</template>

<script>
  import {queryBean} from "../../http/base";
  import * as router from "@babel/runtime-corejs2/helpers/AsyncGenerator";
  import 'swiper/dist/css/swiper.css'
  import { swiper, swiperSlide } from 'vue-awesome-swiper'
  import { format,formatData } from "@/utils/datetime"
  export default {
    name:'Home',
    components: {
      swiper,
      swiperSlide
    },
    data(){
      return{
        practiceData: [],
        examData: [],
        practiceTotal: 0,
        examTotal: 0,
        swiperOption: {
          loop:true,
          autoplay: {
            delay: 3000,
            stopOnLastSlide: false,
            disableOnInteraction: true,
          },
          pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true,
          },
        },
        selected: '1',
        examPages: 1,
        practicePages: 1,
      }
    },
    created() {
      this.getExam();
      this.getPractice();
    },
    methods: {
      getPractice(page = 1){
        const pageRequest = {
          pageNum: page,
          pageSize: 10,
          sort: {
            insertDt: -1,
          },
          condition: {
            openType : 1
          }
        };
        queryBean("Practice", pageRequest.condition, pageRequest).then(res => {
          this.practiceData = this.practiceData.concat(res.bean.data);
          this.practiceTotal = res.bean.total
        })
      },
      getExam(page = 1) {
        const pageRequest = {
          pageNum: page,
          pageSize: 10,
          sort: {
            insertDt: -1,
          },
          condition: {
            status$ne: -1
          }
        };
        queryBean("Paper", pageRequest.condition, pageRequest).then(res => {
          this.examData = this.examData.concat(res.bean.data);
          this.examTotal = res.bean.total
        })
      },
      clickExam(row) {
        if (row.status === 1) {
          this.$router.push({name: 'exam-detail', params: {id: row.id}})
        } else {
          this.$toast({
            message: '考试' + this.examStatus(row.status),
            iconClass: 'el-icon-circle-close'
          });
        }
      },
      clickPractice(row) {
        let questType = row.questType.toString();
        let chapter = row.chapter.toString();
        this.$router.push({path:"/wap/doPractice",query:{questType:questType,chapter:chapter,questBankId:row.questBankId,name:row.name,id:row.id}})
      },
      toPath(name){
        this.$router.push({path:'/wap/'+name})
      },
      // 时间格式化
      dateFormat: function (time){
        return formatData(time)
      },
      examStatus(val) {
        switch(val) {
          case 0:
            return '未开始'
          case 1:
            return '进行中'
          case 2:
            return '已结束'
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
    font-size: 0.5rem;
  }
  .mint-navbar{
    padding:0 0.2rem;
  }
  .mint-tab-container{
    margin-top:0.1rem;
  }
</style>
