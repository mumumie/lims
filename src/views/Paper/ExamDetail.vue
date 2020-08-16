<template>
  <div class="exampaper">
    <el-form ref="formData" :model="formData" :rules="rules">
      <div v-if="examInfo.name" style="position:fixed;top:120px;right:50px;">离考试结束：{{time}}</div>
      <h2 v-if="examInfo.name" style="text-align: center;font-size: 25px;">{{examInfo.name}}</h2>
      <div v-for="(item,index) in examPaperData" :key="index">
        <h3>{{AnswerIndex[index] + '、'+item.name + '(共' + item.count + '题，共' + item.totalScore+ '分)'}}</h3>
        <div  v-for="(v, i) in item.children" :key="ind">
          <div class="paper_title">
            <div>{{i + 1 +'、'}}</div>
            <div class="paper_content" v-html="v.content"></div>
          </div>
          <div class="queryContent">
            <el-radio-group v-model="formData[v.id]" v-if="item.baseType === 1">
              <el-radio :label="iopt" v-for="(opt,iopt) in v.option" :key="iopt"><span>{{AnswerType[iopt] + '、 '}}</span><div v-html="opt" style="display: inline-block;"></div></el-radio>
            </el-radio-group>
            <el-checkbox-group v-model="formData[v.id]" v-if="item.baseType === 2">
              <el-checkbox :label="iopt" :key="iopt" v-for="(opt, iopt) in v.option" ><span>{{AnswerType[iopt] + '、 '}}</span><div v-html="opt" style="display: inline-block;"></div></el-checkbox>
            </el-checkbox-group>
            <el-radio-group v-model="formData[v.id]" v-if="item.baseType === 3">
              <el-radio label="1" >正确</el-radio>
              <el-radio label="0" >错误</el-radio>
            </el-radio-group>
            <div v-if="item.baseType === 4">
              <el-input
                v-model="formData[v.id][iopts]"
                :placeholder="'填空' + (iopts + 1)" v-for="(opt, iopts) in v.blankAnswer"
                size="mini"
                style="width:25%;"
                :key="iopts">
              </el-input>
            </div>
            <div v-if="item.baseType === 5">
              <FroalaEditor :ids="v.id" placeholder="请输入内容..." ref="content" @on-change="changeContent"></FroalaEditor>
            </div>
          </div>
        </div>
      </div>
      <el-button :size="size" @click="submitForm">提交</el-button>
      <el-button :size="size" @click="leaveForm">保存</el-button>
    </el-form>
<!--    <div v-show="!finish">-->
<!--      提交成功！！-->
<!--      <router-link :to="{path:'/paper/exam'}">返回试卷管理</router-link>-->
<!--    </div>-->
  </div>
</template>

