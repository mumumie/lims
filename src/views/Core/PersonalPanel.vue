<template>
  <div class="personal-panel">
    <div class="personal-desc" :style="{'background':this.$store.state.app.themeColor}">
        <div class="avatar-container">
          <img class="avatar" :src="require('@/assets/user.png')" />
        </div>
        <div class="name-role">
          <span class="sender">{{ user.name }} - {{ user.role }}</span>
        </div>
        <div class="registe-info">
          <span class="registe-info">
            <li class="fa fa-clock-o"></li>
            {{ user.registeInfo }}
          </span>
        </div>
    </div>
<!--    <div class="personal-relation">-->
<!--        <span class="relation-item">followers</span>  -->
<!--        <span class="relation-item">watches</span>  -->
<!--        <span class="relation-item">friends</span>-->
<!--    </div>-->
    <div class="main-operation">
        <span class="main-operation-item">
          <el-button size="small" icon="fa fa-male" @click="userDetailHandle"> 个人中心</el-button>
        </span>
        <span class="main-operation-item">
          <el-button size="small" icon="fa fa-key" @click="editPasswordHandle(0)"> 修改密码</el-button>
        </span>
    </div>
    <div class="other-operation">
<!--        <div class="other-operation-item">-->
<!--          <li class="fa fa-eraser"></li>-->
<!--          清除缓存-->
<!--        </div>    -->
<!--        <div class="other-operation-item">-->
<!--          <li class="fa fa-user"></li>-->
<!--          在线人数-->
<!--        </div>    -->
        <div class="other-operation-item">
          <li class="fa fa-bell"></li>
          访问次数
        </div>
    </div>
    <div class="personal-footer" @click="logout">
      <li class="fa fa-sign-out"></li>
      {{$t("common.logout")}}
    </div>
    <!--修改密码界面-->
    <el-dialog title="修改密码" width="500px" :visible.sync="editVisible" :close-on-click-modal="false" append-to-body>
      <el-form :model="dataForm" label-width="100px" :rules="dataFormRules" ref="dataForm" size="mini" label-position="right" v-if="editVisible">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="dataForm.newPassword" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="newPassword2">
          <el-input v-model="dataForm.newPassword2" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click.native="editPasswordHandle(1)">重置</el-button>
        <el-button size="mini" type="primary" @click.native="editPassword" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
    <!--备份还原界面-->
    <backup ref="backupDialog" @afterRestore="afterRestore"></backup>
  </div>
</template>

