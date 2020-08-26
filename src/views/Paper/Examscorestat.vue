<template>
  <div>
    <el-form ref="form" :inline="true" :model="filters" size="mini">
      <el-form-item label="统计类型">
        <el-select v-model="filters.tag" placeholder="请选择统计类型">
          <el-option
            :label="item.label"
            :value="item.value"
            v-for="item in tagList"
            :key="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="题型" v-if="filters.tag === 'baseType'">
        <el-select v-model="filters.groupName" placeholder="请选择题型">
          <el-option
            :label="item.label"
            :value="item.value"
            v-for="item in groupNameList"
            :key="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
      </el-form-item>
    </el-form>
    <!--表格内容栏-->
    <kt-table
      :height="600"
      :maxHeight="600"
      :btnWidth="90"
      permsDetail=""
      permsEdit=""
      permsDelete=""
      :data="pageResult"
      :columns="filterColumns"
      :showBtnEdit="false"
      :showBtnDelete="false"
      :showBatchDelete="false"
      @findPage="findPage"
    />
  </div>
</template>

<script>
  import { queryBean } from "@/http/base";
  import KtTable from "@/views/Core/PaperExamTable"
  import KtButton from "@/views/Core/KtButton"
  export default {
    name: 'exam-score-stat',
    components:{
      KtTable,
      KtButton
    },
    data() {
      return {
        filters: {
          tag: 'baseType',
          groupName: ''
        },
        groupNameList: [
          { value: 1, label: '易'},
          { value: 2, label: '较易'},
          { value: 3, label: '中'},
          { value: 4, label: '较难'},
          { value: 5, label: '难'}
        ],
        tagList: [
          { value: 'baseType', label: '题型'},
          { value: 'difficulty', label: '难度'},
          { value: 'topic', label: '知识点'}
        ],
        pageResult: [],
        filterColumns: [],
        columns: []
      }
    },
    created() {
      this.initColumns();
    },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        let pageRequest={
          pageNum: 1,
          pageSize: 10 ,
          sort:{
            insertDt:-1,
          },
          condition:{}
        };
        if(data !== null) {
          pageRequest = data.pageRequest
        }
        pageRequest.condition.tag = this.filters.tag;
        if (this.filters.tag === 'baseType') {
          pageRequest.condition.groupName = this.filters.groupName;
        }
        queryBean('QuestGroupStat', pageRequest.condition, pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      // 处理表格列过滤显示
      initColumns: function () {
        this.columns = [
          /*{prop:"id", label:"ID", minWidth:50},*/
          {prop:"name", label:"统计名称", minWidth:120},
          {prop:"answerTime", label:"答题次数", minWidth:120},
          {prop:"createAnnual", label:"正确次数", minWidth:120},
          {prop:"correctRate", label:"正确率", minWidth:120},
          {prop:"sumScore", label:"总得分", minWidth:120},
          {prop:"avgScore", label:"平均分", minWidth:120}
        ];
        // this.filterColumns = JSON.parse(JSON.stringify(this.columns));
        this.filterColumns = this.columns;
      },
    }
  }
</script>

<style scoped>

</style>
