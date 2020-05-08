<template>
  <div>

  <el-form ref="form" :model="form" label-width="80px">

    <el-form-item label="试卷名称">
      <el-input ></el-input>
    </el-form-item>

  <el-collapse v-model="activeNames" @change="handleChange">
    <el-collapse-item title="选择题" name="1">
      <el-button type="primary">选择已有题目</el-button><em>弹出题目选择组件（题目选择组件是一个类似题库管理的表格，但只能查看和框选。传入题型，返回已选题目。）</em>
      <i class="el-icon-plus"></i>
      <el-button type="primary">新增题目</el-button><em>弹出新增选择题组件</em>
      <el-table
        :data="tableData"
        style="width: 100%"
        max-height="250">
        <el-table-column
          fixed
          prop="date"
          label="题干"
          width="150">
        </el-table-column>
        <el-table-column
          prop="name"
          label="难度"
          width="120">
        </el-table-column>
        <el-table-column
          prop="province"
          label="分值"
          width="120">
        </el-table-column>

        <el-table-column
          fixed="right"
          label="操作"
          width="200">
          <template slot-scope="scope">
            <i class="el-icon-top"></i>
            <i class="el-icon-bottom"></i>
            <el-button type="text" size="small">编辑</el-button>
            <el-button
              @click.native.prevent="deleteRow(scope.$index, tableData)"
              type="text"
              size="small">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-collapse-item>
    <el-collapse-item title="填空题" name="2">
      <div>控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；</div>
      <div>页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。</div>
    </el-collapse-item>
    <el-collapse-item title="对错题" name="3">
      <div>简化流程：设计简洁直观的操作流程；</div>
      <div>清晰明确：语言表达清晰且表意明确，让用户快速理解进而作出决策；</div>
      <div>帮助用户识别：界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。</div>
    </el-collapse-item>
    <el-collapse-item title="问答题" name="4">
      <div>用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；</div>
      <div>结果可控：用户可以自由的进行操作，包括撤销、回退和终止当前操作等。</div>
    </el-collapse-item>
  </el-collapse>
  <br><br>
  <el-table
    :data="tableData2" show-summary
    style="width: 100%">
    <el-table-column
      prop="date"
      label="题型"
      width="180">
    </el-table-column>
    <el-table-column
      prop="name"
      label="数量"
      width="180">
    </el-table-column>
    <el-table-column
      prop="address"
      label="总分">
    </el-table-column>
  </el-table>

    <el-form-item>
      <el-button type="primary" @click="onSubmit">立即创建</el-button>
      <el-button>取消</el-button>
    </el-form-item>
  </el-form>
</div>
</template>

<script>
    export default {
      data() {
        return {
          tableData:[{
            date: '题干取前20个字符',
            name: '简单',
            province: '3'
          }, {
            date: '2016-05-02',
            name: '简单',
            province: '2'
          }],
          tableData2: [{
            date: '单项选择题',
            name: '10',
            address: '10'
          }, {
            date: '填空题',
            name: '5',
            address: '10'
          }, {
            date: '问答题',
            name: '2',
            address: '20'
          }]
        };
      },
      methods: {
        deleteRow(index, rows) {
          rows.splice(index, 1);
        },
        handleChange(val) {
          console.log(val);
        }
      }
    }
</script>

<style scoped>

</style>
