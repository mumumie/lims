<template>
  <el-dialog
    title="添加"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    append-to-body
    width="60%">
    <el-col :span="6"><el-input v-model="keyword" placeholder="请输入内容" size="mini"></el-input></el-col>
    <el-col :span="6">
      <el-button type="success" @click="handleKeyword" size="mini">搜索</el-button>
      <el-button type="danger" @click="addHandle" size="mini">增加</el-button>
    </el-col>
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
        label="题目名称"
        prop="subject"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        label="难度"
        prop="difficulty"
        align="center"
        :formatter="difficultyFilter"
        width="100">
      </el-table-column>
      <el-table-column
        label="分值"
        prop="scoreWeight"
        align="center"
        width="100">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        align="center"
        width="100">
        <template slot-scope="scope">
          <el-button
            @click="EditHandle(scope.$index, scope.row)"
            type="text"
            size="mini">
            编辑
          </el-button>
        </template>
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
      <el-button @click="addQuestion">添加</el-button>
      <el-button @click="handleClose">取消选择</el-button>
    </div>
    <!--新增编辑界面-->
    <el-dialog
      :title="operation?'新增':'编辑'"
      width="40%" :visible.sync="ADDdialogVisible"
      :close-on-click-modal="false"
      append-to-body
      v-if="ADDdialogVisible">
      <el-form :model="dataForm" label-width="120px" :rules="dataFormRules" ref="dataForm" size="mini"
               label-position="right">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="题型" prop="type">
          <el-select
            v-model="dataForm.type"
            placeholder="请选择"
            disabled
            @change="changeType(dataForm.type)"
            style="width: 100%;">
            <el-option label="单选" value="1"></el-option>
            <el-option label="多选" value="2"></el-option>
            <el-option label="判断题" value="3"></el-option>
            <el-option label="填空题" value="4"></el-option>
            <el-option label="问答" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题目" prop="subject">
          <el-input type="textarea" v-model="dataForm.subject" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="选择题选项" prop="option" v-if="dataForm.type && (dataForm.type==='1'|| dataForm.type==='2')">
          <el-input v-model="option" auto-complete="off" style="width:60%" @keyup.enter.native="addOption" v-if="!isPic"></el-input>
          <el-button type="success" size="mini" @click="addOption" icon="el-icon-plus" circle v-if="!isPic"></el-button>
          <el-tooltip effect="dark"  :content="isPic?'切换文字选项':'切换图片选项'" placement="top-start">
            <el-button type="primary" size="mini" @click="isPicHandle" :icon="isPic?'el-icon-edit':'el-icon-picture'" :disabled="operation?false:true" circle></el-button>
          </el-tooltip>
          <el-upload
            v-if="isPic"
            class="uploadPic"
            :action="global.baseUrl+'/thumb'"
            list-type="picture-card"
            name="image"
            :file-list="imageList"
            :on-preview="handlePictureCardPreview"
            :on-success="handleImgSuccess"
            :on-remove="handleImgRemove">
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="picVisible" v-if="isPic" append-to-body>
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
          <div class="optionMenu" v-if="!isPic">
            <p v-for="(item,index) in dataForm.option" :key="index">
              {{item}}
              <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="deleteOption(index)"></el-button>
            </p>
          </div>
        </el-form-item>
        <el-form-item label="选择题答案" prop="optionAnswer" v-if="dataForm.type && (dataForm.type==='1'|| dataForm.type==='2')">
          <el-select
            v-if="dataForm.type==='2'"
            v-model="dataForm.optionAnswer"
            placeholder="请选择"
            multiple
            style="width: 100%;">
            <el-option :label="isPic?'图片'+(index+1):item" :value="index" v-for="(item,index) in dataForm.option" :key="index"></el-option>
          </el-select>
          <el-select
            v-if="dataForm.type==='1'"
            v-model="dataForm.optionAnswerString"
            placeholder="请选择"
            style="width: 100%;">
            <el-option :label="isPic?'图片'+(index+1):item" :value="index" v-for="(item,index) in dataForm.option" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="判断题答案" prop="tfAnswer"  v-if="dataForm.type && dataForm.type==='3'">
          <el-radio-group v-model="dataForm.tfAnswer" size="small">
            <el-radio label="1">正确</el-radio>
            <el-radio label="0">错误</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="填空题答案" prop="blankAnswer"  v-if="dataForm.type && dataForm.type==='4'">
          <el-input v-model="blankAnswer" auto-complete="off" style="width:60%" @keyup.enter.native="addBlankAnswer"></el-input>
          <el-button type="success" size="mini" @click="addBlankAnswer" icon="el-icon-plus" circle></el-button>
          <div class="optionMenu">
            <p v-for="(item,index) in dataForm.blankAnswer" :key="index">
              {{item}}
              <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="deleteBlankAnswer(index)"></el-button>
            </p>
          </div>
        </el-form-item>
        <el-form-item label="问答题附件" prop="filePath" v-if="dataForm.type && dataForm.type==='5'">
          <el-upload
            class="upload-demo"
            :action="global.baseUrl+'/fileupload'"
            name="file"
            :on-remove="handleFileRemove"
            :on-change="handleFileChange"
            :file-list="fileList">
            <el-button size="mini" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="问答题答案" prop="content" v-if="dataForm.type && dataForm.type==='5'">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
            v-model="dataForm.content">
          </el-input>
        </el-form-item>
        <el-form-item label="答案解析" prop="note">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
            v-model="dataForm.note">
          </el-input>
        </el-form-item>
        <el-form-item label="难度级别" prop="difficulty">
          <el-select
            v-model="dataForm.difficulty"
            placeholder="请选择"
            style="width: 100%;">
            <el-option label="简单" value="1"></el-option>
            <el-option label="中等" value="2"></el-option>
            <el-option label="困难" value="3"></el-option>
          </el-select>

        </el-form-item>
        <el-form-item label="分值权重" prop="scoreWeight">
          <el-input v-model="dataForm.scoreWeight" auto-complete="off" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click.native="ADDdialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
  import {queryBean,searchBean} from "@/http/base";
  export default {
    name: "questionSelect",
    props:['dialogVisible','type'],
    data(){
      return{
        tableData:[],
        keyword:'',
        pageSize:10,
        currentPage:1,
        pageno:0,
        total:0,
        multipleSelection:[],
        dataFormRules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ]
        },
        operation: false, // true:新增, false:编辑
        ADDdialogVisible:false,
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          subject: '',
          type: '',
          option:[],
          optionAnswer:[],
          optionType:0,
          optionAnswerString:'',
          blankAnswer:[],
          tfAnswer:'-1',
          filePath:[],
          note:'',
          content:'',
          difficulty:'',
          scoreWeight:1.0
        },
        editLoading:false,
        isPic:false,
        imageList:[],
        fileList:[],
        option:'',
        blankAnswer:'',
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
        let condition={
          'type':this.type,
          'subject.regex':this.keyword
        };
        let pageInfo={
          pageSize:this.pageSize,
          pageNum:this.pageno,
          sort: {
            insertDt: -1
          }
        };
        queryBean('ExamQuest', condition,pageInfo).then(res =>{
          if(res.retCode===0){
            this.tableData=res.bean.data;
            this.total=res.bean.total;
          }
        })
      },
      getTableData1:function(type){
        console.log(type);
        let condition={
          'type':type,
        };
        let pageInfo={
          pageSize:this.pageSize,
          pageNum:1,
          sort: {
            insertDt: -1
          }
        };
        queryBean('ExamQuest', condition ,pageInfo).then(res =>{

          if(res.retCode===0){
            this.tableData=res.bean.data;
            this.total=res.bean.total;
          }
        })
      },
      //题型过滤
      difficultyFilter:function(row, column, cellValue, index){
        if(row.difficulty === 1){
          return '简单';
        }else if(row.difficulty === 2){
          return '中等';
        }else if(row.difficulty === 3){
          return '困难';
        }else{
          return '';
        }
      },
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        this.pageno=val;
        this.getTableData();
        console.log(`当前页: ${val}`);
      },
      handleKeyword:function(){
        this.getTableData();
      },
      handleClose:function(){

        this.$emit('dialogVisible',false);
        this.keyword='';
      },
      addQuestion:function(){
        console.log(this.multipleSelection);
        let data={
          tableData:this.multipleSelection,
          type:this.type
        };

        this.$emit('changeQuestion',data);
        this.keyword='';
      },
      handleFileChange(file, fileList) {
        this.fileList = fileList.slice(-3);
        console.log(this.fileList);
      },
      handleFileRemove(file, fileList) {
        this.fileList = fileList;
        console.log(this.fileList);
      },
      handleImgRemove(file, fileList) {
        console.log(fileList);
        this.imageList=fileList;
        this.dataForm.option=fileList.map(item =>{item.response})
      },
      handlePictureCardPreview(file) {
        console.log(file);
        this.dialogImageUrl = file.url;
        this.picVisible = true;
      },
      handleImgSuccess:function(response, file, fileList){
        this.imageList = fileList.slice(-4);
        console.log(this.imageList);
        this.dataForm.option=fileList.map(item =>{ return item.response});
        console.log(this.dataForm.option);
      },
      deleteBlankAnswer:function(index){
        this.dataForm.blankAnswer.splice(index,1);
      },
      changeType:function(val){
        this.dataForm = {
          id: 0,
          subject: '',
          type:val,
          option:[],
          optionAnswer:[],
          optionAnswerString:'',
          blankAnswer:[],
          tfAnswer:'-1',
          filePath:[],
          note:'',
          difficulty:'',
          scoreWeight:'1'
        }
      },
      addOption:function(){
        if(this.option===''){
          this.$message('选项不能为空，请输入内容')
        }else{
          this.dataForm.option.push(this.option);
          this.option='';
        }
      },
      deleteOption:function(index){
        this.dataForm.option.splice(index,1);
      },
      addBlankAnswer:function(){
        if(this.blankAnswer===''){
          this.$message('填空题答案不能为空，请输入内容')
        }else{
          this.dataForm.blankAnswer.push(this.blankAnswer);
          this.blankAnswer='';
        }
      },
      addHandle:function(){
        this.imageList=[];
        this.isPic=false;
        this.ADDdialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          subject: '',
          type: String(this.type),
          option:[],
          optionType:0,
          optionAnswer:[],
          optionAnswerString:'',
          tfAnswer:'-1',
          blankAnswer:[],
          filePath:[],
          content:'',
          note:'',
          difficulty:'',
          scoreWeight:1.0
        }
      },
      EditHandle:function(index,row){
        let params={index:index, row:row};
        this.ADDdialogVisible = true;
        this.operation = false;
        this.dataForm = Object.assign({}, params.row);
        this.dataForm.type=String(this.dataForm.type);
        this.dataForm.difficulty=String(this.dataForm.difficulty);
        this.dataForm.scoreWeight=String(this.dataForm.scoreWeight);
        if(this.dataForm.tfAnswer===false){
          this.dataForm.tfAnswer='0';
        }else if(this.dataForm.tfAnswer===true){
          this.dataForm.tfAnswer='1';
        }else{
          this.dataForm.tfAnswer=null;
        }
        if(params.row.type===1){
          this.$set(this.dataForm,'optionAnswerString',this.dataForm.optionAnswer[0]);
        }
        if(params.row.type===5){
          let fileList=params.row.filePath.map((item) =>{
            let fileTyle=item.split('.').slice(-1).toString();
            let name=item.split('files/')[1].split('-').slice(0,-1).toString()+'.'+fileTyle;
            return {
              name:name,
              response:item
            }
          });
          this.fileList=fileList;
        }
        if(this.dataForm.optionType===1){
          this.isPic=true;
          let imgList=params.row.option.map((item) =>{
            return {
              url:this.global.baseUrl+item,
              response:item
            }
          });
          this.imageList=imgList;
        }else{
          this.isPic=false;
        }
        console.log(params.row);
      },
      submitForm: function () {
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              if(params.tfAnswer==='1'){
                params.tfAnswer=true;
              }else if(params.tfAnswer==='0'){
                params.tfAnswer=false;
              }else{
                params.tfAnswer=null;
              }
              if(params.type==='1'){
                params.optionAnswer=[params.optionAnswerString];
              }
              if(params.type==='2'){
                params.optionAnswer=params.optionAnswer.sort();
              }
              if(params.type==='5'){
                params.filePath=this.fileList.map((item) =>{
                  return item.response;
                });
              }
              if(this.isPic===false){
                params.optionType=0;
              }else{
                params.optionType=1;
              }
              this.$api.examquest.save(params).then((res) => {
                this.editLoading = false;
                this.ADDdialogVisible = false;
                this.$refs['dataForm'].resetFields();
                this.getTableData()
              })
            })
          }
        })
      },
      isPicHandle:function(){
        this.isPic=!this.isPic;
        this.imageList=[];
        this.dataForm.option=[]
      },
    },
    created(){

    }
  }
</script>
<style scoped>
  .optionMenu{
    border:1px solid #f1f1f1;
    padding:10px;
    margin-top:10px;
    width:60%;
    min-height:30px;
  }
  .optionMenu p{
    margin:0;
    line-height: 30px;
    padding-left:10px;
    padding-right:30px;
    position:relative;
    font-size: 12px;
  }
  .optionMenu p:hover{
    background: #f9f9f9;
  }
  .optionMenu p  button{
    position:absolute;
    right:0;
    top:5px;
  }
  .uploadPic{
    margin-top:10px;
  }
</style>
<style>
  .uploadPic .el-upload--picture-card{
    width: 50px;
    height:50px;
    line-height:50px;
  }
  .uploadPic .el-upload--picture-card i{
    font-size: 20px;
  }
  .uploadPic .el-upload-list--picture-card .el-upload-list__item{
    width: 50px;
    height:50px;
    line-height:50px;
  }
  .uploadPic .el-upload-list--picture-card .el-upload-list__item-actions span+span{
    margin-left:5px;
  }
</style>
