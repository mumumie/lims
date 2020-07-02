<template>
  <div class="page-container">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
      <el-form-item>
        <el-select v-model="filters.type" clearable placeholder="请选择用户组" style="width:120px;">
          <el-option label="部门" :value="0"></el-option>
          <el-option label="班级" :value="1"></el-option>
        </el-select>
      </el-form-item>
			<el-form-item>
				<el-input v-model="filters.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
				<kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:dept:view" type="primary" @click="findTreeData"/>
			</el-form-item>
			<el-form-item>
				<kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:dept:add" type="primary" @click="handleAdd"/>
			</el-form-item>
		</el-form>
	</div>
	<!--表格树内容栏-->
    <el-table
      :data="tableTreeDdata"
      stripe size="mini"
      style="width: 100%;"
      rowKey="id"
      v-loading="loading"
      :tree-props="{children: 'children'}"
      element-loading-text="$t('action.loading')">
      <!-- <el-table-column
        prop="id" header-align="center" align="center" width="80" label="ID">
      </el-table-column>-->
      <el-table-column
        prop="name" header-align="center" align="left" label="用户组名称">
      </el-table-column>
      <el-table-column
        prop="parentName" header-align="center" align="center" width="120" label="上级用户组">
      </el-table-column>
      <el-table-column
        prop="orderNum" header-align="center" align="center" label="上级用户组ID">
      </el-table-column>
      <el-table-column
        prop="createTime" header-align="center" align="center" label="创建时间" :formatter="dateFormat">
      </el-table-column>
      <el-table-column
        prop="orderNum" header-align="center" align="center" label="状态">
      </el-table-column>
      <el-table-column
        fixed="right" header-align="center" align="center" width="185" :label="$t('action.operation')">
        <template slot-scope="scope">
          <kt-button icon="fa fa-edit" :label="$t('action.edit')" perms="sys:dept:edit" @click="handleEdit(scope.row)"/>
          <kt-button icon="fa fa-trash" :label="$t('action.delete')" perms="sys:dept:delete" type="danger" @click="handleDelete(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增修改界面 -->
    <el-dialog :title="operation ? '新增' : '修改'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="submitForm()"
        label-width="80px" :size="size" style="text-align:left;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="上级用户组" prop="parentName">
            <popup-tree-input
              :data="popupTreeData"
              :props="popupTreeProps"
              :prop="dataForm.parentName"
              :nodeKey="''+dataForm.parentId"
              :currentChangeHandle="handleTreeSelectChange">
            </popup-tree-input>
        </el-form-item>
        <el-form-item label="用户组类型">
          <el-select v-model="dataForm.type" clearable placeholder="请选择用户组" >
            <el-option label="部门" :value="0"></el-option>
            <el-option label="班级" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否停用" v-if="!operation">
          <el-select v-model="dataForm.status" placeholder="请选择" >
            <el-option label="启动" :value="0"></el-option>
            <el-option label="停用" :value="1"></el-option>
          </el-select>
        </el-form-item>
<!--        <el-form-item v-if="dataForm.type !== 2" label="排序编号" prop="orderNum">-->
<!--          <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序编号"></el-input-number>-->
<!--        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :size="size"  @click="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size"  type="primary" @click="submitForm()">{{$t('action.comfirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import KtButton from "@/views/Core/KtButton"
import TableTreeColumn from '@/views/Core/TableTreeColumn'
import PopupTreeInput from "@/components/PopupTreeInput"
import FaIconTooltip from "@/components/FaIconTooltip"
import { format } from "@/utils/datetime"
export default {
	components:{
    PopupTreeInput,
    KtButton,
    TableTreeColumn,
    FaIconTooltip
	},
	data() {
		return {
			size: 'small',
			loading: false,
			filters: {
				name: '',
        type: ''
      },
      tableTreeDdata: [],
      dialogVisible: false,
      dataForm: {
        id: 0,
        name: '',
        parentId: 0,
        parentName: '',
        orderNum: 0
      },
      dataRule: {
        name: [
          { required: true, message: '用户组名称不能为空', trigger: 'blur' }
        ],
        parentName: [
          { required: true, message: '上级用户组不能为空', trigger: 'change' }
        ]
      },
      popupTreeData: [],
      popupTreeProps: {
				label: 'name',
				children: 'children'
			},
      operation:false,
		}
	},
	methods: {
		// 获取数据
    findTreeData: function () {
      let pageRequest ={};
      if(this.filters.type !== ''){
        pageRequest.type = this.filters.type
        delete pageRequest.level
      }else{
        pageRequest.level = 0;
        delete pageRequest.type
      }
      if(this.filters.name){
        pageRequest['name$regex'] = this.filters.name;
      }
      this.loading = true
			this.$api.dept.findDept(pageRequest).then((res) => {
        res.bean.data.forEach(v => {
          v.createTime = v.insertDt
        })
        this.tableTreeDdata = res.bean.data;
        this.loading = false
			})
    },
    // 获取用户组列表
    findDeptTree: function () {
      let postData = {
        level:0
      }
      this.$api.dept.findDept(postData).then((res) => {
        this.popupTreeData = res.bean.data;
      })
    },
		// 显示新增界面
		handleAdd: function () {
      this.operation =true;
			this.dialogVisible = true;
			this.dataForm = {
        id: 0,
        name: '',
        parentId: 0,
        parentName: '',
        orderNum: 0
      }
		},
		// 显示编辑界面
		handleEdit: function (row) {
      this.operation =false;
      this.dialogVisible = true;
      this.dataForm = Object.assign({}, row);
      console.log(this.dataForm);
    },
    // 删除
    handleDelete (row) {
      this.$confirm('确认删除选中记录吗？', '提示', {
				type: 'warning'
      }).then(() => {
        let params = this.getDeleteIds([], row)
        this.$api.dept.batchDelete(params).then( res => {
          this.findTreeData()
          this.$message({message: '删除成功', type: 'success'})
        })
      })
    },
    // 获取删除的包含子用户组的id列表
    getDeleteIds (ids, row) {
      ids.push({id:row.id})
      if(row.children != null) {
        for(let i=0, len=row.children.length; i<len; i++) {
          this.getDeleteIds(ids, row.children[i])
        }
      }
      return ids
    },
      // 用户组树选中
    handleTreeSelectChange (data, node) {
      this.dataForm.parentId = data.id
      this.dataForm.parentName = data.name
      console.log(data)
    },
    // 表单提交
    submitForm () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true
						let params = Object.assign({}, this.dataForm)
						this.$api.dept.save(params).then((res) => {
              this.editLoading = false
                this.dialogVisible = false
                this.$refs['dataForm'].resetFields()
							this.findTreeData()
						})
					})
				}
      })
    },
		// 时间格式化
    dateFormat: function (row, column, cellValue, index){
      return format(row[column.property])
    }

	},
	mounted() {
    this.findTreeData();
    this.findDeptTree()
	}
}
</script>

<style scoped>

</style>
