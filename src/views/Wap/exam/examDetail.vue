<template>
  <div>
    <mt-header fixed :title="examInfo.name" style="z-index: 20;">
      <mt-button slot="left" @click="submitExamPaper">提交</mt-button>
      <mt-button slot="right" @click="isSheet = !isSheet">答题卡</mt-button>
    </mt-header>
    <transition name="fade">
      <answerSheet
        v-if="isSheet"
        :list="questList"
        @close="isSheet = false"
        @sildeTo="sildeTo"
      />
    </transition>
    <div class="time-box">考试剩余时间： <span>{{ time }}</span></div>
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
                <el-input type="text" :placeholder="'请填入答案'+(bI+1)" v-model="previewData.bAnswer[bI]" @input="bAnswerChange(previewData)" />
              </div>
            </div>
            <div v-if="previewData.baseType === 5">
              <el-input type="textarea" :rows="5" placeholder="请填入答案" v-model="previewData.cAnswer" @input="cAnswerChange(previewData)"/>
            </div>
<!--            <div class="practice_answer" @click="submitAnswer(previewData)" v-if="!previewData.show && previewData.answer">提交答案</div>-->
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
  import { addBean, queryBean, updateBean, updateBatchBean1 } from "@/http/base";
  import { swiper, swiperSlide } from 'vue-awesome-swiper';
  import { formatDataStep } from "@/utils/datetime"
  export default {
    name: 'ExamDetail',
    components: {
      swiper,
      swiperSlide,
      answerSheet: () => import('./component/answer-sheet')
    },
    data() {
      return {
        examInfo: {},
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
        paperResultAnswerList: [],
        timer: null,
        time: '',
        isSheet: false,
        save: () => {},
        finish: false   // 是否可离开此页面
      }
    },
    watch: {
      questList: {
        handler() {
          this.save()
        },
        deep: true
      }
    },
    computed: {
      swiper() {
        return this.$refs.mySwiper.swiper
      }
    },
    created() {
      this.getExamPaper()
    },
    mounted() {
      document.oncontextmenu=new Function("event.returnValue=false");
      document.onselectstart=new Function("event.returnValue=false");
      this.save = this.debounce(this.saveExamPaper, 10000);
      this.timer = setInterval(() => {
        let date = new Date().getTime()
        let datetime = this.examInfo.validTime[1] - date
        this.time = formatDataStep(datetime)
        if(datetime <= 0){
          clearInterval(this.timer);
          this.timer = null;
          this.submitExamPaper();
          this.finish = true;
          this.$messagebox.alert('考试已结束！', '提示').then(action  => {
            this.$router.push({path:'/wap/exam'});
          })
        }
      }, 1000)
    },
    methods: {
      // 防抖
      debounce(func, wait=5000) {
        let timeout = null;
        return function(){
          let th = this;
          if(timeout !== null) clearTimeout(timeout)
          timeout = setTimeout(()=>{
            func.call(th)
          }, wait)
        }
      },
      // 滑动到指定试题
      sildeTo(val) {
        this.swiper.slideTo(val, 100, false);
        this.isSheet = false;
      },
      // 初始化试题
      initExam(item) {
        item.quest.score = item.score
        const row = this.paperResultAnswerList.find(v => v.questId === item.quest.id)
        if (item.quest.baseType === 1 || item.quest.baseType === 2) {
          item.quest.oAnswer = []
          if (row.optionAnswer.length > 0) {
            item.quest.option.forEach((v, i) => {
              this.$set(item.quest.oAnswer, i, row.optionAnswer.includes(i));
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
          if (String(row.tfAnswer)) {
            item.quest.tfAnswer = row.tfAnswer
            item.quest.show = true;
            item.quest.answer = true;
          } else {
            item.quest.tfAnswer = '';
            item.quest.show = false;
            item.quest.answer = false;
          }
        } else if (item.quest.baseType === 4) {
          if (row.blankAnswer.length > 0) {
            item.quest.bAnswer = row.blankAnswer;
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
          if (row.answerContent) {
            item.quest.cAnswer = row.answerContent;
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
      getExamPaper() {
        const data = {paperId: this.$route.params.id}
        Promise.all([queryBean('Paper', {id: this.$route.params.id}), queryBean('PaperQuest', data)]).then(res => {
          this.examInfo = res[0].bean.data[0];
          this.paperResultAnswerList = res[0].bean.data[0].paperResult.paperResultAnswerList;
          this.questList = res[1].bean.data.map(item => {
            return this.initExam(item)
          });
        })
      },
      optionHandle(row, index) {
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
      },
      // 保存试题结果
      savePaperResult(row) {
        const doc = {};
        if(row.baseType === 1 || row.baseType === 2){
          let optionAnswer = [];
          row.oAnswer.forEach((v,i) =>{
            if (v) {
              optionAnswer.push(i)
            }
          })
          doc.optionAnswer = optionAnswer
        }else if(row.baseType === 3){
          doc.tfAnswer = row.tAnswer
        }else if(row.baseType === 4){
          doc.blankAnswer = row.bAnswer
        }else if(row.baseType === 5){
          doc.answerContent = row.cAnswer
        }
        if (this.answerChecked(row)) {
          doc.score = row.score
        } else {
          doc.score = 0
        }
        const paperResultAnswerList = this.paperResultAnswerList;
        Object.assign(paperResultAnswerList.filter(v => v.questId === row.id)[0], doc)
        const objScore = paperResultAnswerList.reduce((prev, curr) => prev + curr.score, 0)
        return {
          paperResultAnswerList: paperResultAnswerList,
          objScore: objScore
        };
      },
      // 提交答案
      submitAnswer(row) {
        updateBean('PaperResult', this.examInfo.paperResult.id, this.savePaperResult(row)).then(res => {
          if(res.retCode === 0){
            row.show = true;
          }
        }).catch(err =>{
          this.$toast({
            message: '提交失败！',
            iconClass: 'el-icon-circle-close'
          });
        })
      },
      saveExamPaper() {
        let params = {};
        this.questList.forEach((v, i) => {
          if (v.answer) {
            params = this.savePaperResult(v)
          }
        });
        updateBean('PaperResult', this.examInfo.paperResult.id, Object.assign(params)).then(res => {

        }).catch(err =>{
          console.log(err);
        })
      },
      // 提交试卷
      submitExamPaper() {
        let params = {};
        const empty = [];
        this.questList.forEach((v, i) => {
          if (v.answer) {
            params = this.savePaperResult(v)
          } else {
            empty.push(`第${i+1}题`)
          }
        });
        const msg = empty.length > 0 ? `${empty.toString()}还未作答，是否确认提交试卷？` : `是否确认提交试卷？`;
        this.$messagebox.confirm(msg).then(action => {
          updateBean('PaperResult', this.examInfo.paperResult.id, Object.assign(params, {status: 1})).then(res => {
            this.$toast({
              message: '提交试卷成功！',
              iconClass: 'el-icon-circle-check'
            });
            this.finish = true;
            this.$router.push('/wap/exam')
          }).catch(err =>{
            console.log(err);
            this.$toast({
              message: '提交失败！',
              iconClass: 'el-icon-circle-close'
            });
          })
        }).catch(() => {})
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
    },
    beforeRouteLeave(to, form, next) {
      if(this.finish === true){
        next()
      }else{
        this.$messagebox.confirm('试卷未提交，确定离开此页面').then(() => {
          this.saveExamPaper()
          this.$toast({
            message: '已保存试卷答案！',
            iconClass: 'el-icon-circle-check'
          });
          next()
        }).catch(() => {

        })
      }
    }
  }
</script>

<style scoped>
  .time-box{
    line-height: 0.8rem;
    text-align: center;
    font-size: 0.4rem;
  }
  .time-box > span {
    font-weight: 600;
    color: #f00;
  }
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
