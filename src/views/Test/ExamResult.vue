<template>
  <div>


    <el-card class="box-card">
      <el-row>
        <el-col :span="20">题干题干题干题干题干题干题干题干题干题干题干题干题干题干</el-col>
        <el-col :span="4">
          <el-tag type="success">0</el-tag>/
          <el-tag type="info">1</el-tag></el-col>
      </el-row>

      <el-checkbox label="学生答案" v-model="ss" disabled></el-checkbox>
      <el-checkbox label="正确答案" disabled border = "true" ></el-checkbox>

      <el-checkbox label="选项2" disabled ></el-checkbox>

      <el-checkbox label="选项3" disabled ></el-checkbox>
      <el-divider content-position="left">答案解析</el-divider>
      <span>答案解析答案解析答案解析答案解析答案解析</span>
    </el-card>

    <el-card class="box-card" style="margin-top: 10px">
      <el-row>
        <el-col :span="20">动物的先天性行为受<u>基因</u>控制,后天习得行为在<u>生活实践</u>中形成</el-col>
        <el-col :span="4">
          <el-tag type="success">1</el-tag>/
          <el-tag type="info">2</el-tag></el-col>
      </el-row>
      <el-row>
        <el-col :span="4"><el-input
          value="个人品质"
          :disabled="true" suffix-icon="el-icon-close">
        </el-input></el-col>
        <el-col :span="4" style="margin-left: 20px"><el-input
          value="生活实践"
          :disabled="true" suffix-icon="el-icon-check">
        </el-input></el-col>
      </el-row>
      <el-divider content-position="left">答案解析</el-divider>
      <span>答案解析答案解析答案解析答案解析答案解析</span>
    </el-card>

    <el-card class="box-card" style="margin-top: 10px">
      <el-row>
        <el-col :span="20">河马的吼叫是动物行为</el-col>
        <el-col :span="4">
          <el-tag type="success">1</el-tag>/
          <el-tag type="info">1</el-tag></el-col>
      </el-row>

      <el-radio disabled v-model="radio" label="选中且禁用" border>是</el-radio>
      <el-radio disabled v-model="radio" label="禁用">否</el-radio>
      <el-divider content-position="left">答案解析</el-divider>
      <span>答案解析答案解析答案解析答案解析答案解析</span>
    </el-card>

  </div>

</template>

<script>
  export default {
    data() {
      return {
        ss: true,
        radio: '选中且禁用'
      }
    },
    components: {
    },
    methods: {
    }
  }
</script>

<style scoped>

</style>
