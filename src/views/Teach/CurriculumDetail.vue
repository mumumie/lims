<template>
  <div class="exampaper">
    <el-form ref="formData" :model="formData" :rules="rules">
      <h2 v-if="examInfo.examPaper">{{examInfo.examPaper.name}}</h2>
      <div v-for="(item,index) in examPaperData" :key="item.id">
        <el-alert
          :title="(index+1) + '、'+item.subject+'('+queryType[(item.type-1)]+examPaperScores[index].scoreWeight+'分)'"
          type="info"
          :closable="false">
        </el-alert>
        <div class="queryContent">
          <el-radio-group v-model="formData[index]" v-if="item.type===1">
            <el-radio :label="iopt" v-for="(opt,iopt) in item.option" :key="iopt" v-if="item.optionType===0">{{AnswerType[iopt]+'、 '+opt}}</el-radio>
            <el-radio :label="iopt" v-for="(opt,iopt) in item.option" :key="iopt" v-if="item.optionType===1">
              <div class="optionPic">
                {{AnswerType[iopt]+'、'}}
                <img :src="global.baseUrl+opt" alt="">
              </div>
            </el-radio>
          </el-radio-group>
          <el-checkbox-group v-model="formData[index]" v-if="item.type===2">
            <el-checkbox :label="iopts" :key="iopts" v-for="(opt,iopts) in item.option" v-if="item.optionType===0">{{AnswerType[iopts]+'、 '+opt}}</el-checkbox>
            <el-checkbox :label="iopts" :key="iopts" v-for="(opt,iopts) in item.option" v-if="item.optionType===1">
              <div class="optionPic">
                <img :src="global.baseUrl+opt" alt="">
              </div>
            </el-checkbox>
          </el-checkbox-group>
          <el-radio-group v-model="formData[index]" v-if="item.type===3">
            <el-radio label="1" >正确</el-radio>
            <el-radio label="0" >错误</el-radio>
          </el-radio-group>
          <div v-if="item.type===4">
            <el-input
              v-model="formData[index][iopts]"
              :placeholder="'填空'+(iopts+1)" v-for="(opt,iopts) in item.blankAnswer"
              size="mini"
              style="width:25%;"
              :key="iopts">
            </el-input>
          </div>
          <div v-if="item.type===5">
            <div v-if="item.filePath.length>0" style="padding:5px 0;">
              附件：
              <p v-for="(ite,inde) in item.filePath">
                <a :href="global.baseUrl+ite" target="_blank">{{ite.split('files/')[1].split('-')[0]}}</a>
              </p>
            </div>
            <wangEditor ref="wangEditor" :id="index" :introduce="formData[index]" @getEditContent="getEditContent"></wangEditor>
          </div>

          <div v-if="false">
            正确答案：
            <span v-if="item.type===1||item.type===2">
            <i v-for="(optAsw,index) in item.optionAnswer" :key="index">{{optAsw + ((item.optionAnswer.length-1)===index?'':'，') }}</i>
          </span>
            <span v-if="item.type===3">
            <i>{{item.tfAnswer===true?'对':'错'}}</i>
          </span>
            <span v-if="item.type===4">
            <i v-for="(blkAsw,index) in item.blankAnswer" :key="index">{{blkAsw  + ((item.blankAnswer.length-1)===index?'':'，') }}</i>
          </span>
            <span v-if="item.type===5">
            <i>{{item.content}}</i>
          </span>
            <p>答案解析：{{item.note}}</p>
          </div>

        </div>
      </div>
      <el-button :size="size" @click="saveForm">保存</el-button>
      <el-button :size="size" @click="submitForm">提交</el-button>
      <el-button :size="size" @click="leaveForm">取消</el-button>
    </el-form>
<!--    <div v-show="!finish">-->
<!--      提交成功！！-->
<!--      <router-link :to="{path:'/teach/exampaper'}">返回试卷管理</router-link>-->
<!--    </div>-->
  </div>
</template>

