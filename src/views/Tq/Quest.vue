<template>

  <div class="quest_box">

    <div class="quest_box_left">
      <tip :value="
    ['试题创建后，在我的试题中查看，可进行提交审核']"/>
      <div class="quest_title">
        <p class="quest_title_caption">单题建设</p>
        <p>在库题中创建试题</p>
      </div>
      <FroalaEditor ids="content" placeholder="请输入题干内容..." ref="froalaEditor" @on-change="changeContent"></FroalaEditor>
      <div class="option_box" v-if="selectType === 1">
        <div class="option_select" :class="{active:item.isSelect}" v-for="(item,index) in optionData" :key="index">
          <div class="option_select_tool">{{AnswerType[index]}}</div>
          <div class="option_select_answer">
            <div class="option_select_content">
              <FroalaInlineEditor :ids="index" ref="froalaOption" @on-change="changeOption"></FroalaInlineEditor>
            </div>
            <div class="option_select_btn" @click="setOptionAnswer(index)">{{item.isSelect ? '正确答案':'设置答案'}}</div>
          </div>
          <div class="option_select_delete"><i class="el-icon-delete" @click="deleteOptionData(index)"></i></div>
        </div>
        <el-button icon="el-icon-plus" size="mini" @click="addOptionData">增加选项</el-button>
      </div>
      <div class="option_box" v-if="selectType === 2">
        <div class="option_select" :class="{active:item.isSelect}" v-for="(item,index) in optionData" :key="index">
          <div class="option_select_answer">
            <div class="option_select_content">
              <FroalaInlineEditor :ids="index" ref="froalaInlineEditor" @on-change="changeOption"></FroalaInlineEditor>
            </div>
            <div class="option_select_btn" @click="setOptionAnswer(index)">{{item.isSelect ? '正确答案':'设置答案'}}</div>
          </div>
          <div class="option_select_delete"><i class="el-icon-delete" @click="deleteOptionData(index)"></i></div>
        </div>
        <el-button icon="el-icon-plus" size="mini" @click="addOptionData">增加选项</el-button>
      </div>
      <div class="option_box" v-if="selectType === 3">
        <div class="option_select" :class="{active:item.isSelect}" v-for="(item,index) in tfData" :key="index">
          <div class="option_select_answer">
            <div class="option_select_content">
              <span>{{item.label}}</span>
            </div>
            <div class="option_select_btn" @click="setOptionAnswer(index)">{{item.isSelect ? '正确答案':'设置答案'}}</div>
          </div>
        </div>
      </div>
      <div class="option_box" v-if="selectType === 4">
        <div class="option_select" v-for="(item,index) in blankData">
          <div class="option_select_answer">
            <div class="option_select_content">
              <FroalaInlineEditor :ids="index" ref="froalaInlineEditor" @on-change="changeBlank"></FroalaInlineEditor>
            </div>
          </div>
          <div class="option_select_delete"><i class="el-icon-delete" @click="deleteOptionData(index)"></i></div>
        </div>
        <el-button icon="el-icon-plus" size="mini" @click="addOptionData">增加选项</el-button>
      </div>
      <div class="option_box" v-if="selectType === 5">
        <div class="option_select">
          <div class="option_select_answer">
            <div class="option_select_content">
              <FroalaInlineEditor ids="subjectAnswer" ref="froalaInlineEditor"
                                  @on-change="changeContent"></FroalaInlineEditor>
            </div>
          </div>
        </div>
      </div>
      <div class="remark_box">
        <p>解析内容</p>
        <FroalaEditor ids="remark" placeholder="请输入解析内容..." ref="remark" @on-change="changeContent"></FroalaEditor>
      </div>
      <div class="submit" style="text-align: right;margin-bottom:20px;" @click="submitQuestion">
        <el-button type="primary" size="small">提交</el-button>
      </div>
    </div>
    <div class="quest_box_right">
      <el-form :model="formData" label-width="80px" :rules="formDataRules" ref="formData" :size="size"
               label-position="right">
        <el-form-item label="题库" prop="questBankId">
          <el-select v-model="formData.questBankId" placeholder="请选择" @change="questBankChangeHandle">
            <el-option :label="item.name" :value="item.id" v-for="item in questBankData" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="章节" prop="chapter">
          <el-select v-model="formData.chapter" placeholder="请选择">
            <el-option :label="item" :value="item" v-for="(item,index) in chapterData" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题型" prop="typeClass">
          <el-select v-model="formData.typeClass" placeholder="请选择" @change="selectTypeHandle">
            <el-option :label="item.value" :value="index" v-for="(item,index) in typeData" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="难易度" prop="difficulty">
          <el-select v-model="formData.difficulty" placeholder="请选择">
            <el-option :label="item.name" :value="item.value" :key="item.value"
                       v-for="item in difficultyData"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分值" prop="score">
          <el-input v-model.number="formData.score" auto-complete="off" type="number" min="1"
                    placeholder="请输入分值"></el-input>
        </el-form-item>
        <el-form-item label="知识点" prop="topic" >
          <el-select v-model="formData.topic" placeholder="请选择" v-if="!isCustomKnowledge">
            <el-option :label="item" :value="item" :key="item"
                       v-for="item in topicData"></el-option>
          </el-select>
          <div style="color:#0C96FF;line-height: 20px;cursor:pointer;" v-if="!isCustomKnowledge" @click="isCustomKnowledge = true"><i class="el-icon-plus"></i>自定义知识点</div>
          <div class="topic-box" v-else>
            <el-input v-model="formData.knowledge" auto-complete="off" ></el-input>
            <div style="cursor: pointer;width:20px;flex:none;text-align: center;color:#0C96FF;"><i class="el-icon-delete" @click="isCustomKnowledge = false"></i></div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import FroalaEditor from "@/components/wangEditor/froalaEditor";
  import FroalaInlineEditor from "@/components/wangEditor/froalaInlineEditor";
  import {addBean, queryBean, updateBean} from "@/http/base";

  export default {
    name: "Quest",
    components: {
      FroalaEditor,
      FroalaInlineEditor,
    },
    data() {
      return {
        formData: {
          id: 0,
          questBankId: '',
          chapter: '',
          typeClass: 0,
          difficulty: '',
          content: '',
          option: [],
          optionAnswer: [],
          tfAnswer: null,
          blankAnswer: [],
          subjectAnswer: '',
          remark: '',
          score: 1,
          status:-1,
          topic:'',
          knowledge:''
        },
        difficultyData: [
          {name: "易", value: 1},
          {name: "较易", value: 2},
          {name: "中", value: 3},
          {name: "较难", value: 4},
          {name: "难", value: 5}
        ],
        formDataRules: {
          questBankId: [
            {required: true, message: '请选择题库', trigger: 'change'}
          ],
          chapter: [
            {required: true, message: '请选择章节', trigger: 'change'}
          ],
          typeClass: [
            {required: true, message: '请选择题型', trigger: 'change'}
          ],
          difficulty: [
            {required: true, message: '请选择难易度', trigger: 'change'}
          ],
          score: [
            {required: true, message: '请输入分值', trigger: 'blur'}
          ],
        },
        selectType: 1,
        optionData: [
          {value: '', isSelect: false},
          {value: '', isSelect: false},
          {value: '', isSelect: false},
          {value: '', isSelect: false},
        ],
        tfData: [
          {label: '正确', value: true, isSelect: false},
          {label: '错误', value: false, isSelect: false},
        ],
        blankData: [
          {value: '', isSelect: false},
          {value: '', isSelect: false},
        ],
        questBankData: [],
        chapterData: [],
        typeData: [],
        topicData:[],
        AnswerType:['A','B','C','D','E','F','G','H','I','J','K','L','M','N'],
        isCustomKnowledge:false
      }
    },
    methods: {
      findQuestBank: function () {
        let condition = {};
        queryBean('QuestBank', condition)
          .then(res => {
            this.questBankData = res.bean.data;
            this.formData.questBankId = res.bean.data[0].id;
            this.chapterData = res.bean.data[0].chapter;
            this.topicData = res.bean.data[0].topic;
            let selectType = [
              {type: 1, arrStr: 'singleSelectType'},
              {type: 2, arrStr: 'multiplySelectType'},
              {type: 3, arrStr: 'trueFalseType'},
              {type: 4, arrStr: 'completionType'},
              {type: 5, arrStr: 'subjectType'},
            ];
            let typeData = [];
            let flag = true;
            selectType.forEach(item => {
              if (res.bean.data[0][item.arrStr].length > 0) {
                res.bean.data[0][item.arrStr].forEach(ite => {
                  if (flag) {
                    this.selectType = item.type;
                    this.formData.type = ite;
                    flag = false;
                  }
                  typeData.push({type: item.type, value: ite})
                })
              }
            });
            this.typeData = typeData;
          })
      },
      questBankChangeHandle: function (val) {
        let questBankData = this.questBankData[this.questBankData.findIndex(item => item.id === val)]
        this.chapterData = questBankData.chapter;
        let selectType = [
          {type: 1, arrStr: 'singleSelectType'},
          {type: 2, arrStr: 'multiplySelectType'},
          {type: 3, arrStr: 'trueFalseType'},
          {type: 4, arrStr: 'completionType'},
          {type: 5, arrStr: 'subjectType'},
        ];
        let typeData = [];
        let flag = true;
        selectType.forEach(item => {
          if (questBankData[item.arrStr].length > 0) {
            questBankData[item.arrStr].forEach(ite => {
              if (flag) {
                this.selectType = item.type;
                this.formData.type = ite;
                flag = false;
              }
              typeData.push({type: item.type, value: ite})
            })
          }
        });
        this.typeData = typeData;
        this.formData.typeClass = 0;
        this.formData.chapter = ''
      },
      changeContent: function (html) {
        this.formData[html.ids] = html.content;
      },
      changeOption: function (html) {
        this.optionData[html.ids].value = html.content;
      },
      changeBlank: function (html) {
        this.blankData[html.ids].value = html.content;
      },
      selectTypeHandle: function (val) {
        this.selectType = this.typeData[val].type;
        this.formData.type = this.typeData[val].value;
        this.optionData.map(item => {
          item.isSelect = false;
          return item;
        })
      },
      submitQuestion: function () {
        this.$refs['formData'].validate((valid) => {
          if (!valid) return;
          let params = Object.assign({}, this.formData);
          params.score = Number(params.score);
          params.baseType = this.selectType;
          params['status'] = -1;
          if (params.content === '') {
            this.$message({
              type: 'warning',
              message: '题干不能为空！！！'
            })
            return false;
          }
          params.optionAnswer = [];
          if (this.selectType === 1) {
            params.option = this.optionData.map(item => {
              return item.value;
            });
            this.optionData.forEach((item, i) => {
              if (item.isSelect) {
                params.optionAnswer.push(i);
              }
            })
            if (params.option.findIndex(item => item === '') > -1) {
              this.$message({
                type: 'warning',
                message: '请输入答案内容！！！'
              })
              return false;
            }
            if (params.optionAnswer.length === 0) {
              this.$message({
                type: 'warning',
                message: '请选择正确答案！！！'
              })
              return false;
            }
          } else if (this.selectType === 2) {
            params.option = this.optionData.map(item => {
              return item.value;
            });
            this.optionData.forEach((item, i) => {
              if (item.isSelect) {
                params.optionAnswer.push(i);
              }
            })
            if (params.option.findIndex(item => item === '') > -1) {
              this.$message({
                type: 'warning',
                message: '请输入答案内容！！！'
              })
              return false;
            }
            if (params.optionAnswer.length === 0) {
              this.$message({
                type: 'warning',
                message: '请选择正确答案！！！'
              })
              return false;
            }
          } else if (this.selectType === 3) {
            this.tfData.forEach(item => {
              if (item.isSelect) {
                params.tfAnswer = item.value;
              }
            })
            if (params.tfAnswer === null) {
              this.$message({
                type: 'warning',
                message: '请选择正确答案！！！'
              })
              return false;
            }
          } else if (this.selectType === 4) {
            params.blankAnswer = this.blankData.map(item => {
              return item.value;
            });
            if (params.blankAnswer.findIndex(item => item === '') > -1) {
              this.$message({
                type: 'warning',
                message: '请输入答案内容！！！'
              })
              return false;
            }
          } else if (this.selectType === 5) {
            if (params.subjectAnswer === '') {
              this.$message({
                type: 'warning',
                message: '请输入答案内容！！！'
              })
              return false;
            }
          }
          if(this.isCustomKnowledge){
            params.topic = params.knowledge;
            if(params.topic){
              if (!this.topicData.includes(params.topic)) {
                let doc = {
                  topic:[params.topic,...this.topicData]
                }
                updateBean('QuestBank',params.questBankId,doc)
              }
            }
          }
          this.$api.quest.save(params).then((res) => {
            if(this.isCustomKnowledge && params.topic){
              this.topicData.push(params.topic)
            }
            this.isCustomKnowledge = false;
            this.$message({
              type: 'success',
              message: '题目添加成功！！！'
            })
            // this.$refs.froalaEditor.setHtml("");
            // this.formData.content = "";
            //this.$refs['formData'].resetFields()
            //this.$router.go(0);
          })
        });
      },
      addOptionData: function () {
        if (this.selectType === 1 || this.selectType === 2) {
          if (this.optionData.length < 10) {
            this.optionData.push({value: '', isSelect: false})
          } else {
            this.$message({
              type: 'warning',
              message: '最多添加10个选项！！'
            })
          }
        } else if (this.selectType === 4) {
          this.blankData.push({value: '', isSelect: false})
          // if (this.blankData.length < 5) {
          //
          // } else {
          //   this.$message({
          //     type: 'warning',
          //     message: '最多添加5个选项！！'
          //   })
          // }
        } else {
          this.$message('题目类型错误！！')
        }
      },
      deleteOptionData: function (index) {
        console.log(index);
        if (this.selectType === 1 || this.selectType === 2) {
          if (this.optionData.length > 2) {
            this.$confirm('删除后将不能恢复, 确认删除吗?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.optionData.splice(index, 1);
            }).catch(() => {

            });
          } else {
            this.$message({
              type: 'warning',
              message: '至少需要保留两个选项！！'
            })
          }
        } else if (this.selectType === 4) {
          if (this.blankData.length > 1) {
            this.$confirm('删除后将不能恢复, 确认删除吗?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.blankData.splice(index, 1);
            }).catch(() => {

            });
          } else {
            this.$message({
              type: 'warning',
              message: '至少需要保留一个选项！！'
            })
          }
        } else {
          this.$message('题目类型错误！！')
        }

      },
      setOptionAnswer: function (index) {
        if (this.selectType === 1) {
          this.optionData.map((item, i) => {
            if (i === index) {
              item.isSelect = true;
            } else {
              item.isSelect = false;
            }
            return item;
          })
        } else if (this.selectType === 2) {
          this.optionData[index].isSelect = !this.optionData[index].isSelect
        } else if (this.selectType === 3) {
          this.tfData.map((item, i) => {
            if (i === index) {
              item.isSelect = true;
            } else {
              item.isSelect = false;
            }
            return item;
          })
        } else {
          this.$message('题目类型错误！！')
        }
      },
      init() {
        this.$nextTick(() => {
          this.optionData.forEach((item, i) => {
            this.$refs.froalaOption[i].setHtml(item.value);
          })
          console.log(this.$refs.froalaOption);
          console.log(this.$refs.remark);
          this.$refs.remark.setHtml('1111111111');
        })
      }
    },
    created() {
      this.findQuestBank();
    },
    mounted() {

    }
  }
