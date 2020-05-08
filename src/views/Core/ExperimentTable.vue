<template>
  <div>
    <!--表格栏-->
    <el-table
      class="ktTable"
      :data="data.content"
      :highlight-current-row="highlightCurrentRow"
      @selection-change="selectionChange"
      @current-change="handleCurrentChange"
      @sort-change="tableSortChange"
      v-loading="loading"
      :element-loading-text="$t('action.loading')"
      :border="border" :stripe="stripe"
      :show-overflow-tooltip="showOverflowTooltip"
      :max-height="maxHeight"
      :height="height"
      :size="size"
      :align="align"
      style="width:100%;" >
      <el-table-column type="selection" width="45" v-if="showBatchDelete & showOperation"></el-table-column>
      <el-table-column v-for="column in columns" header-align="center" align="center"
        :prop="column.prop" :label="column.label" :width="column.width" :min-width="column.minWidth" 
        :fixed="column.fixed" :key="column.prop" :type="column.type" :formatter="column.formatter"
        sortable="custom">
      </el-table-column>
      <el-table-column :label="$t('action.operation')"  :width="btnWidth" fixed="right" v-if="showOperation" header-align="center">
        <template slot-scope="scope">

          <kt-button icon="fa fa-edit" :label="$t('action.edit')" :perms="permsEdit" :size="size" @click="handleEdit(scope.$index, scope.row)" v-if="showBtnEdit"/>
          <kt-button icon="fa fa-trash" :label="$t('action.delete')" :perms="permsDelete" :size="size" type="danger" @click="handleDelete(scope.$index, scope.row)" v-if="showBtnDelete"/>
          <kt-button class="btns"  :label="isStatusPass(scope.row.status)" :perms="permsPass" :size="size" @click="handlePass(scope.$index, scope.row)" v-if="showBtnPass"/>
          <kt-button  class="btns" label="记录" :perms="permsRecord" :size="size" :disabled="scope.row.status === 0" @click="handleRecord(scope.$index, scope.row)" v-if="showBtnRecord"/>
          <kt-button class="btns" label="导入" :perms="permsRecord" :size="size" @click="handleApprove(scope.$index, scope.row)" v-if="showBtnApprove"/>
          <kt-button class="btns" label="创建" :perms="permsDetail" :size="size" @click="handleDetail(scope.$index, scope.row)" v-if="showBtnApprove"/>
        </template>
      </el-table-column>
    </el-table>
    <!--分页栏-->
    <div class="toolbar" style="padding:10px;">
      <kt-button :label="$t('action.batchDelete')" :perms="permsDelete" :size="size" type="danger" @click="handleBatchDelete()" 
        :disabled="this.selections.length===0" style="float:left;" v-if="showBatchDelete & showOperation"/>
      <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest" 
        :current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize" :total="data.totalSize" style="float:right;">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import KtButton from "@/views/Core/KtButton"
