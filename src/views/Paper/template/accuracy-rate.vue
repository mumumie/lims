<template>
  <!--准确率界面-->
  <el-dialog
    title="答题准确率"
    width="800px"
    :visible.sync="switchBtn"
    :close-on-click-modal="false"
    :before-close="() => $emit('close')"
    append-to-body>
    <el-table
      :data="tableData"
      stripe
      size="mini"
      style="width: 100%">
      <el-table-column
        v-for="item in columns"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :formatter="item.formatter"
        :min-width="item.minWidth"
        :show-overflow-tooltip="!item.show"
      />
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="$emit('close')" >关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { questTypeFilter } from '@/utils/index'
  export default {
    name: 'forget-password',
    props: {
      switchBtn: {
        type: Boolean
      },
      list: {
        type: Array
      }
    },
    data() {
      return {
        tableData: this.list,
        columns: [
          {prop:"quest.content", label:"试题名称", minWidth:280, formatter: this.htmlFilter},
          {prop:"quest.baseType", label:"试题类型", minWidth:80, formatter: questTypeFilter},
          {prop:"answerTime", label:"答题次数", minWidth:80},
          {prop:"correctTime", label:"正确次数", minWidth:80},
          {prop:"correctRate", label:"正确率", minWidth:80},
          {prop:"sumScore", label:"总得分", minWidth:80},
          {prop:"avgScore", label:"平均分", minWidth:80}
        ]
      }
    },
    methods: {
      htmlFilter(row, column, cellValue, index){
        if(row.quest.content){
          let str1 = row.quest.content.replace(/[\“\”\’\‘\'\"\\\/\s+\b\f\n\r\t]/g, '');
          let str2 = str1.replace(/<[^>]+>/g,"");
          return str2
        }else{
          return row.quest.content
        }
      }
    }
  }
</script>

<style scoped>

</style>
