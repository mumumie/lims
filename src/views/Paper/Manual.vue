<template>
  <div>
    <tip :value="
    ['从题库中选择一批试题来组成试卷']"/>
    <el-form :model="formData" label-width="150px" :rules="formDataRules" style="margin-top:20px;" ref="formData" :size="size" label-position="right">
      <div class="form-data-flex">
        <el-form-item label="题库" prop="questBankId">
          <el-select v-model="formData.questBankId" placeholder="请选择课程" @change="questBankChangeHandle">
            <el-option :label="item.name" :value="item.id" v-for="item in questBankData"
                       :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="试卷名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入试卷名称" style="width:193px;"></el-input>
        </el-form-item>
        <el-form-item label="及格分数线" prop="passScore">
          <el-input v-model="formData.passScore" style="width:193px;"></el-input>
        </el-form-item>
        <el-form-item label="成卷学年" prop="createAnnual">
          <el-select v-model="formData.createAnnual" placeholder="请选择成卷学年">
            <el-option :label="item.label" :value="item.value" v-for="(item,index) in createAnnualData"
                       :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="试卷学期" prop="semester">
          <el-select v-model="formData.semester" placeholder="请选择试卷名称">
            <el-option label="第一学期" value="第一学期"></el-option>
            <el-option label="第二学期" value="第二学期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="考试日期" prop="date">
          <el-date-picker
            v-model="formData.date"
            style="width:190px;"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择一个日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="考试时间">
          <el-time-select
            placeholder="起始时间"
            style="width:190px;"
            v-model="formData.startTime"
            :picker-options="{start: '08:00',step: '00:05',end: '24:00'}">
          </el-time-select>
          <el-time-select
            placeholder="结束时间"
            style="width:190px;"
            v-model="formData.endTime"
            :picker-options="{start: '08:00',step: '00:05',end: '24:00',minTime: formData.startTime}">
          </el-time-select>
        </el-form-item>
        <el-form-item label="用户组范围" required>
          <el-cascader
            :options="deptData"
            v-model="formData.deptmentIds"
            :props="{multiple: true,checkStrictly: true}"
            collapse-tags
            clearable>
          </el-cascader>
        </el-form-item>
        <el-form-item label="考试类型">
          <el-select v-model="formData.type" placeholder="请选择考试类型">
            <el-option :label="item.label" :value="item.value" v-for="(item,index) in examTypeData"
                       :key="item.value"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <el-form-item label="试题列表">
        <div>
          <el-button icon="el-icon-circle-plus-outline" @click="addQuestId">题目选择器</el-button>
          <el-button icon="el-icon-delete" type="danger" @click="deleteQuestId">批量删除</el-button>
        </div>
        <el-table
          :data="questList"
          size="mini"
          height="400px"
          border
          @selection-change="handleSelectionChange"
          style="width: 100%;margin-top:20px;">
          <el-table-column
            type="selection"
            width="45">
          </el-table-column>
          <el-table-column
            header-align="center"
            prop="type"
            label="题型"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            header-align="center"
            prop="chapter"
            label="章节"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            header-align="center"
            prop="content"
            label="题干"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <div v-html="scope.row.content"></div>
            </template>
          </el-table-column>

          <el-table-column
            header-align="center"
            prop="difficulty"
            label="难易度"
            show-overflow-tooltip
            :formatter="(row) => {
              if (row.status === 1) return '易'
              if (row.status === 2) return '较易'
              if (row.status === 3) return '中'
              if (row.status === 4) return '较难'
              if (row.status === 5) return '难'
            }">
          </el-table-column>
          <el-table-column
            header-align="center"
            prop="scoreWeight"
            label="分值">
            <template slot-scope="scope">
              <el-input v-model.number="scope.row.score" type="number" min="1" size="mini"></el-input>
            </template>
          </el-table-column>
          <el-table-column header-align="center" label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="text" @click="handleDeleting(scope.$index, scope.row , questList)">删除</el-button>
              <el-button type="text" @click="handlePreview(scope.$index, scope.row)">预览</el-button>
              <el-button type="text" icon="el-icon-top" @click="handleAscending(scope.$index, scope.row , questList)"></el-button>
              <el-button type="text" icon="el-icon-bottom" @click="handleDescending(scope.$index, scope.row , questList)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item v-if="totalCount">
        <div>
          <div>总题量 {{totalCount}}</div>
          <div>总分 {{totalScore}}</div>
        </div>
        <el-table
          :data="scoreData"
          size="mini"
          style="width: 600px"
          border>
          <el-table-column
            align="center"
            prop="name"
            label="题型"
            width="180">
          </el-table-column>
          <el-table-column
            align="center"
            prop="count"
            label="题量"
            width="180">
          </el-table-column>
          <el-table-column
            align="center"
            prop="totalScore"
            label="题型总分">
          </el-table-column>
          <el-table-column
            align="center"
            prop="percentage"
            label="占总和比例">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="previewPaper">预览试卷</el-button>
        <el-button type="primary" @click="submitManual(-1)">保存试卷</el-button>
        <el-button type="primary" @click="submitManual(0)">保存并发布</el-button>
      </el-form-item>
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
              <i v-for="(optAsw,index) in previewData.optionAnswer" :key="index">{{AnswerType[optAsw] +
                ((previewData.optionAnswer.length-1)===index?'':'，') }}</i>
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
          <div class="detail_content" v-html="previewData.remark"></div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button :size="size" @click.native="detailVisible = false">{{$t('action.cancel')}}</el-button>
        </div>
      </el-dialog>
      <!--    试卷展示弹框-->
      <el-dialog
        width="600px"
        title="查看试卷"
        append-to-body
        :visible.sync="paperVisible">
        <div class="paper_box" v-if="scoreData.length > 0">
          <div v-for="(item,index) in scoreData" :key="index">
            <h3>{{AnswerIndex[index]+'、'+item.name + '(共' +item.count+'题，共'+ item.totalScore+ '分)'}}</h3>
            <div v-for="(ite,ind) in item.children" :key="ind">
              <div class="paper_title">
                <div>{{ind+1+'、'}}</div>
                <div class="paper_content" v-html="ite.content"></div>
              </div>

              <div v-if="ite.baseType === 1 || ite.baseType === 2">
                <div v-for="(opt,index) in ite.option" class="paper_option">
                  <div>{{AnswerType[index] + '、 '}}</div>
                  <div v-html="opt"></div>
                </div>
              </div>
              <div class="detail_content">
                <div v-if="ite.baseType === 1 || ite.baseType === 2">
                  <span>答案：</span><i v-for="(optAsw,oi) in ite.optionAnswer" :key="oi">{{AnswerType[optAsw] +
                  ((ite.optionAnswer.length-1)===oi?'':'，') }}</i>
                </div>
                <div v-if="ite.baseType === 3">
                  <span>答案：</span><i>{{ite.tfAnswer===true?'对': ite.tfAnswer === false ? '错' : '-'}}</i>
                </div>
                <div v-if="ite.baseType === 4">
                  <span>答案：</span>
                  <div v-for="(blank,bi) in ite.blankAnswer" style="display: flex;">
                    <div>{{'填空' + (bi+1) + '：'}}</div>
                    <div v-html="blank"></div>
                  </div>
                </div>
                <div v-if="ite.baseType === 5">
                  <span>答案：</span>
                  <div v-html="ite.subjectAnswer"></div>
                </div>
              </div>
            </div>

          </div>

        </div>
        <div slot="footer" class="dialog-footer">
          <el-button :size="size" @click.native="paperVisible = false">{{$t('action.cancel')}}</el-button>
        </div>
      </el-dialog>
    </el-form>

    <el-drawer
      :visible.sync="questVisible"
      append-to-body :with-header="false"
      direction="rtl" :size="'50%'">
      <div style="margin-left:10px">
        <QuestSelect
          ref="questId"
          :questBankData = "questBankData"
          :questBankId="formData.questBankId"
          :chapterData="chapterData"
          :typeData="typeData"
          :topicData = "topicData"
          @changeQuest="changeQuest">
        </QuestSelect>
      </div>
    </el-drawer>
  </div>
