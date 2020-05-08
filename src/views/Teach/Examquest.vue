<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.subject" placeholder="题目"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="" type="primary" @click="handleAdd" />
        </el-form-item>
        <el-form-item>
          <kt-button  icon="el-icon-upload" label="批量添加" perms="" type="primary" @click="handleBatchAdd" />
        </el-form-item>
      </el-form>
    </div>
    <div class="toolbar" style="float:right;padding-top:10px;padding-right:15px;">
      <el-form :inline="true" :size="size">
        <el-form-item>
          <el-button-group>
            <el-tooltip content="刷新" placement="top">
              <el-button icon="fa fa-refresh" @click="findPage(null)"></el-button>
            </el-tooltip>
            <el-tooltip content="列显示" placement="top">
              <el-button icon="fa fa-filter" @click="displayFilterColumnsDialog"></el-button>
            </el-tooltip>
            <el-tooltip content="导出" placement="top">
              <el-button icon="fa fa-file-excel-o"></el-button>
            </el-tooltip>
          </el-button-group>
        </el-form-item>
      </el-form>
      <!--表格显示列界面-->
      <table-column-filter-dialog ref="tableColumnFilterDialog" :columns="columns"
                                  @handleFilterColumns="handleFilterColumns">
      </table-column-filter-dialog>
    </div>
    <!--表格内容栏-->
    <kt-table :height="460"
              :maxHeight="600"
              :btnWidth="180"
              permsEdit=""
              permsDelete=""
              :data="pageResult"
              :columns="filterColumns"
              @findPage="findPage"
              @handleEdit="handleEdit"
              @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog
      :title="operation?'新增':'编辑'"
      width="40%" :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      append-to-body
      v-if="dialogVisible">
      <el-form :model="dataForm" label-width="120px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right" :disabled="isQuote">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="题型" prop="type">
          <el-select
            v-model="dataForm.type"
            placeholder="请选择"
            :disabled="operation?false:true"
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
          <el-input  v-model="dataForm.subject" :rows="2" type="textarea" auto-complete="off"></el-input>
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
              {{AnswerType[index]+'、'+item}}
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
      <div v-if="isQuote">
        <p style="line-height: 30px;font-size: 18px;">被引用的试卷列表</p>
        <el-table
          :data="paperQuoteData"
          size="mini"
          border
          style="width: 100%">
          <el-table-column
            prop="name"
            label="试卷名称">
          </el-table-column>
          <el-table-column
            prop="scoreSum"
            label="总分值"
            width="100">
          </el-table-column>
          <el-table-column
            prop="status"
            width="100"
            :formatter="statusFilter"
            label="状态">
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" v-if="!isQuote" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
    <!--批量新增界面-->
    <el-dialog title="批量添加" width="60%" :visible.sync="dialogVisibleBatch" :close-on-click-modal="false" append-to-body>
      <div class="batchAddHeader">
        <el-upload
          ref="upload"
          action="/"
          :show-file-list="false"
          :on-change="importExcel"
          :auto-upload="false">
          <kt-button
            slot="trigger"
            icon="el-icon-upload"
            label="批量导入"
            perms="teach:curriculum:edit"
            type="primary" />
        </el-upload>
        <a href="/static/试题模板.xlsx" download="试题模板.xlsx">下载模板</a>
      </div>
      <div>
        <el-table
          ref="tableData"
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 100%"
          class="loading-area">
          <el-table-column prop="subject" label="题目">
          </el-table-column>
          <el-table-column prop="type" label="题型" width="80px">
            <template slot-scope="scope">
              {{type[scope.row.type]}}
            </template>
          </el-table-column>
          <el-table-column prop="option" label="选择">
            <template slot-scope="scope">
              <div v-if="scope.row.type===1 || scope.row.type===2">
                <p v-for="(item,index) in scope.row.option" :key="index">{{AnswerType[index]+'、'+item}}</p>
              </div>
              <div v-if="scope.row.type===3">
                <span>正确</span>
                <span>错误</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="answers" label="答案">
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" width="50px">
            <template slot-scope="scope">
              {{difficulty[scope.row.difficulty]}}
            </template>
          </el-table-column>
          <el-table-column prop="scoreWeight" label="分值权重" width="80px">
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisibleBatch = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="BatchAdd" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import PopupTreeInput from "@/components/PopupTreeInput"
  import KtTable from "@/views/Core/ExamQuestTable"
  import KtButton from "@/views/Core/KtButton"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format } from "@/utils/datetime"
  import {addBean, queryBean, updateBean,findMyExamPaper} from "@/http/base";
  import XLSX from 'xlsx'
  export default {
    name:'ExamQuest',
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog
    },
    data() {
      return {
        size: 'mini',
        filters: {

        },
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        pageResult: {},
        tableData:[], //批量导入试题列表
        operation: false, // true:新增, false:编辑
        dialogVisible: false, // 新增编辑界面是否显示
        dialogVisibleBatch:false, //批量新增界面是否显示
        editLoading: false,
        loading:false,
        dataFormRules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ]
        },
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
        deptData: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        option: '',
        optionAnswer:'',
        blankAnswer:'',
        fileList:[],
        imageList:[],
        dialogImageUrl:'',
        picVisible: false,
        isPic:false,
        AnswerType:['A','B','C','D','E','F'],
        type:['','单选题','多选题','判断题','填空题','问答题'],
        difficulty:['','简单','中等','困难'],
        paperQuoteData:[],
        isQuote:false
      }
    },
    watch:{
      editLoading:function(){
        if(this.editLoading === true){
          setTimeout(() =>{
            this.editLoading = false;
          },2000)
        }
      }
    },
    computed:{
      blankAnswerCount:function(){
        let temp = "____";
        let re=eval("/"+temp+"/ig");
        return this.dataForm.subject.match(re).length;
      }
    },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        if(data !== null) {
          this.pageRequest = data.pageRequest;
        }
        if(this.filters.subject){
          this.pageRequest.condition = {subject: this.filters.subject};
        }else{
          this.pageRequest.condition={};
        }
        this.$api.examquest.findPage(this.pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      // 批量删除
      handleDelete: function (params) {
        let condition={
          examQuestIds:[params.row.id]
        };
        let pageInfo={};
        findMyExamPaper('ExamPaper',condition).then(res =>{
          if(res.retCode === 0 && res.bean.total >0){
            if(res.bean.data.findIndex(item => item.status !== 0)>-1){
              this.isQuote=true;
            }else{
              this.isQuote=false;
            }
            this.paperQuoteData=res.bean.data;
          }else{
            this.isQuote=false;
          }

          if(this.isQuote){
            this.$alert('考试试卷已引用此题不能删除', '提示', {
              confirmButtonText: '确定',
              callback: action => {

              }
            });
          }else{
            this.$confirm('确认删除选中记录吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let data=[params.row];
              this.$api.examquest.batchDelete(data).then(res => {
                if (res.retCode === 0) {
                  this.$message({message: '删除成功', type: 'success'});
                  this.findPage(null)
                }
              }).catch(err =>{
                this.$message(err);
              })
            }).catch(() =>{

            })
          }
        }).catch(err =>{
          this.$message(err);
        });

      },
      // 显示新增界面
      handleAdd: function () {
        this.isQuote=false;
        this.imageList=[];
        this.isPic=false;
        this.dialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          subject: '',
          type: '',
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
      // 显示编辑界面
      handleEdit: function (params) {
        this.isPaperQuote(params.row.id);

        this.dialogVisible = true;
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
      // 编辑
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
              if(params.type==='4'){
                if (params.blankAnswer.length < this.blankAnswerCount) {
                  this.$message('填空题答案少于题目填空“____”的数量。');
                  return;
                }
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
                this.dialogVisible = false;
                this.$refs['dataForm'].resetFields();
                this.findPage(null)
              })
            })
          }
        })
      },
      // 处理表格列过滤显示
      displayFilterColumnsDialog: function () {
        this.$refs.tableColumnFilterDialog.setDialogVisible(true)
      },
      // 处理表格列过滤显示
      handleFilterColumns: function (data) {
        this.filterColumns = data.filterColumns
        this.$refs.tableColumnFilterDialog.setDialogVisible(false)
      },
      // 处理表格列过滤显示
      initColumns: function () {
        this.columns = [
          /*{prop:"id", label:"ID", minWidth:50},*/
          {prop:"subject", label:"题目", minWidth:120},
          {prop:"type", label:"题型", minWidth:120,formatter:this.typeFilter},
          {prop:"note", label:"答案解释", minWidth:120},
          {prop:"difficulty", label:"难度级别", minWidth:100,formatter:this.difficultyFilter},
          // {prop:"area", label:"占地面积(m)", minWidth:120},
          // {prop:"netWork", label:"网络情况", minWidth:100},
          // {prop:"createBy", label:"创建人", minWidth:120},
          // {prop:"insertDt", label:"创建时间", minWidth:120,formatter:this.dateFormat}
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ];
        // this.filterColumns = JSON.parse(JSON.stringify(this.columns));
        this.filterColumns = this.columns;
      },
      //题型过滤
      typeFilter:function(row, column, cellValue, index){
        if(row.type === 1){
          return '单选题';
        }else if(row.type === 2){
          return '多选题';
        }else if(row.type === 3){
          return '判断题';
        }else if(row.type === 4){
          return '填空题';
        }else if(row.type === 5){
          return '问答题';
        }else{
          return '';
        }
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
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){
        return format(row[column.property])
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
        if (this.dataForm.blankAnswer.length >= this.blankAnswerCount) {
          this.$message('填空题答案不能多于题目填空“____”的数量。')
        }else{
          if(this.blankAnswer===''){
            this.$message('填空题答案不能为空，请输入内容')
          }else{
            this.dataForm.blankAnswer.push(this.blankAnswer);
            this.blankAnswer='';
          }
        }


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
        this.dataForm.option=fileList.map(item =>{ return item.response});
        console.log(this.dataForm.option);
      },
      isPicHandle:function(){
        this.isPic=!this.isPic;
        this.imageList=[];
        this.dataForm.option=[]
      },
      //批量添加用户显示界面
      handleBatchAdd:function(){
        this.tableData=[];
        this.dialogVisibleBatch = true
      },
      //批量导入excle
      importExcel(file) {
        //let file = file.files[0]; // 使用传统的input方法需要加上这一步
        const types = file.name.split('.')[1];
        const fileType = ['xlsx', 'xlc', 'xlm', 'xls', 'xlt', 'xlw', 'csv'].some(item => item === types);

        if (!fileType) {
          this.$message('格式错误！请重新选择')
          return
        }else {
          var that = this;
          that.loading = true;
          setTimeout(function () {
            that.file2Xce(file).then(tabJson => {
              if (tabJson && tabJson.length > 0) {
                that.tableData= tabJson[0].sheet;
                console.log(that.tableData);
                that.loading = false;
                // xlsxJson就是解析出来的json数据,数据格式如下
                // [
                //   {
                //     sheetName: sheet1
                //     sheet: sheetData
                //   }
                // ]
              }
            })
          },1000)

        }

      },
      file2Xce(file) {
        var that = this;
        return new Promise(function(resolve, reject) {
          const reader = new FileReader();
          reader.onload = function(e) {
            const data = e.target.result;
            this.wb = XLSX.read(data, {
              type: 'binary'
            });
            const result = [];
            this.wb.SheetNames.forEach((sheetName) => {
              // console.log(XLSX.utils.sheet_to_json(this.wb.Sheets[sheetName]))
              result.push({
                sheetName: sheetName,
                sheet: XLSX.utils.sheet_to_json(this.wb.Sheets[sheetName])
              });
            });
            console.log(result[0].sheet);
            that.oldtableData=result[0].sheet;
            result[0].sheet = result[0].sheet.map(function (item,index) {
              let arr={};
              let type;
              let difficulty;
              let option;
              if(item['题目类型']==='单选题'){
                type=1
              }else if(item['题目类型']==='多选题'){
                type=2
              }else if(item['题目类型']==='判断题'){
                type=3
              }else if(item['题目类型']==='填空题'){
                type=4
              }else if(item['题目类型']==='问答题'){
                type=5
              }else{
                type=null
              }
              if(item['难度级别']==='简单'){
                difficulty=1
              }else if(item['难度级别']==='中等'){
                difficulty=2
              }else if(item['难度级别']==='困难'){
                difficulty=3
              }else{
                difficulty=null
              }

              if(type===1 || type===2){
                console.log(item['选项']);
                option=item['选项'].split('\\');
              }else{
                option=[];
              }
              arr['subject'] =  item['题目'];
              arr['type'] = type;
              arr['option'] =  option;
              arr['answers'] =  item['答案'];
              arr['note'] =  item['答案解析'];
              arr['difficulty'] =  difficulty;
              arr['scoreWeight'] =  item['分值'];

              return arr;
            });
            resolve(result)
          };
          reader.readAsBinaryString(file.raw)
          // reader.readAsBinaryString(file) // 传统input方法
        })
      },
      typeStr:function(a){
        let index;
        if(a==='a'){
          index=0
        }else if(a==='b'){
          index=1
        }else if(a==='c'){
          index=2
        }else if(a==='d'){
          index=3
        }else{
          index=null
        }
        return index;
      },
      //批量添加按钮
      BatchAdd:function () {
        var that = this;
        this.editLoading = true;
        if(that.tableData){
          let postData=that.tableData.map((item) =>{
            if(item.type===1){
              item.optionAnswer=[that.typeStr(item.answers)]
            }else if(item.type===2){
              let answers=item.answers.split('\\');
              item.optionAnswer=answers.map(ite =>{
                return that.typeStr(ite)
              })
            }else if(item.type===3){
              if(item.answers==='正确'){
                item.tfAnswer=true;
              }else{
                item.tfAnswer=false;
              }
            }else if(item.type===4){
              item.blankAnswer=item.answers.split('\\');
            }else if(item.type===5){
              item.content=item.answers
            }
            return item
          });
          console.log(postData);
          this.$api.examquest.addBatchBean(postData)
            .then(function (res) {
              if(res.retCode === 0){
                that.$message("导入成功");
                that.editLoading = false;
                that.dialogVisibleBatch=false;
                that.findPage(null);
                that.tableData = [];
              }
            }).catch(function (error) {
            that.$message(error);
          })
        }else{
          that.$message("导入为空");
        }

      },
      //是否被试卷引用
      isPaperQuote:function(id){
        let condition={
          examQuestIds:[id]
        };
        let pageInfo={};
        findMyExamPaper('ExamPaper',condition).then(res =>{
          if(res.retCode === 0 && res.bean.total >0){
            console.log(res.bean.data);
            if(res.bean.data.findIndex(item => item.status !== 0)>-1){
              this.isQuote=true;
            }else{
              this.isQuote=false;
            }
            this.paperQuoteData=res.bean.data;
          }else{
            this.isQuote=false;
          }
          return this.isQuote
        }).catch(err =>{
          this.$message(err);
        })
      },
      //过滤状态字段
      statusFilter:function(row, column, cellValue, index) {
        if (row.status === 0) {
          return '未发布';
        } else if (row.status === 1) {
          return '启用';
        } else {
          return '停用';
        }
      }
    },
    mounted() {
      // this.findDeptTree();
      this.initColumns()
    }
  }
</script>

<style scoped>
  .batchAddHeader{
    display: flex;
    justify-content:  flex-start;
    align-items:center;
  }
  .batchAddHeader a{padding-left:20px;text-decoration: none;}
  .optionMenu{
    border:1px solid #f1f1f1;
    padding:10px;
    margin-top:10px;
    width:80%;
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
  .optionMenu p .el-button--mini.is-circle{
    padding:3px;
  }
</style>
