<template>
  <div class="bg_home">
    <div class="bg">
      <div class="header_box"></div>
      <div class="bg_icon"><img src="../../../../static/images/user.png" alt=""></div>
      <div class="bg_message">
        {{AccountData.name}}
      </div>
    </div>
    <div>
      <div class="form_list" v-for="item in arrName" @click="toPath(item.path)">
        <div class="form_list_caption">
          <i :class="item.icon"></i>
          <span>{{item.name}}</span>
        </div>
        <div class="form_list_more">
          <span class="el-icon-arrow-right"></span>
        </div>
      </div>

      <div class="form_list" @click="logout">
        <div class="form_list_caption">
          <i :class="'el-icon-s-promotion'"></i>
          <span>退出</span>
        </div>
        <div class="form_list_more">
          <span class="el-icon-arrow-right"></span>
        </div>
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
      <div @click="toPath('practice')">
        <p>
          <i class="el-icon-s-claim"></i>
        </p>
        自测
      </div>
      <div  class="active">
        <p>
          <i class="el-icon-s-custom"></i>
        </p>
        我的
      </div>
    </div>
  </div>
</template>

<script>
  import {getBean,queryBean,addBean,updateBean} from "../../../http/base";
  import Cookies from "js-cookie";
  export default {
    name: "My",
    data(){
      return{
        AccountData:{},
        arrName:[
          {name:'考试查询',icon:'el-icon-s-promotion',path:'exam-enquirise'},
          // {name:'成绩查询',icon:'el-icon-s-flag',path:''},
          {name:'自测历史',icon:'el-icon-s-marketing',path:'selfHistory'},
          // {name:'我的消息',icon:'el-icon-s-comment',path:''},
          // {name:'用户设置',icon:'el-icon-s-opportunity',path:''},
        ]
      }
    },
    methods:{
      getAccount(){
        getBean('Account',sessionStorage.getItem('userid')).then(res =>{
          this.AccountData = res.bean;
        })
      },
      toPath(name){
        if(name){
          this.$router.push({path:'/wap/'+name})
        }
      },
      logout: function() {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userid");
        sessionStorage.removeItem("registeInfo");
        sessionStorage.removeItem("role");
        Cookies.remove("token");
        this.$router.push("/wap/login")
      },
    },
    created(){
      this.getAccount();
    }
  }
</script>

<style scoped>
  .bg_home{
    padding-top:0;
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
  .active{
    color:#26a2ff;
  }
  .bg{
    animation: changeBg 20s infinite;
    background-color: #ED5564;
    background: url(../../../../static/images/member_top_bg.png);
    background-size: cover;
    text-align: center;
    width: 100%;
    height: 5rem;
  }
  @keyframes changeBg{
    0%{background-color:#ED5564;}
    10%{background-color:#FB6E52;}
    20%{background-color:#FFCE55;}
    30%{background-color:#A0D468;}
    40%{background-color:#48CFAE;}
    50%{background-color:#4FC0E8;}
    60%{background-color:#5D9CEC;}
    70%{background-color:#AC92ED;}
    80%{background-color:#EC87BF;}
    90%{background-color:#ED5564;}
  }
  .header_box{
    height:1rem;
  }
  .bg_icon{
    height:2.5rem;
    width:2.5rem;
    border:1px solid #fff;
    border-radius: 50%;
    margin:0 auto;
  }
  .bg_icon img{
    height:2.5rem;
    width:2.5rem;
    border-radius: 50%;
  }
  .bg_message{
    text-align: center;
    line-height: 1rem;
    font-size: 0.5rem;
    font-weight: bold;
    color:#fff;

  }
  .form_list{
    display: flex;
    padding:0 0.2rem;
    height:1rem;
    line-height: 1rem;
    font-size: 0.32rem;
    cursor: pointer;
    margin-top:0.2rem;
    background: #f9f9f9;
  }
  .form_list:hover{
    background: #f5f5f5;
  }
  .form_list_caption{
    width:7rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .form_list_caption i{
    font-size: 0.5rem;
  }
  .form_list_more{
    margin-left:auto;
  }
</style>
