<template>
  <div class="login-container" >
    <div class="login_header">
      <div class="logo">
        <div class="logo_pic">
          <img src="/static/images/logo.png" alt="">
        </div>
        <div class="logo_name">安徽正华生物仪器设备有限公司</div>
      </div>
      <div class="hot_phone">
        <div class="phone"><span>客服热线</span><span>0561-6062307</span></div>
<!--        <div class="set"><i class="el-icon-s-tools"></i></div>-->
<!--        <div class="close"><i class="el-icon-close"></i></div>-->
      </div>
    </div>
    <div class="login_box">
      <div class="login_input">
        <el-form :model="loginForm" :rules="fieldRules" ref="loginForm" size="mini" label-position="right" label-width="120px" @keyup.enter.native="login">
          <p class="title">智慧实验室</p>
          <el-form-item prop="account" label="登录账号">
            <el-input type="text" v-model="loginForm.account" style="width:200px;" placeholder="账号"></el-input>
<!--            <el-checkbox v-model="accountChecked">记住账号</el-checkbox>-->
          </el-form-item>
          <el-form-item prop="passwd" label="密  码">
            <el-input type="password" v-model="loginForm.passwd" style="width:200px;" placeholder="密码"></el-input>
            <el-checkbox v-model="passwdChecked">记住密码</el-checkbox>
            <!--<span class="forget">忘记密码？</span>-->
            <el-radio-group v-model="loginForm.client">
              <el-radio :label="1">桌面版</el-radio>
              <el-radio :label="2">手机版</el-radio>
            </el-radio-group>
            <span style="padding-left:50px;color:#606266;cursor:pointer;" @click="forgetPassword = true">找回密码</span>
          </el-form-item>
          <el-form-item style="width:100%;padding-top:15px;">
            <el-button type="primary" style="width:140px;" class="btn" @click.native.prevent="loginResp" :loading="loading">账号登录</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="login_img">
        <img src="/static/images/login_build.jpg" alt="">
      </div>
    </div>
    <!--修改密码界面-->
    <forget-password
      :switchBtn="forgetPassword"
      v-if="forgetPassword"
      @close="forgetPassword = false"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Cookies from "js-cookie"
