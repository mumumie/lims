<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>用户昵称：{{userInfo.nickname}}</span>
      </div>
      <div>
        <p>用户ID：{{userInfo.id}}</p>
        <p>用户账号：{{userInfo.name}}</p>
        <p>用户用户组：{{userInfo.deptName}}</p>
        <p>用户角色：{{userInfo.roleNames}}</p>
        <p>用户邮箱：{{userInfo.email}}</p>
        <p>用户手机：{{userInfo.phone}}</p>
        <p>用户学院：{{userInfo.academy}}</p>
        <p>用户专业：{{userInfo.major}}</p>
        <p>用户学号：{{userInfo.studentNo}}</p>
        <p>用户性别：{{userInfo.gender}}</p>
      </div>
    </el-card>
<!--    <el-card class="box-card">-->
<!--      <div slot="header" class="clearfix">-->
<!--        <span>分数统计：</span>-->
<!--      </div>-->
<!--      <div>-->
<!--        <p>客观题分数：{{studentInfo.sumObjScore}}</p>-->
<!--        <p>总得分数：{{studentInfo.sumTotalScore}}</p>-->
<!--        <p>试卷总分数：{{studentInfo.sumLogin}}</p>-->
<!--      </div>-->
<!--    </el-card>-->
  </div>
</template>
<script>
  import {getBean,getStudentStat} from "@/http/base";
  export default {
    name: "UserDetail",
    data(){
      return{
        userInfo:{},
        studentInfo:{}
      }
    },
    created() {
      this.getUserInfo();
      // this.getStudentStatInfo();
    },
    methods:{
      getUserInfo:function(){
        getBean('Account',this.$route.params.id).then(res =>{
          this.userInfo=res.bean;
        })
      },
      // 获取分页数据
      getStudentStatInfo: function () {
        let pageRequest={
          pageNum: 1,
          pageSize: 10,
          condition:{
            conditionAccount:{
              'conditionExamResult.status':2,

            },
            conditionExamResult:{
              userid:this.$route.params.id
            },
            conditionLoginLog:{

            },
          },
          sort:{
            sumTotalScore: -1
          }
        };
        getStudentStat(pageRequest.condition,pageRequest).then((res) => {
          this.studentInfo = res.bean.data[0];
        })
      },
    }
  }
</script>

<style scoped>

</style>
