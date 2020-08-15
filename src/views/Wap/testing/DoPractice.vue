<template>
  <div>
    <mt-header fixed :title="this.$route.query.name" style="z-index: 20;">
      <router-link to="/wap/home" slot="left">
        <mt-button icon="back">返回</mt-button>
      </router-link>
      <mt-button icon="more" slot="right"  @click="questBankShow = !questBankShow"></mt-button>
    </mt-header>
    <div v-if="practiceData.length>0">
      <swiper :options="swiperOption" ref="mySwiper" class="swiperOption" >
        <!-- slides -->
        <swiper-slide  style="min-height:450px;" v-for="previewData in practiceData" :key="previewData.id">
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
    <div v-else class="noPractice_box" v-loading="practiceLoading">
      <div class="practice_icon">
        <i class="el-icon-s-order"></i>
      </div>
      <p>暂无练习</p>
    </div>
    <div class="transition_box" :class="{active:questBankShow}">
      <div class="transition_select"  :class="{active:questBankShow}">
        <div class="transition_title"><i class="el-icon-s-data"></i>章节</div>
        <div class="transition_select_box" :class="{active:item.isSelect}" v-for="item in questType" :key="item.value" @click="selectHandle(item)">{{item.value}}</div>
        <div class="transition_title"><i class="el-icon-s-check"></i>题型</div>
        <div class="transition_select_box" :class="{active:item.isSelect}" v-for="item in chapter" :key="item.value" @click="selectHandle(item)">{{item.value}}</div>
        <div class="transition_select_btn" @click="submitSelectHandle">确定</div>
      </div>
    </div>
    <!--    底部tabbar-->
    <div class="tabbar_box">
      <div @click="toPath(1)" :class="{active:pathIndex === 1}">
        <p>
          <i class="el-icon-document"></i>
        </p>
        未练
      </div>
      <div @click="toPath(2)" :class="{active:pathIndex === 2}">
        <p>
          <i class="el-icon-document-copy"></i>
        </p>
        已练
      </div>
      <div @click="toPath(3)" :class="{active:pathIndex === 3}">
        <p>
          <i class="el-icon-document-delete"></i>
        </p>
        错误
      </div>
    </div>
  </div>

</template>

