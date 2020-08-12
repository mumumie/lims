<template>
  <div>
    <mt-header fixed :title="this.$route.query.name" style="z-index: 20;">
      <router-link to="/wap/exam" slot="left">
        <mt-button icon="back">返回</mt-button>
      </router-link>
      <mt-button icon="more" slot="right"  @click="questBankShow = !questBankShow"></mt-button>
    </mt-header>
    <div v-if="practiceData.length>0">
      <swiper :options="swiperOption" ref="mySwiper" class="swiperOption" >
        <!-- slides -->
        <swiper-slide  style="min-height:500px;" v-for="previewData in practiceData" :key="previewData.id">
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
              <div class="blank_option" v-for="(bAns,bI) in previewData.blankAnswer" :key="bI">
                <input type="text" :placeholder="'请填入答案'+(bI+1)" v-model="previewData.bAnswer[bI]" @change="bAnswerChange(previewData)" :disabled="previewData.show">
              </div>
            </div>
            <div class="practice_answer" @click="submitAnswer(previewData)" v-if="!previewData.show && previewData.answer">{{previewData.baseType === 5?'查看答案':'提交答案'}}</div>
            <transition name="el-zoom-in-top">
              <div v-if="previewData.show" class="transition-box">
                <el-divider>答案</el-divider>
                <div class="detail_content">
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
  import {getBean, queryBean, updateBean,updateBatchBean1} from "@/http/base";
  export default {
    name: 'ExamDetail',
    data() {
      return {
        examInfo: {},
        examPaperData: [],
        questList: [],
        formData: {}
      }
    },
    created() {
      this.getExamPaper()
    },
    methods: {
      getExamPaper() {
        const data = {paperId: this.$route.params.id}
        Promise.all([queryBean('Paper', {id: this.$route.params.id}), queryBean('PaperQuest', data)]).then(res => {
          this.examInfo = res[0].bean.data[0];
          let questBankData = res[0].bean.data[0].questBank;
          let selectType = [
            {type:1,arrStr:'singleSelectType'},
            {type:2,arrStr:'multiplySelectType'},
            {type:3,arrStr:'trueFalseType'},
            {type:4,arrStr:'completionType'},
            {type:5,arrStr:'subjectType'},
          ];
          let typeData=[];
          selectType.forEach(item =>{
            if (questBankData[item.arrStr].length > 0) {
              questBankData[item.arrStr].forEach(ite =>{
                typeData.push({type:item.type,value:ite})
              })
            }
          });
          let scoreData=[];
          this.questList = res[1].bean.data.map(item =>{
            item.quest.score = item.score
            return item.quest;
          });
          typeData.forEach((item,index) =>{
            scoreData[index]={};
            scoreData[index].name = item.value;
            scoreData[index].baseType = item.type;
            scoreData[index].count = this.questList.filter(type => type.type === item.value).length;
            scoreData[index].children = this.questList.filter(type => type.type === item.value);
            scoreData[index].totalScore = scoreData[index].children.reduce((prev,next) => (prev + next.score), 0);
          })
          this.examPaperData = scoreData.filter(item => item.count !== 0);

          this.examPaperData.forEach((item) =>{
            if(item.baseType === 2 || item.baseType === 4){
              item.children.map(v => {
                this.$set(this.formData, v.id, [])
              })
            }
          });

          this.examPaperData.map(item => {
            item.children.map((v, i) => {
              const answer = this.examInfo.paperResult.paperResultAnswerList.filter(item => item.questId === v.id)[0]
              if (v.baseType === 1) {
                this.formData[v.id] = answer.optionAnswer && answer.optionAnswer.length > 0 ? answer.optionAnswer[0] : ''
              } else if (v.baseType === 2) {
                this.formData[v.id] = answer.optionAnswer
              } else if (v.baseType === 3) {
                this.formData[v.id] = answer.tfAnswer
              } else if (v.baseType === 4) {
                this.formData[v.id] = answer.blankAnswer
              } else if (v.baseType === 5) {
                this.formData[v.id] = answer.answerContent
                this.$nextTick(()=>{
                  this.$refs.content[i].setHtml(this.formData[v.id]);
                })
              }
            })
          })
        })
      },
    }
  }
</script>

<style scoped>

</style>