import {post, queryBean, nonauthQueryBean} from "@/http/base";
import ForgetPassword from "@/views/Core/forget-password";
import {ErrorResult} from "../utils/error";
export default {
  name: 'Login',
  components: {
    ForgetPassword
  },
  data() {
    return {
      loading: false,
      loginForm: {
        account: '',
        passwd: '',
        client: 1
      },
      fieldRules: {
        account: [
          {  message: '请输入账号', trigger: 'blur' }
        ],
        passwd: [
          {  message: '请输入密码', trigger: 'blur' }
        ]
      },
      checked: true,
      accountChecked:false,
      passwdChecked:false,
      forgetPassword: false
    }
  },
  watch:{
    loading:function(){
      setTimeout(()=>{
        this.loading=false;
      },2000)
    }
  },
  methods: {
    login() {
      this.loading = true;
      let userInfo = Object.assign({}, this.loginForm)
      this.$api.login.login(userInfo).then((res) => {
        if(res.retCode === 0){
          if(this.passwdChecked){
            localStorage.setItem('user', JSON.stringify(userInfo))
          }else{
            localStorage.removeItem('user')
          }
          Cookies.set('token', res.token); // 放置token到Cookie 新本地
          localStorage.setItem('token', res.token)
          sessionStorage.setItem('user', userInfo.account); // 保存用户到本地会话
          sessionStorage.setItem('userid', res.userid);
          this.$store.commit('menuRouteLoaded', false); // 要求重新加载导航菜单
          this.mainTabs=[];
          this.navMainTree=[];
          this.navTree=[];
          if(this.loginForm.client === 1){
            post("getAccount", {userid: res.userid}).then(res2 => {
              if(res2.bean.roleNames.indexOf('学生')!=-1){
                this.$router.push('/paper/exam');
              }else{
                this.$router.push('/sys/course');
              }
              this.loading = false
            })
          }else{
            this.$router.push('/wap/home');
            this.loading = false
          }
        }
      });
    },
    loginResp(){
      nonauthQueryBean('LoginResp', { username: this.loginForm.account}, {pageSize:1, pageNum:0, sort: {insertDt: -1}}).then(res =>{
        if (res.bean.data.length === 0 || res.bean.data[0].token === localStorage.getItem('token')) {
          this.login()
        }else{
          this.$confirm('帐号在其他地方登录过，是否仍进行登录？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.login()
          }).catch(() => {

          });
        }

      })
    },
    refreshCaptcha: function(){
      this.loginForm.src = this.global.backupBaseUrl1 + "/captcha.jpg?t=" + new Date().getTime();
    },
    reset() {
      this.$refs.loginForm.resetFields()
    },
    // 切换主题
    onThemeChange: function(themeColor) {
      this.$store.commit('setThemeColor', themeColor)
    },
    logout: function() {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userid");
      sessionStorage.removeItem("registeInfo");
      sessionStorage.removeItem("role");
      Cookies.remove("token");
    },
  },
  beforeCreate() {
    if (window.innerWidth<window.innerHeight){
      this.$router.push("/wap/login")
    }
  },
  mounted() {
    // this.refreshCaptcha()
    this.logout();
    if(localStorage.getItem('user')){
      const user = JSON.parse(localStorage.getItem('user'))
      this.passwdChecked = true;
      this.loginForm = Object.assign(user)
    }
  },
  computed:{
    ...mapState({
      themeColor: state=>state.app.themeColor
    }),
    mainTabs: {
      get () { return this.$store.state.tab.mainTabs },
      set (val) { this.$store.commit('updateMainTabs', val) }
    },
    navMainTree: {
      get () { return this.$store.state.menu.navMainTree },
      set (val) { this.$store.commit('setMainNavTree', val) }
    },
    navTree: {
      get () { return this.$store.state.menu.navTree },
      set (val) { this.$store.commit('setNavTree', val) }
    },
  }
}
</script>
<style>
  .login_input .el-form-item__label{
    font-size: 16px;
    font-weight: bold;
    padding-right: 24px;
  }
  .login_input .el-checkbox{
    padding-left:13px;
  }
</style>
<style lang="scss" scoped>
  .login-container {
    font-family: 'KaiTi';
    box-sizing: border-box;
    border-radius: 35px;
    margin:100px auto;
    width: 749px;
    height:437px;
    padding: 30px 18px 30px 16px;
    background: url(/static/images/login_bg.png) no-repeat center center;
    color:#fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .login_header{
      display: flex;
      .logo{
        display: flex;
        img{
          width: 107px;
          height:94px;
          border-radius: 19px;
        }
        .logo_name{
          font-size: 24px;
          line-height: 94px;
          font-weight: bold;
        }
      }
      .hot_phone{
        margin-left:auto;
        display: flex;
        line-height: 20px;
        .phone{
          span{
            padding-right:12px;
            line-height: 20px;
          }
        }
        .set{
          padding-right:10px;
          .el-icon-s-tools{
            font-size: 17px;
            line-height: 20px;
            cursor: pointer;
          }
        }
        .close{
          .el-icon-close{
            font-size: 20px;
            font-weight: bold;
            line-height: 20px;
            cursor: pointer;
          }
        }
      }
    }
    .login_input{

    }
    .login_box{
      display: flex;
      .login_input{
        width:420px;
        color:#333333;
        .title{
          margin:0 0 56px 0;
          font-weight: bold;
          font-size: 20px;
          line-height: 30px;
          text-align: right;
          color:#1b1b1b;
        }
        .forget{
          padding-left:140px;
          font-size: 11px;
          cursor: pointer;
        }
        .btn{
          width:140px;
          height:34px;
          border-radius: 13px;
          background:#169bd5;
          border-color:#169bd5;
          font-size: 13px;
          color:#fff;
          margin-left:31px;
        }
        .btn:hover{
          background:#169bd5;
        }

      }
      .login_img{
        margin-left:auto;
      }
    }
  }
</style>
