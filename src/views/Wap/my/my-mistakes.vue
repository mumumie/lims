<template>
  <div>
    <mt-header fixed title="我的错题库" style="z-index: 20;">
      <router-link to="/wap/my" slot="left">
        <mt-button icon="back">返回</mt-button>
      </router-link>
      <mt-button slot="right" @click="changeBatch">换一批</mt-button>
    </mt-header>
    <div v-if="questList.length > 0">
      <swiper :options="swiperOption" ref="mySwiper" class="swiperOption">
        <!-- slides -->
        <swiper-slide  style="min-height: calc(100vh - 40px - 2rem);" v-for="previewData in questList" :key="previewData.id">
          <div class="practice_box">
            <div class="practice_box_title">
              <div class="practice_type">
                <div>{{previewData.type}}</div>
              </div>
              <div v-html="previewData.content" class="practice_title"></div>
            </div>
            <div v-if="previewData.baseType === 1 || previewData.baseType === 2">
              <div v-for="(item,index) in previewData.option" class="detail_option" @click="optionHandle(previewData,index)">
                <div class="radio_option">
                  <span :class="{active:previewData.oAnswer[index]}">{{AnswerType[index]}}</span>
                </div>
                <div v-html="item"></div>
              </div>
            </div>
            <div v-if="previewData.baseType === 3">
              <div class="detail_option" @click="optionHandle(previewData,true)">
                <div class="radio_option tf">
                  <span :class="{active:previewData.tAnswer === true}">对</span>
                </div>
              </div>
              <div class="detail_option" @click="optionHandle(previewData,false)">
                <div class="radio_option tf">
                  <span :class="{active:previewData.tAnswer === false}">错</span>
                </div>
              </div>
            </div>
            <div v-if="previewData.baseType === 4">
              <div class="blank_option" v-for="(bAns, bI) in previewData.blankAnswer" :key="bI">
                <el-input type="text" :placeholder="'请填入答案'+(bI+1)" v-model="previewData.bAnswer[bI]" @input="bAnswerChange(previewData)" :disabled="previewData.show"/>
              </div>
            </div>
            <div v-if="previewData.baseType === 5">
              <el-input type="textarea" :rows="5" placeholder="请填入答案" v-model="previewData.cAnswer" @input="cAnswerChange(previewData)" :disabled="previewData.show"/>
            </div>
            <div class="practice_answer" @click="submitAnswer(previewData)" v-if="!previewData.show && previewData.answer">提交答案</div>
            <transition name="el-zoom-in-top">
              <div v-if="previewData.show" class="transition-box">
                <el-divider>答案</el-divider>
                <div class="detail_content">
                  <mt-button size="small" v-if="answerChecked(previewData) && !previewData.remove" type="danger" style="float:right;" @click="removeMistakes(previewData)">移出错题库</mt-button>
                  <mt-button size="small" v-if="previewData.remove" type="primary" style="float:right;" disabled>已移出</mt-button>
                  <div v-if="previewData.baseType === 1 || previewData.baseType === 2">
                    <i class="el-icon-check green" v-if="answerChecked(previewData)"></i>
                    <i class="el-icon-close red" v-else></i>
                    <i>正确答案：</i>
                    <i v-for="(optAsw,index) in previewData.optionAnswer" :key="index">{{AnswerType[optAsw] + ((previewData.optionAnswer.length-1)===index?'':'，') }}</i>
                  </div>
                  <div v-if="previewData.baseType === 3">
                    <i class="el-icon-check green" v-if="answerChecked(previewData)"></i>
                    <i class="el-icon-close red" v-else></i>
                    <i>{{'正确答案：' + (previewData.tfAnswer===true?'对': previewData.tfAnswer === false ? '错' : '-')}}</i>
                  </div>
                  <div v-if="previewData.baseType === 4">
                    <i class="el-icon-check green" v-if="answerChecked(previewData)"></i>
                    <i class="el-icon-close red" v-else></i>
                    <i>正确答案</i>
                    <div v-for="(item,index) in previewData.blankAnswer" style="display: flex;">
                      <div>{{'填空' + (index+1) + '：'}}</div>
                      <div v-html="item"></div>
                    </div>
                  </div>
                  <div v-if="previewData.baseType === 5" v-html="previewData.subjectAnswer"></div>
                </div>
                <el-divider>解析</el-divider>
                <div class="detail_content" v-if="previewData.remark" v-html="previewData.remark"></div>
                <div v-else>无</div>
              </div>
            </transition>
          </div>
        </swiper-slide>
        <!-- Optional controls -->
        <div class="swiper-pagination"  slot="pagination"></div>
      </swiper>
    </div>
  </div>
