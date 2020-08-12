<template>
  <div class="container">
    <mt-header fixed title="自测详情" style="z-index: 20;">
      <router-link to="/wap/selfHistory" slot="left">
        <mt-button icon="back">返回</mt-button>
      </router-link>
    </mt-header>
    <div class="answer_count" >
      <div :class="{active:answerIndex === 0}" @click="selectHandle(0)">
        <span>{{questCount.all}}</span>
        <p>全部试题</p>
      </div>
      <div :class="{active:answerIndex === 1}" @click="selectHandle(1)">
        <span>{{questCount.true}}</span>
        <p>正确试题</p>
      </div>
      <div :class="{active:answerIndex === 2}" @click="selectHandle(2)">
        <span>{{questCount.false}}</span>
        <p>错误试题</p>
      </div>
    </div>
    <div v-if="practiceData.length>0">
      <div class="practice_box" v-for="previewData in practiceData" :key="previewData.id">
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
    </div>
    <div v-else class="noPractice_box">
      <div class="practice_icon">
        <i class="el-icon-s-order"></i>
      </div>
      <p>暂无练习</p>
    </div>
  </div>

</template>

<script>
  import {getBean,queryBean,addBean,addBatchBean,updateBean} from "../../../http/base";
  export default {
    data() {
      return {
        practiceData: [],
        AnswerType:['A','B','C','D','E','F'],
        type:['','单选题','多选题','判断题','填空题','问答题'],
        difficulty:['','简单','中等','困难'],
        answerIndex:0,
        questBankShow:false,
        questType:[],
        chapter:[],
        questCount:{
          all:0,
          true:0,
          false:0,
        },
      }
    },
    methods: {
      getAlreadyPractice(answerIndex){
        let postData={
          userid:sessionStorage.getItem('userid'),
          practiceId:this.$route.query.id
        }
        if(answerIndex){
          postData.status = answerIndex;
        }
        queryBean('PracticeResult',postData).then(res =>{
          if(res.retCode === 0){
            if(!answerIndex){
              this.questCount ={
                'all':res.bean.total,
                'true':res.bean.data.filter(v => v.status === 1).length,
                'false':res.bean.data.filter(v => v.status === 2).length,
              }
            }
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
            this.$set(row,'tAnswer',index)
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
          if (row.tAnswer !== null && row.tAnswer.toString() === row.tfAnswer.toString()) {
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
        return doc;

      },
      submitAllAnswer(){
        this.$messagebox.confirm('确定执行此操作?').then(action => {
          let docs = this.practiceData.map(v =>{
            return this.submitAnswer(v);
          })
          console.log(docs);
          addBatchBean('PracticeResult',docs).then(res =>{
            if (res.retCode === 0) {
              let practiceId = this.$route.query.id;
              updateBean('Practice',practiceId,{status:1}).then(res =>{
                if (res.retCode === 0) {
                  this.$toast({
                    message: '提交成功',
                    iconClass: 'el-icon-success'
                  });
                  this.$router.push('/wap/selfPractice');
                }
              })
            }
          })
        }).catch(err =>{

        });
      },
      selectHandle(index){
        this.answerIndex = index;
        this.getAlreadyPractice(index);
      }

    },
    created() {
      this.getAlreadyPractice(0);

    }
  }
</script>

<style scoped>
  .container{
    padding-top:100px;
  }
  .answer_count{
    position:fixed;
    top:40px;
    left:0;
    width:100%;
    display: flex;
    justify-content: space-between;
    height:70px;
    box-sizing: border-box;
    background: #fff;
    border-top:1px solid #e0e0e0;
    z-index: 20;
    border-bottom: 1px solid #e0e0e0;
  }
  .answer_count div{
    flex:1;
    text-align: center;
    cursor:pointer;
    background: #f9f9f9;
  }
  .answer_count span{
    font-size:0.36rem;
    line-height: 40px;
    font-weight: bold;
  }
  .answer_count p{
    line-height: 20px;
    text-align: center;
    font-size:0.28rem;
  }
  .answer_count .active{
    color:#fff;
    background: #0c96ff;
  }
  .practice_box{
    padding:0.2rem;
    border:1px solid #e0e0e0;
    border-radius: 5px;
    margin-top:0.3rem;
    background: #f9f9f9;
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
