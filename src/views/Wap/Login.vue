<template>
  <div>
    <el-row type="flex" class="row-bg" justify="center">
      <div class="logo_pic">
        <img src="/static/images/logo.png" alt="">
      </div>
    </el-row>

    <el-form >
        <el-form-item label="帐号">
          <el-input type="text" v-model="account"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="passwd"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
        </el-form-item>
      </el-form>

  </div>

</template>

<script>
  import Cookies from "js-cookie"
  import {post} from "../../http/base";
    export default {
      data() {
        return {
          account: 'student',
          passwd: '111111',
        }
      },
      created: function (){
        this.logout();
      },
      methods: {
        login() {
          let userInfo = {account:this.account, passwd:this.passwd}
          this.$api.login.login(userInfo).then((res) => {
            if(res.retCode === 0){
              post("getAccount", {userid: res.userid}).then(res2 => {
                if(res2.bean.roleNames.indexOf('学生')!=-1){
                  Cookies.set('token', res.token); // 放置token到Cookie 新本地
                  sessionStorage.setItem('user', userInfo.account); // 保存用户到本地会话
                  sessionStorage.setItem('userid', res.userid);
                  //setTimeout( function(){this.$router.push({path:"/wap"})}, 500 );
                  this.$router.push({path:"/wap"})
                }else{
                  alert(res2.bean.nickname+'属于角色['+res2.bean.roleNames+']，'+"不是学生角色暂时无法登陆。");
                }

              })

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
      }
    }
</script>

<style scoped>

</style>
