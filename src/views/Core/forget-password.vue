<template>
  <!--修改密码界面-->
  <el-dialog
    title="修改密码"
    width="500px"
    :visible.sync="switchBtn"
    :close-on-click-modal="false"
    :before-close="() => $emit('close')"
    append-to-body>
    <el-form :model="dataForm" label-width="100px" :rules="dataFormRules" ref="dataForm" size="mini" label-position="right">
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="dataForm.phone" placeholder="请输入手机号">
          <el-button slot="append" style="width:100px;" type="primary" @click="getCode" :disabled="msgCode !== '获取验证码'">{{ msgCode }}</el-button>
        </el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <el-input v-model="dataForm.code" placeholder="请输入验证码"></el-input>
      </el-form-item>
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
</template>

<script>
  import Cookies from "js-cookie";
  import { updateBean, sendSms, updatePassword } from "@/http/base";
  export default {
    name: 'forget-password',
    props: {
      switchBtn: {
        type: Boolean
      },
      phone: {
        type: String,
        default: ''
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
      const validatePhone = (rule, value, callback) => {
        if (!/^1[34578]\d{9}$/.test(value)) {
          callback(new Error('请输入正确的手机号!'))
        } else {
          callback()
        }
      };
      return {
        dataForm: {
          newPassword: '',
          newPassword2: '',
          phone: this.phone,
          code: ''
        },
        dataFormRules: {
          newPassword: [
            { required: true, message: '请设置新密码', trigger: 'blur' },
            { min: 6, message: '长度最少 6 个字符' }
          ],
          newPassword2: [
            { required: true, message: '请确认新密码', trigger: 'blur' },
            { validator: validateNewPassword2, trigger: 'blur' }
          ],
          phone: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: validatePhone, trigger: 'blur' }
          ],
          code: [
            { required: true, message: '请输入验证码', trigger: 'blur' }
          ]
        },
        editLoading: false,
        msgCode: '获取验证码',
        msgSecond: 0,
        timer: null
      }
    },
    methods: {
      getCode() {
        if (!this.dataForm.phone) {
          this.$message.error('手机号不能为空！')
        }
        this.msgSecond = 120;
        this.getVerificationCode().then(() => {
          this.msgCode = '120S'
          this.timer = setInterval(() => {
            this.msgSecond--
            if (this.msgSecond > 0) {
              this.msgCode = this.msgSecond + 'S'
            } else {
              clearInterval(this.timer);
              this.timer = null;
              this.msgCode = '获取验证码';
            }
          }, 1000)
        })
      },
      getVerificationCode() {
        return new Promise((resolve, reject) => {
          sendSms({ phone: this.dataForm.phone }).then(res => {
            if (res.retCode === 0) {
              this.$message.success('验证码发送成功！')
              resolve()
            }
          })
        })
      },
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
              phone: this.dataForm.phone,
              smsCode: Number(this.dataForm.code),
              newPassword: this.dataForm.newPassword
            }
            updatePassword(params).then((res) => {
              if (res.retCode === 0) {
                this.$emit('close');
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("userid");
                sessionStorage.removeItem("registeInfo");
                sessionStorage.removeItem("role");
                Cookies.remove("token");
                this.$message.success('更新成功，请重新登录！')
                this.$router.push('/login')
              }
            })
          } else {
            this.$message.error('请正确填写表单')
            return false
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
