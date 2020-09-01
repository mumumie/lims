<template>
  <div class="container">
    <mt-header fixed title="自测"></mt-header>
    <div style="padding-bottom: 1.2rem;">
      <div class="form_list"  @click="questBankShow=true">
        <div class="form_list_caption">
          <i class="el-icon-s-open"></i>
          <span>{{formData.questBankName}}</span>
        </div>
        <div class="form_list_more">
          <span class="el-icon-arrow-right"></span>
        </div>
      </div>
      <div class="form_list"  @click="chapterShow=true">
        <div class="form_list_caption">
          <i class="el-icon-s-open"></i>
          <span>{{formData.chapter}}</span>
        </div>
        <div class="form_list_more">
          <span class="el-icon-arrow-right"></span>
        </div>
      </div>
      <div class="form_list"  @click="questTypeShow=true">
        <div class="form_list_caption">
          <i class="el-icon-s-open"></i>
          <span>{{formData.questType}}</span>
        </div>
        <div class="form_list_more">
          <span class="el-icon-arrow-right"></span>
        </div>
      </div>
      <div class="form_list difficulty">
        <div class="form_list_caption">
          <i class="el-icon-s-open"></i>
          <span>难度</span>
        </div>
        <div class="form_list_more">
          <div v-for="(item,index) in difficultyData" :key="index" class="difficulty_box" :class="{active:formData.difficulty === index}" @click="difficultySelect(index)">{{item}}</div>
        </div>
      </div>
      <div class="form_list difficulty">
        <div class="form_list_caption">
          <i class="el-icon-s-open"></i>
          <span>数量</span>
        </div>
        <div class="form_list_more">
          <div v-for="(item,index) in countData" :key="index" class="difficulty_box" :class="{active:formData.count === index}" @click="countSelect(index)">{{item}}</div>
        </div>
      </div>
      <div class="form_list difficulty">
        <div class="form_list_caption">
          <i class="el-icon-s-open"></i>
          <span>时长</span>
        </div>
        <div class="form_list_more form_list_time">
          <input type="text" v-model.number="formData.timeLimit" placeholder="请输入时间"><span>分钟</span>
        </div>
      </div>
      <div class="form_list difficulty">
        <div class="form_list_caption">
          <i class="el-icon-s-open"></i>
          <span>名称</span>
        </div>
        <div class="form_list_more form_list_time">
          <input type="text" v-model.number="formData.name" placeholder="请输入自测名称">
        </div>
      </div>
      <div class="form_list_btn">
        <div @click="submitPractice">开始自测</div>
      </div>
    </div>
    <!--    选择练习-->
    <div class="transition_box" :class="{active:questBankShow}">
      <mt-header title="选择练习" style="z-index: 30;">
        <mt-button slot="left" icon="back" @click="questBankShow = false">返回</mt-button>
      </mt-header>
      <div class="practice_list" @click="practiceSelect(item)" v-for="item in practiceData" :key="item.id">
        <div>
          <p>{{item.name}}</p>
          <span>{{dateFormat(item.insertDt)}}</span>
        </div>
        <div class="practice_list_more" :class="{active:item.isSelect}">
          <span class="el-icon-check"></span>
        </div>
      </div>
    </div>
    <!--    选择章节-->
    <div class="transition_box" :class="{active:chapterShow}">
      <mt-header title="选择章节" style="z-index: 30;">
        <mt-button slot="left" icon="back" @click="chapterShow = false">返回</mt-button>
      </mt-header>
      <div v-if="chapterData.length > 0">
        <div class="chapter_list" @click="chapterSelect(item)" v-for="(item,index) in chapterData" :key="index">
          <div class="chapter_list_btn" :class="{active:item.isSelect}">{{item.value}}</div>
        </div>
      </div>
      <div v-else class="no_message">
        <div ><i class="el-icon-shopping-cart-1"></i></div>
        <p>你还没有选择练习</p>
