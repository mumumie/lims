<template>
  <div>
    <div>
      <QuestFilter
        ref="questId"
        :questBankData = "questBankData"
        :topicData = "topicData"
        :questBankId="questBankId"
        :pageInfo="null"
        :call="1"
        @closeChapterType="closeChapterType"
        @showQuest="showQuest">
      </QuestFilter>
    </div>
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      size="mini"
      :height="windowHeight"
      style="width: 100%"
      v-loading="tableLoading"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
      >
      </el-table-column>
      <el-table-column
        label="章节"
        prop="chapter"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        label="题型"
        prop="type"
        align="center">
      </el-table-column>
      <el-table-column
        label="难易度"
        prop="difficulty"
        align="center">
      </el-table-column>
      <el-table-column
        label="分值"
        prop="score"
        align="center">
      </el-table-column>
      <el-table-column
        label="创建人"
        prop="creator.name"
        align="center">
      </el-table-column>
      <el-table-column header-align="center" label="操作" width="50">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="预览" placement="top">
            <i class="el-icon-view"  @click="previewHandle(scope.$index, scope.row)"></i>
          </el-tooltip>

        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px">
      <el-button @click="addTeacherId">添加</el-button>
    </div>
    <!--    详情展示弹框-->
    <el-dialog
      width="500px"
      title="预览"
      append-to-body
      :visible.sync="detailVisible">
      <div class="detail_box" v-if="previewData.content">
        <h2>题目</h2>
        <div class="detail_content" v-html="previewData.content"></div>
        <div v-if="previewData.baseType === 1 || previewData.baseType === 2">
          <h2>选项</h2>
          <div v-for="(item,index) in previewData.option" class="detail_option">
            <div>{{AnswerType[index] + '、 '}}</div>
            <div v-html="item"></div>
          </div>
        </div>
        <h2>答案</h2>
        <div class="detail_content">
          <div v-if="previewData.baseType === 1 || previewData.baseType === 2">
            <i v-for="(optAsw,index) in previewData.optionAnswer" :key="index">{{AnswerType[optAsw] + ((previewData.optionAnswer.length-1)===index?'':'，') }}</i>
          </div>
          <div v-if="previewData.baseType === 3">
            <i>{{previewData.tfAnswer===true?'对': previewData.tfAnswer === false ? '错' : '-'}}</i>
          </div>
          <div v-if="previewData.baseType === 4">
            <div v-for="(item,index) in previewData.blankAnswer" style="display: flex;">
              <div>{{'填空' + (index+1) + '：'}}</div>
              <div v-html="item"></div>
            </div>
          </div>
          <div v-if="previewData.baseType === 5" v-html="previewData.subjectAnswer"></div>
        </div>
        <h2>解析</h2>
        <div class="detail_content"  v-html="previewData.remark"></div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="detailVisible = false">{{$t('action.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {queryBean} from "@/http/base";
  import QuestFilter from "./QuestFilter";
  export default {
    components: {QuestFilter},
    props:['questBankData','questBankId','chapterData','typeData','topicData','time'],
    data(){
      return{
        detailVisible:false,
        tableData:[],
        previewData:{},
        pageSize:10,
        currentPage:1,
        pageno:0,
        total:0,
        multipleSelection:[],
        AnswerType:['A','B','C','D','E','F'],
        formData:{
          chapter:[],
          type:[],
          difficulty:''
        },
        windowHeight: 400,
        tableLoading: false
      }
    },
    created() {
      this.windowHeight = document.body.clientHeight - 360;
    },
    methods:{
      closeChapterType(val) {
        this.tableLoading = val
      },
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
      },
      getTableData:function() {
        let condition = {
          questBankId: this.questBankId
        };
        if (this.time && this.time.length > 0) {
          condition['insetDt$bt'] = this.time
        } else {
          delete condition['insetDt$bt'];
        }
        if (this.formData.chapter.length > 0) {
          condition.chapter = this.formData.chapter
        } else {
          delete condition.chapter;
        }
        if (this.formData.type.length > 0) {
          condition.type = this.formData.type
        } else {
          delete condition.type;
        }
        if (this.formData.difficulty) {
          condition.difficulty = this.formData.difficulty
        } else {
          delete condition.difficulty;
        }
        let pageInfo = {
          pageNum: this.pageno,
          sort: {
            insertDt: -1
          }
        };
        queryBean('Quest', condition, pageInfo).then(res => {
          if (res.retCode === 0) {
            this.tableData = res.bean.data;
            this.total = res.bean.total;
          }
        })
      },
      showQuest:function(res){
        this.tableData=res.bean;
        this.tableLoading = false
      },
      addTeacherId:function(){
        if (this.multipleSelection.length === 0) {
          this.$message('请选择试题')
        }else{
          let tableData = this.multipleSelection;
          this.$emit('changeQuest',tableData);
        }
      },
      previewHandle:function(index,row){
        this.previewData = Object.assign({},row)
        this.detailVisible = true;
      }
    }
  }
</script>
<style scoped>
  .detail_box h2{
    margin:0;
  }
  .detail_content{
    padding:10px;
  }
  .detail_option{
    padding:5px 10px;
    display: flex;
  }
  .el-icon-view{
    cursor: pointer;
  }
</style>