<script>
  import wangEditor from '@/components/wangEditor/wangEditor';
  import {getBean, queryBean, updateBean,updateBatchBean1} from "@/http/base";
  export default {
    name: "CurriculumDetail",
    components:{
      wangEditor
    },
    data(){
      return{
        formData:[],
        examInfo:{},
        examPaperData:[],
        queryType:['单选题','多选题','判断题','填空题','问答题'],
        AnswerType:['A','B','C','D','E','F'],
        examPaperId:'',
        rules:[],
        finish:true
      }
    },
    methods:{
      saveForm: function () {
        let that=this;
        this.$refs.formData.validate((valid) => {
          if (valid) {
            this.$confirm('确定保存试卷吗？', '提示', {}).then(() => {
              let params = Object.assign({}, this.formData);
              let arr=Object.keys(params);
              let arrValues=[];
              for(let i=0;i<this.examPaperData.length;i++){
                if(this.examPaperData[i].type===1){
                  arrValues[i]={
                    examQuestId:this.examPaperData[i].id,
                    optionAnswer:(params[i]===''?[]:[params[i]])
                  }
                }
                if(this.examPaperData[i].type===2){
                  arrValues[i]={
                    examQuestId:this.examPaperData[i].id,
                    optionAnswer:params[i].sort()
                  }
                }
                if(this.examPaperData[i].type===3){
                  arrValues[i]={
                    examQuestId:this.examPaperData[i].id,
                    tfAnswer:params[i]
                  }
                }
                if(this.examPaperData[i].type===4){
                  arrValues[i]={

                    examQuestId:this.examPaperData[i].id,
                    blankAnswer:params[i]
                  }
                }
                if(this.examPaperData[i].type===5){
                  arrValues[i]={

                    examQuestId:this.examPaperData[i].id,
                    answerContent:params[i]
                  }
                }
              }
              let postData={
                examResultAnswerList:arrValues
              };
              updateBean('ExamResult', this.$route.query.id , postData )
                .then(res =>{
                  if(res.retCode===0){
                    this.finish=false;
                    this.$router.push({path:'/teach/exampaper'});
                  }
                })
            }).catch(() =>{})
          }
        })
      },
      submitForm: function () {
        let that=this;
        let params = Object.assign({}, this.formData);
        let arr=Object.keys(params);
        let NotAnswer=[];
        let NotAnswerStr='';
        let arrValues=[];
        let examResultMarkList=[];
        for(let i=0;i<this.examPaperData.length;i++){
          if(params[i]==null || params[i].length===0){
            NotAnswer.push(`第${i+1}题`);
          }
          if(this.examPaperData[i].type===1){
            if(this.examPaperData[i].optionAnswer.length >0 && this.examPaperData[i].optionAnswer.toString()==params[i]){
              examResultMarkList[i]={
                score:this.examPaperScores[i].scoreWeight
              }
            }else{
              examResultMarkList[i]={
                score:0
              }
            }
            arrValues[i]={
              examQuestId:this.examPaperData[i].id,
              optionAnswer:(params[i]===''?[]:[params[i]])
            }
          }
          if(this.examPaperData[i].type===2){
            if(this.examPaperData[i].optionAnswer.length >0 && this.examPaperData[i].optionAnswer.toString()=== params[i].sort().toString()){
              examResultMarkList[i]={
                score:this.examPaperScores[i].scoreWeight
              }
            }else{
              examResultMarkList[i]={
                score:0
              }
            }
            arrValues[i]={
              examQuestId:this.examPaperData[i].id,
              optionAnswer:params[i].sort()
            }
          }
          if(this.examPaperData[i].type===3){
            if(params[i] !== '' && this.examPaperData[i].tfAnswer == Number(params[i])){
              examResultMarkList[i]={
                score:this.examPaperScores[i].scoreWeight
              }
            }else{
              examResultMarkList[i]={
                score:0
              }
            }
            arrValues[i]={
              examQuestId:this.examPaperData[i].id,
              tfAnswer:params[i]
            }
          }
          if(this.examPaperData[i].type===4){
            if(this.examPaperData[i].blankAnswer.length > 0 && this.checkBlanckResult(this.examPaperData[i].blankAnswer,params[i])){
              examResultMarkList[i]={
                score:this.examPaperScores[i].scoreWeight
              }
            }else{
              examResultMarkList[i]={
                score:0
              }
            }
            arrValues[i]={
              examQuestId:this.examPaperData[i].id,
              blankAnswer:params[i]
            }
          }
          if(this.examPaperData[i].type===5){
            examResultMarkList[i]={
              score:0
            };
            arrValues[i]={
              examQuestId:this.examPaperData[i].id,
              answerContent:params[i]
            }
          }
        }
        if(NotAnswer.length>0){
          NotAnswerStr=NotAnswer.join()+' 没有提交答案!!!';
        }
        this.$refs.formData.validate((valid) => {
          if (valid) {
            this.$confirm(`${NotAnswerStr} 确认提交试卷吗？`, '提示', {}).then(() => {

              let objScore=0;
              examResultMarkList.forEach( item =>{
                objScore +=item.score
              });
              let postData={
                status:1,
                examResultAnswerList:arrValues,
                examResultMarkList:examResultMarkList,
                objScore:objScore
              };
              updateBean('ExamResult', this.$route.query.id , postData)
                .then(res => {
                  if(res.retCode===0){
                    this.finish=false;
                    this.getStatus();

                  }
                })
                .catch(err =>{
                  this.$message('提交更新失败！'+err)
                })
            }).catch(() =>{})
          }
        })
      },
      leaveForm:function(){
        this.finish=false;
        this.$router.push({path:'/teach/exampaper'});
      },
      getEditContent(val) {
        // return this.$refs.wangEditor.getEditContent();
        this.formData[val.id] = val.content;
      },
      getExamPaper:function(data) {
        getBean('ExamResult', data)
          .then(res => {
            this.examPaperId=res.bean.examPaperId;
            this.examInfo=res.bean;
            this.examPaperScores=res.bean.examPaper.examPaperScores;
            this.examPaperData=res.bean.examPaper.examQuests;
            this.examPaperData.forEach((item,index) =>{
              if(item.type===2){
                this.$set(this.formData,index,[])
              }
              if(item.type===4){
                this.$set(this.formData,index,[])
              }
            });
            if(res.bean.examResultAnswerList.length>0){
              res.bean.examResultAnswerList.forEach((item,index) =>{
                if(res.bean.examPaper.examQuests[index].type===1){
                  this.formData[index]=item.optionAnswer[0];
                }else if(res.bean.examPaper.examQuests[index].type===2){
                  this.formData[index]=item.optionAnswer;
                }else if(res.bean.examPaper.examQuests[index].type===3){
                  this.formData[index]=item.tfAnswer;
                }else if(res.bean.examPaper.examQuests[index].type===4){
                  this.formData[index]=item.blankAnswer;
                }else if(res.bean.examPaper.examQuests[index].type===5){
                  this.formData[index]=item.answerContent;
                }
              });
            }
          })
      },
      getStatus:function(){
        let navTree=this.$store.state.menu.navTree;
        this.$api.examresult.findPage({pageNum: 1, condition:{status:0}}).then((res) => {
          let total=res.bean.total;
          res.bean.data.forEach(item =>{
            if (item.myExamResult === null) {
              total--
            }
          });
          this.navTree=navTree.map( item =>{
            item.children.map( ite =>{
              if (ite.name === '试卷/习题') {
                ite.value = total;
              }
              return ite;
            });
            return item;
          });
          this.$router.push({path:'/teach/exampaper'});
        });
        // this.$store.commit('setNavTree', res.result.menuTree)
      },
      checkResult(str){
        if(str){
          let str1 = str.toLowerCase();
          let str2 = str1.replace(/[\“\”\’\‘\'\"\\\/\s+\b\f\n\r\t]/g, '');
          return str2
        }else{
          return str
        }

      },
      checkBlanckResult(answer,write){
        let flag=true;
        if (write.length === 0) {
          return false;
        }
        for(let i=0;i<answer.length;i++){
          let answerArr=answer[i].split('&');
          if( answerArr.findIndex(item => this.checkResult(item) === this.checkResult(write[i])) > -1){

          }else{
            flag = false;
          }
        }
        return flag;
      }

    },
    beforeRouteLeave(to, form, next) {
      if(this.finish===false){
        let val=this.$store.state.tab.mainTabs.splice(-1);
        this.$store.commit('updateMainTabsActiveName', val);
        next()
      }else{
        this.$confirm('是否要离开此页面，退出考试?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          let val=this.$store.state.tab.mainTabs.splice(-1);
          this.$store.commit('updateMainTabsActiveName', val);
          next()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      }
    },
    created(){
      this.getExamPaper(this.$route.query.id);

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
</style>