<!--        <span>选择练习或者自测还得等待数据哦</span>-->
      </div>

    </div>
    <!--    选择章节-->
    <div class="transition_box" :class="{active:questTypeShow}">
      <mt-header title="选择题型" style="z-index: 30;">
        <mt-button slot="left" icon="back" @click="questTypeShow = false">返回</mt-button>
      </mt-header>
      <div v-if="questTypeData.length > 0">
        <div class="chapter_list" @click="questTypeSelect(item)" v-for="(item,index) in questTypeData" :key="index">
          <div class="chapter_list_btn" :class="{active:item.isSelect}">{{item.value}}</div>
        </div>
      </div>
      <div v-else class="no_message">
        <div ><i class="el-icon-shopping-cart-1"></i></div>
        <p>你还没有选择练习</p>
        <!--        <span>选择练习或者自测还得等待数据哦</span>-->
      </div>

    </div>
    <!--    底部tabbar-->
    <div class="tabbar_box">
      <div @click="toPath('home')">
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
      <div @click="toPath('practice')" class="active">
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
  import {addBean, getBean, queryBean} from "../../../http/base";
  import { formatDataCode,formatData } from "@/utils/datetime"
  export default {
    name: "Practice",
    data(){
      return{
        practiceData: [],
        formData:{
          questBankName:'练习',
          questBankId:'',
          chapter:'章节',
          questType:'题型',
          difficulty:0,
          count:0,
          timeLimit:10,
          name:''
        },
        questBankShow:false,
        chapterShow:false,
        questTypeShow:false,
        questBankData:{},
        chapterData:[],
        questTypeData:[],
        difficultyData:['随机','难','中','易'],
        countData:['10','20','30','40','50'],
      }
    },
    methods:{
      getPractice(){
        queryBean("Practice",{openType : 1}).then(res => {
          this.practiceData  = res.bean.data.map(v =>{
            v.isSelect = false;
            return v;
          });
        })
      },
      toPath(name){
        this.$router.push({path:'/wap/'+name})
      },
      practiceSelect(row){
        if(!row.isSelect){
          this.practiceData.map(v =>{
            v.isSelect = false;
          })
          row.isSelect = true;
          this.questBankData = row;
          this.chapterData = row.chapter.map(v =>{
            return {
              value:v,
              isSelect:false
            }
          });
          this.questTypeData = [];
          row.questType.forEach(v =>{
            if(v === '单选题' || v === '多选题' || v === '判断题' || v === '填空题'){
              this.questTypeData.push({value:v, isSelect:false});
            }
          });
          this.formData.questBankName = row.name;
          this.formData.questBankId = row.questBankId;
          this.formData.chapter = '章节';
          this.formData.questType = '题型';
          this.formData.name = row.name + '_' + this.dateCodeFormat(new Date());
          this.questBankShow = false;
        }
      },
      chapterSelect(row){
        row.isSelect = !row.isSelect;
        let chapter = [];
        this.chapterData.forEach(v =>{
          if (v.isSelect === true) {
            chapter.push(v.value)
          }
        });
        if (chapter.length > 0) {
          this.formData.chapter = chapter.toString();
        }else{
          this.formData.chapter = '章节';
        }

      },
      questTypeSelect(row){
        row.isSelect = !row.isSelect;
        let questType = [];
        this.questTypeData.forEach(v =>{
          if (v.isSelect === true) {
            questType.push(v.value)
          }
        });
        if (questType.length > 0) {
          this.formData.questType = questType.toString();
        }else{
          this.formData.questType = '题型';
        }

      },
      difficultySelect(index){
        this.$set(this.formData,'difficulty',index)
      },
      countSelect(index){
        this.$set(this.formData,'count',index)
      },
      // 时间格式化
      dateFormat: function (time){
        return formatData(time)
      },
      // 时间随机码
      dateCodeFormat: function (time){
        return formatDataCode(time)
      },
      submitPractice(){
        if(this.formData.questBankName === '练习'){
          this.$toast({
            message: '请选择练习',
            iconClass: 'el-icon-document-delete'
          });
          return false;
        }
        if(this.formData.chapter === '章节'){
          this.$toast({
            message: '请选择章节',
            iconClass: 'el-icon-document-delete'
          });
          return false;
        }
        if(this.formData.questType === '题型'){
          this.$toast({
            message: '请选择题型',
            iconClass: 'el-icon-document-delete'
          });
          return false;
        }
        if(this.formData.timeLimit === ''){
          this.$toast({
            message: '时长不能为空',
            iconClass: 'el-icon-document-delete'
          });
          return false;
        }
        if(this.formData.name === ''){
          this.$toast({
            message: '练习名称不能为空',
            iconClass: 'el-icon-document-delete'
          });
          return false;
        }
        let chapter = this.formData.chapter.split(',');
        let questType = this.formData.questType.split(',');
        let postData = {
          questBankId:this.formData.questBankId,
          name:this.formData.name,
          chapter:chapter,
          questType:questType,
          timeLimit:this.formData.timeLimit,
          difficulty:this.formData.difficulty,
          openType : 2,
          id:0
        };
        let condition = {
          questBankId:this.formData.questBankId,
          chapter$in:chapter,
          type$in:questType,
          status:1
        }
        queryBean("Quest",condition,{pageNum:0,pageSize:1}).then( data => {
          this.$messagebox.confirm(`该练习包含题目${data.bean.total}道，是否创建？`).then(action => {
            this.$api.practice.save(postData).then(res =>{
              if (res.retCode === 0) {
                this.$toast({
                  message: '开始测试',
                  iconClass: 'el-icon-success'
                });
                let row = res.bean;
                let questType = res.bean.questType.toString();
                let chapter = res.bean.chapter.toString();
                this.$router.push({path:"/wap/selfPractice",query:{questType:questType,chapter:chapter,questBankId:row.questBankId,name:row.name,id:row.id}})
              }
            })
          }).catch(err =>{})
        })
      }
    },
    created() {
      this.getPractice();
    }
  }