</template>

<script>
  import 'swiper/dist/css/swiper.css';
  import { queryBean, deleteBean } from "@/http/base";
  import { swiper, swiperSlide } from 'vue-awesome-swiper';
  export default {
    name: "my-mistakes",
    components: {
      swiper,
      swiperSlide
    },
    data() {
      return {
        swiperOption: {
          direction: 'horizontal',
          pagination: {
            el: '.swiper-pagination',
            type: 'fraction'
          },
          on:{
            slideChangeTransitionEnd: function(swiper){
            },
          },
        },
        AnswerType:['A','B','C','D','E','F'],
        type:['','单选题','多选题','判断题','填空题','问答题'],
        difficulty:['','简单','中等','困难'],
        questList: [],
        currentPage: 1,
        totalNum: 0
      }
    },
    computed: {
      swiper() {
        return this.$refs.mySwiper.swiper
      }
    },
    created() {
      this.getMistakes()
    },
    methods: {
      // 换一批
      changeBatch() {
        Math.ceil(this.totalNum / 20) > this.currentPage ? ++this.currentPage : this.currentPage = 1;
        this.getMistakes(this.currentPage)
        this.swiper.slideTo(0, 300, false);
      },
      // 初始化试题
      initExam(item, init = false) {
        item.quest.mistakesId = item.id;
        item.quest.remove = false;
        if (item.quest.baseType === 1 || item.quest.baseType === 2) {
          item.quest.oAnswer = []
          if (item.optionAnswer.length > 0 && init) {
            item.quest.option.forEach((v, i) => {
              this.$set(item.quest.oAnswer, i, item.optionAnswer.includes(i));
            })
            item.quest.show = true;
            item.quest.answer = true;
          } else {
            item.quest.option.forEach((v, i) =>{
              this.$set(item.quest.oAnswer, i, false);
            })
            item.quest.show = false;
            item.quest.answer = false;
          }
        } else if (item.quest.baseType === 3) {
          if (String(item.tfAnswer) && init) {
            item.quest.tfAnswer = item.tfAnswer
            item.quest.show = true;
            item.quest.answer = true;
          } else {
            item.quest.tfAnswer = '';
            item.quest.show = false;
            item.quest.answer = false;
          }
        } else if (item.quest.baseType === 4) {
          if (item.blankAnswer.length > 0 && init) {
            item.quest.bAnswer = item.blankAnswer;
            item.quest.show = true;
            item.quest.answer = true;
          } else {
            item.quest.bAnswer = item.quest.blankAnswer.map(v => {
              return ''
            });
            item.quest.show = false;
            item.quest.answer = false;
          }
        } else if (item.quest.baseType === 5) {
          if (item.answerContent && init) {
            item.quest.cAnswer = item.answerContent;
            item.quest.show = true;
            item.quest.answer = true;
          } else {
            item.quest.cAnswer = '';
            item.quest.show = false;
            item.quest.answer = false;
          }
        }
        return item.quest;
      },
      // 获取试卷信息
      getMistakes(page = 1) {
        const pageRequest = {
          pageNum: page,
          pageSize: 20,
          sort: {
            insertDt: -1,
          },
          condition: {
          }
        };
        let loadding = this.$toast({
          message: '数据加载中...',
          iconClass: 'el-icon-loading'
        });
        queryBean('QuestFailedBank', pageRequest.condition, pageRequest).then(res => {
          this.totalNum = res.bean.total;
          this.questList = res.bean.data.map(item => {
            return this.initExam(item)
          });
        }).finally(() => {
          loadding.close();
        })
      },
      optionHandle(row, index) {
        if (!row.show) {
          if (row.baseType === 1) {
            row.oAnswer = row.oAnswer.map((v, i) => {
              if (i === index) {
                v = true;
              } else {
                v = false;
              }
              return v
            });
            row.answer = true;
          }else if (row.baseType === 2) {
            let flag = row.oAnswer[index];
            this.$set(row.oAnswer,index,!flag)
            row.answer = true;
          }else if (row.baseType === 3) {
            row.tAnswer = index;
            row.answer = true;
          }
        }
      },
      bAnswerChange(row) {
        if(!row.show){
          if(row.bAnswer.every(item => item !== '')){
            row.answer = true;
          }else{
            row.answer = false;
          }
        }
      },
      cAnswerChange(row) {
        if (!row.show) {
          if (row.cAnswer) {
            row.answer = true;
          } else {
            row.answer = false;
          }
        }
      },
      answerChecked(row){
        if(row.baseType === 1){
          if (row.oAnswer[row.optionAnswer.toString()]) {
            return true;
          }else{
            return false;
          }
        } else if(row.baseType === 2){
          let oAnswer = [];
          row.oAnswer.forEach((v,i) =>{
            if(v){
              oAnswer.push(i)
            }
          })
          if (oAnswer.toString() === row.optionAnswer.toString()) {
            return true;
          } else {
            return false;
          }
        } else if (row.baseType === 3) {
          if (row.tAnswer.toString() === row.tfAnswer.toString()) {
            return true;
          } else {
            return false;
          }
        } else if (row.baseType === 4) {
          if (row.bAnswer.every((item,index) =>{return this.checkResult(item) === this.checkResult(row.blankAnswer[index])})){
            return true;
          } else {
            return false;
          }
        }else if(row.baseType === 5){
          return false;
        }
      },
      checkResult(str){
        if(str){
          let str1 = str.toLowerCase();
          let str2 = str1.replace(/[\“\”\’\‘\'\"\\\/\s+\b\f\n\r\t]/g, '');
          let str3 = str2.replace(/<[^>]+>/g,"");
          return str3
        }else{
          return str
        }
      },
      // 提交答案
      submitAnswer(row) {
        row.show = true;
      },
      // 移出错题库
      removeMistakes(row) {
        deleteBean('QuestFailedBank', row.mistakesId).then(res => {
          this.totalNum--;
          row.remove = true;
          this.$toast({
            message: '已移出！',
            iconClass: 'el-icon-circle-check',
            duration: 2000
          });
        })
      }
    }
  }
</script>

<style scoped>
  .practice_box{
    padding:0.2rem;
  }
  .practice_type{
    flex:none;
  }
  .practice_type div{
    border:1px solid #26a2ff;
    color:#26a2ff;
    padding:0 0.1rem;
    line-height: 0.6rem;
  }
  .practice_box_title{
    display: flex;
    line-height: 0.6rem;
    margin-bottom: 0.1rem;
  }
  .practice_title{
    font-size: 0.4rem;
    line-height: 0.6rem;
    margin-left:0.2rem;
  }
  .detail_content{
    padding:0.2rem;
    font-size: 0.32rem;
  }
  .red{
    font-weight: bold;
    font-size: 0.5rem;
    color:#f90208;
  }
  .green{
    font-weight: bold;
    font-size: 0.5rem;
    color: #44FF04;
  }
  .detail_option{
    font-size: 0.4rem;
    padding:0.1rem 0.2rem;
    line-height: 0.5rem;
    display: flex;
    cursor: pointer;
  }
  .radio_option{
    margin-right:0.1rem;
  }
  .radio_option span{
    display: block;
    width:0.5rem;
    height:0.5rem;
    border-radius: 50%;
    border:1px solid #e0e0e0;
    text-align: center;
  }
  .radio_option.tf span{
    font-size: 0.3rem;
  }
  .radio_option span.active{
    color:#fff;
    background: #26a2ff;
    border:1px solid #26a2ff;
  }
  .practice_answer{
    color:#f90208;
    border:1px solid #f90208;
    border-radius: 2px;
    line-height: 0.6rem;
    width:2.4rem;
    text-align: center;
    margin:0.4rem auto 0;
    font-size: 0.32rem;
    cursor: pointer;
  }
  .blank_option{
    margin-top:0.2rem;
    line-height: 1rem;
    height:1rem;
  }
  .blank_option input{
    font-size: 0.4rem;
    background: #f9f9f9;
    display: block;
    width:100%;
    height:1rem;
    border:0;
    padding:0 0.2rem;
    box-sizing: border-box;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
