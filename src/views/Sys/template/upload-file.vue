<template>
  <el-dialog
    title="上传文件"
    :visible.sync="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    append-to-body
    :before-close="handleClose"
  >
    <div>
      <el-upload
        ref="upload"
        class="upload-demo"
        drag
        action="/"
        :before-upload="beforeAvatarUpload"
        :on-change="handleChange"
        :on-remove="handleRemove"
        :auto-upload="false"
        :file-list="fileList"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件，且不超过2M</div>
      </el-upload>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="download" size="mini">下载模板</el-button>
      <el-button type="primary" @click="submitUpload" size="mini">上传文件</el-button>
    </span>
  </el-dialog>
</template>

<script>
import axios from 'axios'
import { baseUrl } from '@/utils/global'
export default {
  name: 'UploadFile',
  props: ['switchBtn', 'typeName'],
  data() {
    return {
      dialogVisible: false,
      fileList: []
    }
  },
  watch: {
    switchBtn(val) {
      this.fileList = []
      this.dialogVisible = val
    }
  },
  methods: {
    download() {
      const query = encodeURI(JSON.stringify({ typeName: this.typeName }))
      window.open(`${baseUrl}/excel/getExcelTemp?body=${query}`, '_blank')
    },
    handleClose(done) {
      this.$emit('close')
    },
    beforeAvatarUpload(file) {
      console.log(file)
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-1)
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    submitUpload() {
      if (this.fileList.length === 0) {
        this.$message.error('上传文件不能为空！')
        return
      }
      const fileType = this.fileList[0].name.split('.')
      if (!['xls', 'xlsx'].includes(fileType[ fileType.length - 1 ])) {
        this.$message.error('上传文件类型必须是xls或xlsx!')
        return
      }
      const formData = new FormData()
      formData.append('file', this.fileList[0].raw)
      formData.append('typeName', this.typeName)
      axios.post(`${baseUrl}/importExcelData`, formData, { 'Content-Type': 'multipart/form-data' }).then(res => {
        if (res.data.retCode === 0) {
          this.$emit('success')
        } else {
          this.$message.error(res.data.retMsg)
        }
      }).catch(err => {
        this.$message.error(err.data.retMsg)
      })
      // const isLt2M = this.fileList[0].size / 1024 / 1024 < 2
      // if (!isLt2M) {
      //   this.$message.error('上传文件大小不能超过 2MB!')
      // }
      // this.$refs.upload.submit()
    }
  }
}
</script>

<style scoped>
  .upload-demo{text-align: center;}
</style>