</script>

<style scoped>
  .container{
    height:100%;
    position:relative;
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
  .tabbar_box .active{
    color:#26a2ff;
  }
  .transition_box{
    width:100%;
    height:100%;
    background: #fff;
    position:absolute;
    top:0;
    left:100%;
    transition: left linear 0.3s;
  }
  .transition_box.active{
    left:0;
    opacity: 1;
  }
  .practice_list{
    display: flex;
    height:1rem;
    border-bottom:1px solid #e0e0e0;
    padding:0.15rem 0.2rem;
    box-sizing: border-box;
  }
  .practice_list p{
    font-size: 0.32rem;
    line-height: 0.4rem;
    height:0.4rem;
  }
  .practice_list span{
    line-height: 0.3rem;
    height:0.3rem;
  }
  .practice_list_more{
    margin-left:auto;
    font-size: 0.5rem;
    color:#0c96ff;
    display: none;
  }
  .practice_list_more.active{
    display: block;
  }
  .chapter_list{
    padding:0.2rem 0.2rem 0;
  }
  .chapter_list_btn{
    border: 1px solid #e0e0e0;
    border-radius: 2px;
    height:0.6rem;
    line-height: 0.6rem;
    text-align: center;
    font-size: 0.32rem;
    cursor: pointer;
  }
  .chapter_list_btn.active{
    background: #0c96ff;
    color:#fff;
  }
  .no_message{
    padding-top:2rem;
    text-align: center;
  }
  .no_message div{
    font-size: 1rem;
    color:#0c96ff;
  }
  .difficulty_box{
    font-size: 0.28rem;
    height:0.6rem;
    padding:0 0.2rem;
    line-height: 0.6rem;
    border:1px solid #e0e0e0;
    margin-left:0.1rem;
    cursor: pointer;
  }
  .difficulty_box.active{
    border-color:#0c96ff;
    background: #0c96ff;
    color:#fff;
  }
  .form_list{
    display: flex;
    padding:0 0.2rem;
    height:1rem;
    line-height: 1rem;
    border-bottom: 1px solid #e0e0e0;
    font-size: 0.32rem;
    cursor: pointer;
  }
  .form_list:hover{
    background: #f9f9f9;
  }
  .form_list_caption{
    width:7rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .difficulty .form_list_caption{
    width:auto;
  }
  .form_list_more{
    margin-left:auto;
  }
  .difficulty .form_list_more{
    display: flex;
    align-items: center;
  }
  .form_list_time{
    font-size: 0.28rem;
  }
  .form_list_time input{
    border:0;
    text-align: right;
    padding-right:0.2rem;
    font-weight: bold;
  }
  .form_list_time input:focus{
    outline: 0;
  }
  .form_list_btn{
    padding:0.2rem;
  }
  .form_list_btn div{
    height:0.8rem;
    line-height: 0.8rem;
    font-size: 0.36rem;
    text-align: center;
    border-radius: 3px;
    background: #0c96ff;
    color:#fff;
    cursor: pointer;
  }
</style>