<script>
  import FroalaEditor from "@/components/wangEditor/froalaEditor";
  import {getBean, queryBean, updateBean,updateBatchBean1} from "@/http/base";
  import { formatDataStep } from "@/utils/datetime"
  export default {
    name: "CurriculumDetail",
    components:{
      FroalaEditor
    },
    data(){
      return{
        formData:{},
        examInfo:{},
        examPaperData:[],
        AnswerType:['A','B','C','D','E','F','G','H'],
        AnswerIndex:['一','二','三','四','五','六','七','八'],
        type:['','单选题','多选题','判断题','填空题','问答题'],
        difficulty:['','易','较易','中','较难','难'],
        rules:[],
        finish:true,
        questList: [],
        save: () => {},
        time: '',
        timer: null
      }
    },
    watch: {
      formData: {
        handler(val) {
          this.save()
        },
        deep: true
      }
    },
    mounted() {
      this.getExamPaper({paperId: this.$route.query.id});
      this.save = this.debounce(this.saveForm, 10000);
      this.timer = setInterval(() => {
        const date = new Date().getTime()
        const datetime = this.examInfo.validTime[1] - date
        this.time = formatDataStep(datetime)
        if(datetime < 0){
          clearInterval(this.timer);
          this.saveForm();
          this.$alert('考试已结束!', '提示', {
            confirmButtonText: '确定',
            type: 'warning',
            callback: (action) => {
              this.finish=false;
              this.$router.push({path:'/paper/exam'});
              // let val=this.$store.state.tab.mainTabs.splice(-1);
              // this.$store.commit('updateMainTabsActiveName', val);
              next()
            }
          })
          // this.$confirm('考试已结束!', '提示', {
          //   confirmButtonText: '确定',
          //   type: 'warning'
          // }).then(() => {
          //   this.finish=false;
          //   this.$router.push({path:'/paper/exam'});
          // }).catch(() => {
          //   this.finish=false;
          //   this.$router.push({path:'/paper/exam'});
          // });
        }
      }, 1000)
    },
    destroyed() {
      clearInterval(this.timer);
    },
    methods:{
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
      changeContent: function (html) {
        this.formData[html.ids] = html.content;
        this.save()
      },
      saveForm(){
        let params = JSON.parse(JSON.stringify(this.formData));
        let NotAnswer=[];
        let arrValues = [];
        for(let key in params){
          if(params[key] == null || params[key].length === 0){
            NotAnswer.push(key);
          }
          const quest = this.questList.filter(v => v.id === key)[0]
          if (quest.baseType === 1) {
            let score = 0
            if (params[key] && quest.optionAnswer.toString() === params[key].toString()) {
              score = quest.score;
            }
            arrValues.push({
              questId: key,
              optionAnswer: [params[key]],
              score: score
            })
          }
          if (quest.baseType === 2) {
            let score = 0
            if (params[key][0] && quest.optionAnswer.sort().toString() === params[key].sort().toString()) {
              score = quest.score;
            }
            arrValues.push({
              questId: key,
              optionAnswer: params[key],
              score: score
            })
          }
          if (quest.baseType === 3) {
            let score = 0
            if (Number(quest.tfAnswer).toString() === params[key]) {
              score = quest.score;
            }
            arrValues.push({
              questId: key,
              tfAnswer: params[key],
              score: score
            })
          }
          if (quest.baseType === 4) {
            let score = 0
            if(quest.blankAnswer.every((item,index) =>{
              return this.checkResult(item) === this.checkResult(params[key][index])
            })){
              score = quest.score;
            }
            arrValues.push({
              questId: key,
              blankAnswer: params[key],
              score: score
            })
          }
          if(quest.baseType === 5){
            arrValues.push({
              questId: key,
              answerContent: params[key],
              score: 0
            })
          }
        }
        let objScore=0;
        arrValues.forEach( item =>{
          objScore += item.score
        });
        let postData={
          paperResultAnswerList: arrValues,
          objScore: objScore
        };
        updateBean('PaperResult', this.examInfo.paperResult.id, postData).then(res => {
          if(res.retCode === 0){
            console.log(res)
          }
        })
      },
      submitForm: function () {
        let params = Object.assign({}, this.formData);
        let NotAnswer=[];
        let arrValues = [];
        for(let key in params){
          if(params[key] == null || params[key].length === 0){
            NotAnswer.push(key);
          }
          const quest = this.questList.filter(v => v.id === key)[0]
          // console.log(quest);
          if (quest.baseType === 1) {
            let score = 0
            if (quest.optionAnswer.toString() === params[key].toString()) {
              score = quest.score;
            }
            arrValues.push({
              questId: key,
              optionAnswer: [params[key]],
              score: score
            })
          }
          if (quest.baseType === 2) {
            let score = 0
            if (quest.optionAnswer.sort().toString() === params[key].sort().toString()) {
              score = quest.score;
            }
            arrValues.push({
              questId: key,
              optionAnswer: params[key],
              score: score
            })
          }
          if (quest.baseType === 3) {
            let score = 0
            if (Number(quest.tfAnswer).toString() === params[key]) {
              score = quest.score;
            }
            arrValues.push({
              questId: key,
              tfAnswer: params[key],
              score: score
            })
          }
          if (quest.baseType === 4) {
            let score = 0
            if(quest.blankAnswer.every((item,index) =>{
              return this.checkResult(item) === this.checkResult(params[key][index])
            })){
              score = quest.score;
            }
            arrValues.push({
              questId: key,
              blankAnswer: params[key],
              score: score
            })
          }
          if(quest.baseType === 5){
            arrValues.push({
              questId: key,
              answerContent: params[key],
              score: 0
            })
          }
        }
        console.log(arrValues);
        // if(NotAnswer.length>0){
        //   NotAnswerStr=NotAnswer.join()+' 没有提交答案!!!';
        // }
        this.$refs.formData.validate((valid) => {
          if (valid) {
            this.$confirm(`确认提交试卷吗？`, '提示', {}).then(() => {
              let objScore=0;
              arrValues.forEach( item =>{
                objScore += item.score
              });
              let postData={
                status: 1,
                paperResultAnswerList: arrValues,
                objScore: objScore
              };
              updateBean('PaperResult', this.examInfo.paperResult.id, postData).then(res => {
                if(res.retCode === 0){
                  this.finish = false;
                  this.$message({
                    type: 'success',
                    message: '试卷提交成功！！'
                  })
                  this.$router.push('/paper/exam')
                }
              }).catch(err =>{
                this.$message('提交更新失败！'+err)
              })
            }).catch(() =>{})
          }
        })
      },
      leaveForm: async function(){
        await this.saveForm()
        this.$message.success('保存成功！')
        this.finish=false;
        this.$router.push({path:'/paper/exam'});
      },
      getEditContent(val) {
        this.formData[val.id] = val.content;
      },
      getExamPaper:function(data) {
        Promise.all([queryBean('Paper', {id: this.$route.query.id}), queryBean('PaperQuest', data)]).then(res => {
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
      if(this.finish===false){
        let val=this.$store.state.tab.mainTabs.splice(-1);
        this.$store.commit('updateMainTabsActiveName', val);
        next()
      }else{
        this.$alert('试卷未提交，确定离开此页面?', '提示', {
          confirmButtonText: '确定',
          type: 'warning',
          callback: async (action) => {
            await this.saveForm()
            this.$message.success('试卷已保存！')
            // let val=this.$store.state.tab.mainTabs.splice(-1);
            // this.$store.commit('updateMainTabsActiveName', val);
            next()
          }
        })
      }
    }
  }
</script>

<style scoped>
  .wang-editor{
    padding:0 30px;
  }
  .exampaper{
    width:80%;
    margin:20px auto;
  }
  .queryContent{padding:10px 20px;}
  .queryContent p{
    margin:0;
    line-height: 30px;
  }
  .optionPic{
    display: inline-block;
  }
  .optionPic img{
    width:100px;
    height:100px;
  }
  .paper_title{display: flex;}
</style>