export default {
  name: 'KtTable',
  components:{
			KtButton
	},
  props: {
    columns: Array, // 表格列配置
    data: Object, // 表格分页数据
    permsEdit: String,  // 编辑权限标识
    permsDelete: String,  // 删除权限标识
    permsDetail:String,  //查看权限标识
    permsPass:String,  //通过权限标识
    permsRecord:String, //记录权限标识
    size: { // 尺寸样式
      type: String,
      default: 'mini'
    },
    align: {  // 文本对齐方式
      type: String,
      default: 'left'
    },
    maxHeight: {  // 表格最大高度
      type: Number,
      default: 420
    },
    height: {  // 表格最大高度
      type: Number,
      default: 250
    },
    showOperation: {  // 是否显示操作组件
      type: Boolean,
      default: true
    },
    border: {  // 是否显示边框
      type: Boolean,
      default: false
    },
    stripe: {  // 是否显示斑马线
      type: Boolean,
      default: true
    },
    highlightCurrentRow: {  // // 是否高亮当前行
      type: Boolean,
      default: true
    },
    showOverflowTooltip: {  // 是否单行显示
      type: Boolean,
      default: true
    },
    showBatchDelete: {  // 是否显示操作组件
      type: Boolean,
      default: true
    },
    showBtnDetail: {  // 是否显示详情
      type: Boolean,
      default: false
    },
    showBtnPass: {  // 是否显示通过按钮
      type: Boolean,
      default: false
    },
    showBtnApprove:{ //是否显示审批按钮
      type: Boolean,
      default: false
    },
    showBtnRecord:{  //是否显示考试按钮
      type: Boolean,
      default: false
    },
    showBtnEdit:{  // 是否显示编辑按钮
      type: Boolean,
      default: true
    },
    showBtnDelete:{  // 是否显示删除按钮
      type: Boolean,
      default: true
    },
    btnWidth:{
      type: Number,
      default: 185
    },
  },
  data() {
    return {
      // 分页信息
			pageRequest: {
				pageNum: 1,
        pageSize: 10,
        sort:{
          insertDt:-1,
        },
        condition:{}
      },
      loading: false,  // 加载标识
      selections: []  // 列表选中列
    }
  },
  methods: {
    // 分页查询
    findPage: function () {
        this.loading = true;
        let callback = res => {
          this.loading = false
        }
      this.$emit('findPage', {pageRequest:this.pageRequest, callback:callback})
    },
    // 选择切换
    selectionChange: function (selections) {
      this.selections = selections
      this.$emit('selectionChange', {selections:selections})
    },
    // 选择切换
    handleCurrentChange: function (val) {
      this.$emit('handleCurrentChange', {val:val})
    },
    // 换页刷新
		refreshPageRequest: function (pageNum) {
      this.pageRequest.pageNum = pageNum
      this.findPage()
    },
    // 编辑
		handleEdit: function (index, row) {
      this.$emit('handleEdit', {index:index, row:row})
		},
    // 详情
    handleDetail: function (index, row) {
      this.$emit('handleDetail', {index:index, row:row})
    },
    // 删除
		handleDelete: function (index, row) {
			this.delete(row.id)
		},
    // 通过
    handlePass: function (index, row) {
      this.$emit('handlePass', {index:index, row:row})
    },
    // 考试
    handleRecord: function (index, row) {
      this.$emit('handleRecord', {index:index, row:row})
    },
    //审批
    handleApprove:function(index, row){
      this.$emit('handleApprove', {index:index, row:row})
    },
		// 批量删除
		handleBatchDelete: function () {
			let ids = this.selections.map(item => item.id).toString();
			this.delete(ids)
		},
		// 删除操作
		delete: function (ids) {
			this.$confirm('确认删除选中记录吗？', '提示', {
				type: 'warning'
			}).then(() => {
				let params = []
				let idArray = (ids+'').split(',')
				for(var i=0; i<idArray.length; i++) {
					params.push({'id':idArray[i]})
        }
        this.loading = true
        let callback = res => {
          if(res.retCode == 0) {
            this.$message({message: '删除成功', type: 'success'})
            this.findPage()
          } else {

          }
          this.loading = false
        }
        this.$emit('handleDelete', {params:params, callback:callback})
			}).catch(() => {
			})
		},
    isStatus:function(val){
      if(val===0){
        return '未提交'
      }else if(val===1){
        return '待审批'
      }else{
        return '已批阅'
      }
    },
    isStatusPass:function(val){
      if(val===0){
        return '启用'
      }else if(val===1){
        return '停用'
      }else{
        return '启用'
      }
    },
    isStatusExam:function(row){
      if(row.myExamResult && row.myExamResult.status === 1){
        return '待批阅'
      }else if(row.myExamResult && row.myExamResult.status === 2){
        return '已批阅'
      }else{
        return '考试'
      }
    },
    tableSortChange(column) {
      if (column.order === 'descending') {
        this.pageRequest.sort={[column.prop]: -1};

      } else if(column.order === 'ascending') {
        this.pageRequest.sort={[column.prop]: 1};
      } else{
        this.pageRequest.sort={insertDt:-1}
      }
      this.findPage()
    }
  },
  mounted() {
    this.refreshPageRequest(1)
    // console.log(this.columns);
  }
}
</script>

<style scoped>
.cell button:nth-child(2n+1){
  margin-left:0 !important;
}
.cell button:nth-child(n+3){
  margin-top:10px;
}
  .btns{
    width:70px;
    padding:0;
    height:28px;
    line-height: 28px;
  }
</style>
