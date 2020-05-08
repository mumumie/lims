<template>
    <el-dialog
            title="添加"
            :visible.sync="dialogVisible"
            :before-close="handleClose"
            append-to-body
            width="60%">
        <el-col :span="6"><el-input v-model="keyword" placeholder="请输入内容" size="mini"></el-input></el-col>
        <el-col :span="6"><el-button type="success" @click="handleKeyword" size="mini">高级搜索</el-button></el-col>
        <el-table
                ref="multipleTable"
                :data="tableData"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange">
            <el-table-column
                    type="selection"
                    >
            </el-table-column>
            <el-table-column
                    v-for="item in tableNav"
                    :key="item"
                    :label="item"
                    :prop="item"
                    show-overflow-tooltip
                    width="120">
            </el-table-column>
        </el-table>
        <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :hide-on-single-page="true"
                :current-page.sync="currentPage"
                :page-size="pageSize"
                layout="prev, pager, next, jumper"
                :total="total">
        </el-pagination>
        <div style="margin-top: 20px">
            <el-button @click="addInputValue">添加</el-button>
            <el-button @click="toggleSelection()">取消选择</el-button>
        </div>

    </el-dialog>
</template>

<script>
    export default {
        name: "AddRefClass",
        props:['dialogVisible','name'],
        data(){
            return{
                tableData:[],
                tableNav:[],
                keyword:'',
                pageSize:10,
                currentPage:1,
                pageno:0,
                total:0,
                multipleSelection:[]
            }
        },
        methods:{
            toggleSelection(rows) {
                console.log(rows);
                if (rows) {
                    rows.forEach(row => {
                        this.$refs.multipleTable.toggleRowSelection(row);
                    });
                } else {
                    this.$refs.multipleTable.clearSelection();
                }
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
                console.log(this.multipleSelection)
            },
            getTableData:function(){
                this.tableNav=[];
                let postData={
                  typeName:this.name.refClass,
                  keyword:this.keyword,
                  pagesize:this.pageSize,
                  pageno:this.pageno
                };
                this.$api.data.findKeyWord(postData).then(res =>{
                    if(res.retCode===0){
                        this.tableData=res.bean.data;
                        this.total=res.bean.total;
                        if(res.bean.data[0]){
                            this.tableNav.push('id');
                            for(let key in res.bean.data[0]){
                                if(key!='id'&&key!='_id'&&key!='flag'&&key!='flag'&&key!='status'&&key!='insertDt'){
                                    this.tableNav.push(key);
                                }
                            }
                        }
                    }
                })
            },
            handleSizeChange(val) {
                console.log(`每页 ${val} 条`);
            },
            handleCurrentChange(val) {
                this.pageno=val-1;
                this.getTableData();
                console.log(`当前页: ${val}`);
            },
            handleKeyword:function(){
                this.getTableData();
            },
            handleClose:function(){
                this.$emit('dialogVisible',false)
            },
            addInputValue:function(){
                if(this.name.type==='String'){
                    if(this.multipleSelection.length!==1){
                        this.$message('最多只能添加一个')
                    }else{
                        if(this.multipleSelection[0]){
                            let value=this.multipleSelection[0][this.name.refField];
                            this.$emit('inputValue',value);
                            this.handleClose();
                        }else{
                            this.$message('请选择')
                        }

                    }
                }else if(this.name.type==='List'){
                    let that=this;
                    let value=this.multipleSelection.map(function(item){
                        return item[that.name.refField]
                    });
                    if(value.length>0){
                        this.$emit('inputValue',value);
                        this.handleClose();
                    }else{
                        this.$message('请选择')
                    }

                }

            }
        },
        created(){
            this.getTableData();
        }
    }
</script>

<style scoped>
    .el-table__header-wrapper>table{
        width:100%;
    }
</style>