</script>

<style scoped>
  .topic-box{
    display: flex;
  }
  .quest_box{
    position: relative;
    display: flex;
  }

  .quest_box_left {
    min-width: 600px;
  }

  .quest_box_right {
    flex: none;
    padding-top: 60px;
    width: 300px;
  }

  .quest_title {
    margin-bottom: 20px;
  }

  .quest_title p {
    margin: 0;
    color: #999;
  }

  .quest_title .quest_title_caption {
    font-weight: 600;
    font-size: 16px;
    color: #333;
  }

  .option_box {
    margin-top: 20px;
  }

  .option_select {
    margin-bottom: 10px;
    display: flex;
  }
  .option_select_tool{
    flex: none;
    width: 25px;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .option_select_answer {
    flex: auto;
    display: flex;
    align-items: stretch;
    border: 1px solid #EAEAEA;
  }

  .option_select_delete {
    flex: none;
    width: 25px;
    padding-left: 10px;
    font-size: 20px;
    color: #0C96FF;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .option_select_content {
    flex: auto;
    width: 500px;
    padding: 10px;
  }

  .option_select_btn {
    flex: none;
    width: 90px;
    background: #EAEAEA;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .option_select_btn:hover {
    background: #0C96FF;
    color: #fff;
  }

  .option_select.active .option_select_answer {
    border: 1px solid #0C96FF;
  }

  .option_select.active .option_select_btn {
    background: #0C96FF;
    color: #fff;
  }

  .remark_box {
    padding: 20px 0;
  }
</style>