<script>
import Cookies from "js-cookie"
import Backup from "@/views/Backup/Backup"
import { updateBean } from "@/http/base";
export default {
  name: 'PersonalPanel',
  components:{
    Backup
  },
  props: {
    user: {
      type: Object,
      default: {
        name: "admin",
        avatar: "@/assets/user.png",
        role: "超级管理员",
        registeInfo: "注册时间：2018-12-25 "
      }
    }
  },
  data() {
    //此处即表单发送之前验证
    let validateNewPassword = (rule, value, callback) => {
      if (value === this.dataForm.password) {
        callback(new Error('新密码不能与原密码相同!'))
      } else {
        callback()
      }
    };
    let validateNewPassword2 = (rule, value, callback) => {
      if (value !== this.dataForm.newPassword) {
        callback(new Error('与新密码不一致!'))
      } else {
        callback()
      }
    };
    return {
      editVisible: false,
      dataForm: {
        newPassword: '',
        newPassword2: ''
      },
      dataFormRules: {
        newPassword: [
          { required: true, message: '请设置新密码', trigger: 'blur' },
          { min: 6, message: '长度最少 6 个字符' }
        ],
        newPassword2: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: validateNewPassword2, trigger: 'blur' }
        ]
      },
      editLoading: false
    }
  },
  methods: {
    editPasswordHandle(val) {
      if (val) {
        this.$refs.dataForm.resetFields();
      } else {
        this.dataForm = {
          newPassword: '',
          newPassword2: ''
        };
        this.editVisible = true
      }
    },
    editPassword() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          const params = {
            id: sessionStorage.getItem('userid'),
            passwd: this.dataForm.newPassword
          }
          updateBean('Account', params.id, params).then((res) => {
            if (res.retCode === 0) {
              this.$alert('密码已修改,请重新登录账号', '提示', {
                type: 'warning',
                confirmButtonText: '确定',
                callback: action => {
                  sessionStorage.removeItem("user");
                  sessionStorage.removeItem("userid");
                  sessionStorage.removeItem("registeInfo");
                  sessionStorage.removeItem("role");
                  Cookies.remove("token");
                  this.$router.push('/login')
                }
              });
            }
          })
        } else {
          this.$message.error('请正确填写表单')
          return false
        }
      })
    },
    // 退出登录
    logout: function() {
      this.$confirm("确认退出吗?", "提示", {
        type: "warning"
      })
      .then(() => {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userid");
        sessionStorage.removeItem("registeInfo");
        sessionStorage.removeItem("role");
        Cookies.remove("token");
        this.$router.push("/login")

      })
      .catch(() => {})
    },
    // 删除cookie
    deleteCookie: function(name) {
        Cookies.remove(name)
    },
    // 打开备份还原界面
    showBackupDialog: function() {
      this.$refs.backupDialog.setBackupVisible(true)
    },
    // 成功还原之后，重新登录
    afterRestore: function() {
        this.$refs.backupDialog.setBackupVisible(false)
        sessionStorage.removeItem("user")
        this.deleteCookie("token")
        this.$router.push("/login")
        this.$api.login.logout().then((res) => {
          }).catch(function(res) {
        })
    },
    // 跳转到用户中心
    userDetailHandle:function(id){
      let userid = sessionStorage.getItem('userid');
      if(this.$route.name=== '用户中心'){
        this.$router.push({name:'用户中心',params:{id : userid}});
        this.$router.go(0)
      }else{
        this.$router.push({name:'用户中心',params:{id : userid}});
      }

    }
  },
  mounted() {
  }
}
</script>

<style scoped>
.personal-panel {
  font-size: 14px;
  width: 280px;
  text-align: center;
  border-color: rgba(180, 190, 190, 0.2);
  border-width: 1px;
  border-style: solid;
  background: rgba(182, 172, 172, 0.1);
  margin: -14px;
}
.personal-desc {
  padding: 15px;
  color: #fff;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 90px;
}
.name-role {
  font-size: 16px;
  padding: 5px;
}
.personal-relation {
  font-size: 16px;
  padding: 12px;
  margin-right: 1px;
  background: rgba(200, 209, 204, 0.3);
}
.relation-item {
  padding: 12px;
}
.relation-item:hover {
  cursor: pointer;
  color: rgb(19, 138, 156);
}
.main-operation {
  padding: 8px;
  margin-right: 1px;
  /* background: rgba(175, 182, 179, 0.3); */
  border-color: rgba(201, 206, 206, 0.2);
  border-top-width: 1px;
  border-top-style: solid;
}
.main-operation-item {
  margin: 15px;
}
.other-operation {
  padding: 15px;
  margin-right: 1px;
  text-align: left;
  border-color: rgba(180, 190, 190, 0.2);
  border-top-width: 1px;
  border-top-style: solid;
}
.other-operation-item {
  padding: 12px;
}
.other-operation-item:hover {
  cursor: pointer;
  background: #9e94941e;
  color: rgb(19, 138, 156);
}
.personal-footer {
  margin-right: 1px;
  font-size: 14px;
  text-align: center;
  padding-top: 10px;
  padding-bottom: 10px;
  border-color: rgba(180, 190, 190, 0.2);
  border-top-width: 1px;
  border-top-style: solid;
}
.personal-footer:hover {
  cursor: pointer;
  color: rgb(19, 138, 156);
  background: #b1a6a61e;
}
</style>