<script>
  import 'swiper/dist/css/swiper.css'
  import { getBean, queryBean, addBean, updateBean } from "@/http/base";
  import { swiper, swiperSlide } from 'vue-awesome-swiper'
  export default {
    components: {
      swiper,
      swiperSlide
    },
    data() {
      return {
        practiceData: [],
        swiperOption: {
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
        pathIndex:1,
        questBankShow:false,
        questType:[],
        chapter:[],
        practiceLoading: false
      }
    },
    methods: {
      getPractice(){
        this.practiceLoading = true
        let postData = {
          userid:sessionStorage.getItem('userid'),
          practiceId:this.$route.query.id
        }
        queryBean('PracticeResult',postData).then(res =>{
          if(res.retCode === 0){
            let idList = res.bean.data.map(item =>{
              return item.questId;
            })
            let chapter = this.$route.query.chapter.split(',')
            let questType = this.$route.query.questType.split(',')
            let condition = {
              questBankId:this.$route.query.questBankId,
              chapter$in:chapter,
              type$in:questType,
              id$nin:idList,
              status:1
            }
            queryBean("Quest",condition).then(result => {
              this.practiceData  = result.bean.data.map(item =>{
                item.show = false;
                item.oAnswer = [];
                item.option.forEach((v,i) =>{
                  this.$set(item.oAnswer,i,false);
                })
                item.bAnswer=item.blankAnswer.map(v =>{
                  return ''
                });
                if(item.baseType === 5){
                  item.answer = true;
                }else{
                  item.answer = false;
                }
                return item;
              })
              this.practiceLoading = false
            }).catch(() =>{
              this.practiceLoading = false
            })
          }

        })

      },
      getSeletPractice(questType, chapter){
        let postData = {
          userid:sessionStorage.getItem('userid'),
          practiceId:this.$route.query.id,
        }
        queryBean('PracticeResult', postData).then(res =>{
          if(res.retCode === 0){
            let idList = res.bean.data.map(item =>{
              return item.questId;
            })
            let condition = {
              questBankId:this.$route.query.questBankId,
              chapter$in:chapter,
              type$in:questType,
              id$nin:idList,
              status:1
            }
            queryBean("Quest",condition).then(result => {
              this.practiceData  = result.bean.data.map(item =>{
                item.show = false;
                item.oAnswer = [];
                item.option.forEach((v,i) =>{
                  this.$set(item.oAnswer,i,false);
                })
                item.bAnswer = item.blankAnswer.map(v =>{
                  return ''
                });
                if(item.baseType === 5){
                  item.answer = true;
                }else{
                  item.answer = false;
                }
                return item;
              })
            })
          }
        })
      },
      getAlreadyPractice(){
        let postData={
          userid:sessionStorage.getItem('userid'),
          practiceId:this.$route.query.id
        }
        queryBean('PracticeResult',postData).then(res =>{
          if(res.retCode === 0){
            this.practiceData  = res.bean.data.map(item =>{
              let obj = Object.assign({},item.quest)
              obj.show = true;
              obj.oAnswer = []
              if(item.quest.baseType === 1 || item.quest.baseType === 2){
                obj.oAnswer = item.quest.option.map(v =>{
                  return false;
                });
                item.optionAnswer.forEach(v =>{
                  obj.oAnswer[v] = true;
                })
              }
              obj.tAnswer=item.tfAnswer;
              obj.bAnswer=item.blankAnswer;
              obj.answer = false;
              return obj;
            })

          }

        })

      },
      getFalsePractice(){
        let postData={
          userid:sessionStorage.getItem('userid'),
          practiceId:this.$route.query.id,
          status:2
        }
        queryBean('PracticeResult',postData).then(res =>{
          if(res.retCode === 0){
            this.practiceData  = res.bean.data.map(item =>{
              let obj = item.quest
              obj.show = false;
              obj.oAnswer = item.quest.option.map(v =>{
                return false;
              });
              obj.tAnswer=[];
              obj.bAnswer=[];
              obj.answer = false;
              obj.practiceResultId = item.id;
              return obj;
            })
          }

        })

      },
      toPath(index){
        this.pathIndex = index;
        this.questType.map(v =>{
          v.isSelect = false;
        })
        this.chapter.map(v =>{
          v.isSelect = false;
        })
        if(index === 1){
          this.getPractice();
        }else if(index === 2){
          this.getAlreadyPractice();
        }else if(index === 3){
          this.getFalsePractice();
        }
      },
      optionHandle(row,index){
        if(!row.show){
          if(row.baseType === 1){
            row.oAnswer = row.oAnswer.map((v,i) =>{
              if(i === index){
                v = true;
              }else{
                v = false;
              }
              return v
            });
            row.answer = true;
          }else if(row.baseType === 2){
            let flag = row.oAnswer[index];
            this.$set(row.oAnswer,index,!flag)
            row.answer = true;
          }else if(row.baseType === 3){
            row.tAnswer = index;
            row.answer = true;
          }
        }
      },
      bAnswerChange(row){
        if(!row.show){
          if(row.bAnswer.every(item => item !== '')){
            row.answer = true;
          }else{
            row.answer = false;
          }
        }
      },
      checkResult(str) {
        if(str){
          let str1 = str.toLowerCase();
          let str2 = str1.replace(/[\“\”\’\‘\'\"\\\/\s+\b\f\n\r\t]/g, '');
          let str3 = str2.replace(/<[^>]+>/g,"");
          return str3
        }else{
          return str
        }
      },
      answerChecked(row){
        if(row.baseType === 1){
          if (row.oAnswer[row.optionAnswer.toString()]) {
            return true;
          }else{
            return false;
          }
        }else if(row.baseType === 2){
          let oAnswer = [];
          row.oAnswer.forEach((v,i) =>{
            if(v){
              oAnswer.push(i)
            }
          })
          if(oAnswer.toString() === row.optionAnswer.toString()) {
            return true;
          }else{
            return false;
          }
        }else if(row.baseType === 3){
          if (row.tAnswer.toString() === row.tfAnswer.toString()) {
            return true;
          }else{
            return false;
          }
        }else if(row.baseType === 4){
          if(row.bAnswer.every((item,index) =>{return this.checkResult(item) === this.checkResult(row.blankAnswer[index])})){
            return true;
          }else{
            return false;
          }
        }else if(row.baseType === 5){
          return true;
        }
      },
      singleOption(row,index){
        if(row.oAnswer.toString() === index.toString()){
          return true;
        }else{
          return false;
        }
      },
      submitAnswer(row){

        let doc = {
          practiceId: this.$route.query.id,
          questId:row.id
        };
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

        }
        if (this.answerChecked(row)) {
          doc.status = 1;
        }else{
          doc.status = 2;
        }
        if(this.pathIndex === 1){
          addBean('PracticeResult',doc).then(res =>{
            if(res.retCode === 0){
              row.show = true;
            }
          })
        }else if(this.pathIndex === 3){
          updateBean('PracticeResult',row.practiceResultId,doc).then(res =>{
            if(res.retCode === 0){
              row.show = true;
            }
          })
        }

      },
      selectHandle(row){
        let isSelect = row.isSelect;
        row.isSelect = !isSelect;
      },
      submitSelectHandle(){
        if(this.pathIndex === 1){
          let questType = [];
          let chapter = [];
          this.questType.forEach(v =>{
            if (v.isSelect === true) {
              questType.push(v.value)
            }
          })
          if (questType.length === 0) {
            questType = this.$route.query.questType.split(',')
          }
          this.chapter.forEach(v =>{
            if (v.isSelect === true) {
              chapter.push(v.value)
            }
          })
          if (chapter.length === 0) {
            chapter = this.$route.query.chapter.split(',')
          }
          this.getSeletPractice(questType,chapter)
        }
        this.questBankShow = false;
      },
    },
    created() {
      this.getPractice();
      this.questType = this.$route.query.questType.split(',').map(v =>{
        return {
          value:v,
          isSelect:false
        }
      })
      this.chapter = this.$route.query.chapter.split(',').map(v =>{
        return {
          value:v,
          isSelect:false
        }
      })
    }
  }
</script>

<style scoped>
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
    z-index: 5;
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
  .transition_box{
    width:100%;
    height:100%;
    background: rgba(0,0,0,0.2);
    position:absolute;
    top:0;
    left:0;
    box-sizing: border-box;
    z-index: 10;
    display: none;
  }
  .transition_box.active{
   display: block;
  }
  .transition_select{
    position:absolute;
    top:0;
    left:0;
    background: #fff;
    width:100%;
    padding:40px 0.2rem 0.1rem;
    box-sizing: border-box;
    transform: translate3d(0,-100%,0);
    transition: transform 0.5s;
  }
  .transition_select.active{
    transform: translate3d(0,0,0);
  }
  .transition_title{
    height:0.8rem;
    line-height: 0.8rem;
    font-size: 0.4rem;
    color:#333;
  }
  .transition_select_box{
    height:0.6rem;
    line-height: 0.6rem;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
    text-align: center;
    font-size: 0.28rem;
    box-sizing: border-box;
    cursor: pointer;
    margin-bottom:0.1rem;
  }
  .transition_select_box.active{
    color:#fff;
    background:#0c96ff;
    border-color:#0c96ff;
  }
  .transition_select_btn{
    line-height: 0.8rem;
    height:0.8rem;
    text-align: center;
    border-radius: 3px;
    background: #0c96ff;
    color:#fff;
    font-size: 0.4rem;
    font-weight: bold;
    cursor: pointer;
    margin-top:0.3rem;
  }
</style>
