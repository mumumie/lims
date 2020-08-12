<template>
  <div>
    <mt-header title="考试" fixed ></mt-header>
    <div>
      <div class="practice_list_box" @click="clickExam(item)" v-for="item in examData" :key="item.id">
        <div class="list_img">
          <img :src="pic" alt="">
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
    </div>
    <!--    底部tabbar-->
    <div class="tabbar_box">
      <div @click="toPath('home')">
        <p>
          <i class="el-icon-s-shop"></i>
        </p>
        首页
      </div>
      <div @click="toPath('exam')" class="active">
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
  import { addBean, queryBean } from '@/http/base';
  import user from '@/../static/images/user.png';
  export default {
    name: 'Exam',
    data() {
      return {
        examData: [],
        examTotal: 0,
        examPages: 1,
        pic: user
      }
    },
    created() {
      this.getExam()
    },
    methods: {
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
        // this.$router.push({name: 'exam-detail', params: {id: row.id}})
        if (row.status === 1) {
          if(row.paperResult === null){
            queryBean('PaperQuest', {paperId: row.id}).then(res =>{
              let arrValues = res.bean.data.map((item) => ({questId: item.questId}));
              let doc = {
                paperId: row.id,
                paperResultAnswerList: arrValues
              };
              addBean('PaperResult', doc).then(res =>{
                if (res.retCode === 0) {
                  this.$toast({
                    message: '进入考试！',
                    iconClass: 'el-icon-circle-close'
                  });
                  setTimeout(() => {
                    this.$router.push('/wap/exam-detail/' + row.id);
                  },500)
                }
              }).catch(err => {
                this.$toast({
                  message: '添加试卷失败！'+ err,
                  iconClass: 'el-icon-circle-close'
                });
              })
            })
          } else {
            // 通过菜单URL跳转至指定路由
            if (row.paperResult.status === 1) {
              this.$toast({
                message: '您已提交该试卷，请耐心等待老师批阅！',
                iconClass: 'el-icon-circle-close'
              });
            } else {
              this.$router.push('/wap/exam-detail/' + row.id);
            }
          }
        } else {
          this.$toast({
            message: '考试' + this.examStatus(row.status),
            iconClass: 'el-icon-circle-close'
          });
        }
      },
      toPath(name){
        this.$router.push({path:'/wap/'+name})
      },
      examStatus(val) {
        switch(val) {
          case 0:
            return '未开始';
          case 1:
            return '进行中';
          case 2:
            return '已结束';
          default:
            return '-'
        }
      }
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
</style>
