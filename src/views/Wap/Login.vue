<template>
  <div class="box">
    <el-row type="flex" class="row-bg" justify="center">
      <div class="logo_pic">
        <img src="/static/images/logo.png" alt="">
      </div>
    </el-row>

    <el-form >
      <el-form-item label="帐号">
        <el-input type="text" v-model="loginForm.account"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input type="password" v-model="loginForm.passwd"></el-input>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="passwdChecked">记住密码</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loginResp" style="width:100%;">登录</el-button>
      </el-form-item>
    </el-form>

  </div>

</template>

<script>
  import Cookies from "js-cookie"
  import {post, nonauthQueryBean} from "../../http/base";
    export default {
      data() {
        return {
          loginForm: {
            account: '',
            passwd: '',
            client: 2
          },
          passwdChecked:false
        }
      },
      created: function (){
        this.logout();
        if(localStorage.getItem('user')){
          const user = JSON.parse(localStorage.getItem('user'))
          this.passwdChecked = true;
          this.loginForm = Object.assign(user)
          this.loginForm.client = 2
        }
      },
      methods: {
        login() {
          let userInfo = Object.assign({},this.loginForm)
          this.$api.login.login(userInfo).then((res) => {
            if(res.retCode === 0){
              if(this.passwdChecked){
                localStorage.setItem('user', JSON.stringify(userInfo))
              }else{
                localStorage.removeItem('user')
              }
              localStorage.setItem('token', res.token)
              Cookies.set('token', res.token); // 放置token到Cookie 新本地
              sessionStorage.setItem('user', userInfo.account); // 保存用户到本地会话
              sessionStorage.setItem('userid', res.userid);
              this.$router.push({path:"/wap"})
              // post("getAccount", {userid: res.userid}).then(res2 => {
              //   if(res2.bean.roleNames.indexOf('学生')!=-1){
              //     //setTimeout( function(){this.$router.push({path:"/wap"})}, 500 );
              //     this.$router.push({path:"/wap"})
              //   }else{
              //     alert(res2.bean.nickname+'属于角色['+res2.bean.roleNames+']，'+"不是学生角色暂时无法登陆。");
              //   }
              //
              // })

            }
          });
        },
        logout: function() {
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("userid");
          sessionStorage.removeItem("registeInfo");
          sessionStorage.removeItem("role");
          Cookies.remove("token");
        },
        loginResp(){
          nonauthQueryBean('LoginResp', { username: this.loginForm.account}, {pageSize:1, pageNum:0, sort: {insertDt: -1}}).then(res =>{
            if (res.bean.data.length === 0 || res.bean.data[0].token === localStorage.getItem('token')) {
              this.login()
            }else{
              this.$messagebox.confirm('帐号在其他地方登录过，是否仍进行登录？').then(action => {
                this.login()
              }).catch(err =>{})
            }

          })
        },
      }
    }
</script>

<style scoped>
  .box{padding-left: 0.2rem;padding-right: 0.2rem;}
</style>