</template>

<script>
  import {addBean, queryBean, addBatchBean} from "@/http/base";
  import QuestSelect from "@/components/ObjectSelect/QuestSelect";
  export default {
    name: "Manual",
    components: {
      QuestSelect,
    },
    data() {
      return {
        size: 'mini',
        questVisible: false,
        detailVisible: false,
        paperVisible: false,
        selectedDept: [],
        deptData: [],
        formData: {
          date: '',
          startTime: '',
          endTime: '',
          id: 0,
          name: '',
          remark: '',
          courseId: '',
          createAnnual: 2020,
          semester: '第一学期',
          passScore: 0,
          deptmentIds: [],
          type: 1
        },
        formDataRules: {
          questBankId: [
            {required: true, message: '请选择课程', trigger: 'change'}
          ],
          name: [
            {required: true, message: '请输入试卷名称', trigger: 'blur'}
          ],
          createAnnual: [
            {required: true, message: '请选择成卷学年', trigger: 'change'}
          ],
          semester: [
            {required: true, message: '请选择试卷学期', trigger: 'change'}
          ],
          date: [
            {required: true, message: '请选择考试时间', trigger: 'change'}
          ],
          startTime: [
            {required: true, message: '请选择考试时间', trigger: 'change'}
          ],
          difficulty: [
            {required: true, message: '请输入难易度', trigger: 'change'}
          ]
        },
        createAnnualData: [
          {label: '2017-2018', value: 2017},
          {label: '2018-2019', value: 2018},
          {label: '2019-2020', value: 2019},
          {label: '2020-2021', value: 2020},
          {label: '2021-2022', value: 2021},
          {label: '2022-2023', value: 2022},
          {label: '2023-2024', value: 2023}
        ],
        examTypeData: [
          {label: '考试', value: 1},
          {label: '随堂测试', value: 2}
        ],
        questList: [],
        questBankData: [],
        AnswerType: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        AnswerIndex: ['一', '二', '三', '四', '五', '六', '七', '八'],
        previewData: {},
        chapterData: [],
        typeData: [],
        scoreData: [],
        topicData:[],
        selectList: []
      }
    },
    watch: {
      totalScore: function (val) {
        this.changeScore(this.questList);
      },
      totalCount: function (val) {
        this.changeScore(this.questList);
      }
    },
    computed: {
      totalScore: function () {
        return this.questList.reduce((prev, next) => (prev + next.score), 0);
      },
      totalCount: function () {
        return this.questList.length;
      },
    },
    methods: {
      handleSelectionChange(val) {
        this.selectList = val.map(v => v.id);
      },
      findDeptTree: function () {
        this.$api.dept.findDeptTree().then((res) => {
          let options=function(option){
            let data=option.map( item =>{
              let arrStr={};
              arrStr.value=item.id;
              arrStr.label=item.name;
              if(item.children.length === 0){
              }else{
                arrStr.children=options(item.children);
              }
              return arrStr;
            })
            return data;
          }
          this.deptData=options(res.bean.data)
        })
      },
      findCourse: function () {
        let condition = {};
        queryBean('QuestBank', condition)
          .then(res => {
            if (res.retCode === 0) {
              this.questBankData = res.bean.data;
            }
          })
      },
      questBankChangeHandle: function (val) {
        this.questList = [];
        let questBankData = this.questBankData[this.questBankData.findIndex(item => item.id === val)]
        this.chapterData = questBankData.chapter;
        this.topicData = questBankData.topic;
        let selectType = [
          {type: 1, arrStr: 'singleSelectType'},
          {type: 2, arrStr: 'multiplySelectType'},
          {type: 3, arrStr: 'trueFalseType'},
          {type: 4, arrStr: 'completionType'},
          {type: 5, arrStr: 'subjectType'},
        ];
        let typeData = [];
        selectType.forEach(item => {
          if (questBankData[item.arrStr].length > 0) {
            questBankData[item.arrStr].forEach(ite => {
              typeData.push({type: item.type, value: ite})
            })
          }
        });
        this.typeData = typeData;
      },
      //向上移动
      handleAscending(index, row, data) {
        if (index !== 0) {

          let rowData = Object.assign({}, row);
          if (data[index].type === data[index - 1].type) {
            data.splice(index, 1);
            data.splice(index - 1, 0, rowData);
          } else {
            this.$message('题目类型不一样无法调换位置！！！')
          }
        } else {
          this.$message('已经在列表第一行！！！')
        }
      },
      //向下移动
      handleDescending(index, row, data) {
        if (index !== data.length - 1) {
          let rowData = Object.assign({}, row);
          if (data[index].type === data[index + 1].type) {
            data.splice(index, 1);
            data.splice(index + 1, 0, rowData);
          } else {
            this.$message('题目类型不一样无法调换位置！！！')
          }

        } else {
          this.$message('已经在列表最后一行！！！')
        }
      },
      //删除题目
      handleDeleting: function (index, row, data) {
        this.$confirm('此操作将永久删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          data.splice(index, 1);
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      // 预览题目
      handlePreview: function (index, row) {
        this.previewData = Object.assign({}, row);
        this.detailVisible = true;
      },
      //添加题目
      addQuestId: function () {
        if (!this.formData.questBankId) {
          this.$message({
            type: 'error',
            message: '题库不能为空！！！'
          })
          return false;
        }
        this.questVisible = true
        // this.$nextTick(()=>{
        //   this.$refs.questId.getTableData();
        // })
      },
      // 批量删除题目
      deleteQuestId() {
        if (this.selectList.length === 0) {
          this.$message.error('请选择删除项！')
          return
        }
        this.$confirm('此操作将永久删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.selectList.map(id => {
            const questList = this.questList.filter(v => v.id !== id)
            this.questList = questList
          });
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      changeQuest: function (val) {
        val = val.filter(item => {
          let ids = this.questList.map(v => v.id)
          return !ids.includes(item.id)
        })
        let questList = [...this.questList, ...val];
        this.changeScore(questList)
        this.questVisible=false;
        // if(val.length>0){
        //   this.questVisible=false;
        // }
      },
      changeScore: function (data) {
        let questList = data;
        let newQuestList = [];
        let scoreData = [];
        this.typeData.forEach((item, index) => {
          scoreData[index] = {};
          scoreData[index].name = item.value;
          scoreData[index].baseType = item.type;
          scoreData[index].count = questList.filter(type => type.type === item.value).length;
          scoreData[index].children = questList.filter(type => type.type === item.value);
          scoreData[index].totalScore = scoreData[index].children.reduce((prev, next) => (prev + next.score), 0);
          scoreData[index].percentage = Math.round((scoreData[index].totalScore / this.totalScore) * 1000) / 10 + '%'
          if (scoreData[index].children.length > 0) {
            newQuestList = [...newQuestList, ...scoreData[index].children]
          }
        })
        this.scoreData = scoreData.filter(item => item.count !== 0);
        this.questList = newQuestList;
      },
      submitManual: function (val) {
        this.$refs['formData'].validate((valid) => {
          if (valid) {
            let params = Object.assign({}, this.formData);
            if (this.questList.length === 0) {
              this.$message({
                type: 'error',
                message: '试题页表不能为空！！！'
              })
              return false;
            }
            params.scoreSum = this.totalScore
            params.deptmentIds = params.deptmentIds.flat()
            params.status = val
            this.$api.paper.save(params).then((res) => {
              if (res.retCode === 0) {
                let questList = this.questList.map(item => {
                  return {
                    paperId: res.bean.id,
                    questId: item.id,
                    score: item.score
                  }
                })
                addBatchBean('PaperQuest', questList).then(res => {
                  if (res.retCode === 0) {
                    this.$message({
                      type: 'success',
                      message: '试卷添加成功！！！'
                    })
                    this.$refs['formData'].resetFields()
                    this.formData.startTime = ''
                    this.formData.endTime = ''
                    this.formData.deptmentIds = []
                    this.questList = [];
                  }
                })
              }
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      previewPaper: function () {
        if (this.scoreData.length > 0) {
          this.paperVisible = true;
        } else {
          this.$message({
            type: 'error',
            message: '试题列表不能为空！！！'
          })
        }
      }
    },
    created() {
      this.findCourse();
    },
    mounted() {
      this.findDeptTree();
    }
  }
</script>

<style scoped>
  .form-data-flex{
    display: flex;
    flex-wrap:wrap;
  }
  .form-data-flex>div{
    flex:none;
  }
  .paper_box h3 {
    margin: 0 0 10px;
  }

  .paper_title {
    display: flex;
  }

  .paper_content {
  }

  .paper_option {
    padding: 5px 10px;
    display: flex;
  }

  .detail_box h2 {
    margin: 0;
  }

  .detail_content {
    padding: 10px;
  }

  .detail_option {
    padding: 5px 10px;
    display: flex;
  }

  .el-icon-view {
    cursor: pointer;
  }
</style>
