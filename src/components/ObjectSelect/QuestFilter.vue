<template>
  <el-form size="mini">
    <el-form-item label="题库">
      <el-select v-model="questBankId" :disabled="call===1">
        <el-option
          :label="item.name"
          :value="item.id"
          v-for="item in questBankData"
          :key="item.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="状态">
      <el-checkbox-group v-model="statusValue">
        <el-checkbox v-for="item in statusData" :label="item.value" :key="item.value">{{item.name}}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="难度">
      <el-checkbox-group v-model="difficultyValue">
        <el-checkbox v-for="item in difficultyData" :label="item.value" :key="item.value">{{item.name}}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="知识点">
      <el-select v-model="topicValue" multiple filterable collapse-tags placeholder="请选择">
        <el-option
          :label="item"
          :value="item"
          :key="item"
          v-for="item in topicData"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="建题时间范围">
      <el-date-picker
        v-model="timeValue"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="timestamp">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="章节题型">
      <el-button icon="el-icon-circle-edit-outline" @click="chapterSelect">章节题型筛选</el-button>
    </el-form-item>

    <el-dialog
      :visible.sync="chapterTypeVisible"
      append-to-body>
      <el-form-item label="章节">
        <el-table
          ref="chapterTable"
          :data="chapterData"
          @selection-change="chapterChange">
          <el-table-column
            type="selection">
          </el-table-column>
          <el-table-column
            prop="name"
            label="名称">
          </el-table-column>
          <el-table-column
            prop="value"
            label="题目数量">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="题型">
        <el-table
          ref="typeTable"
          :data="questTypeData"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="questTypeChange">
          <el-table-column
            type="selection">
          </el-table-column>
          <el-table-column
            prop="name"
            label="名称">
          </el-table-column>
          <el-table-column
            prop="value"
            label="题目数量">
          </el-table-column>
          <el-table-column
            prop="zz"
            label="随机抽题量">
            <template slot-scope="scope">
              <el-input v-model.number="scope.row.typeCount" @input="limitChange(scope.row, 'typeCount')" type="number" min="1" max="30"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="分值">
            <template slot-scope="scope">
              <el-input v-model.number="scope.row.score" @input="limitChange(scope.row, 'score')" type="number" min="1" max="30"></el-input>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-dialog>
  </el-form>
</template>
<script>
  import {aggregate, post, queryBean} from "../../http/base";
  import {mapTree} from "../../utils";
  export default {
    props:['questBankData','topicData','questBankId', 'call', 'pageInfo'],
    data() {
      return {
        chapterTypeVisible: false,
        timeValue: [],
        chapterValue: [],
        questTypeValue: [],
        statusValue: [1],
        difficultyValue: [1,2,3,4,5],
        questBankData: [],
        chapterData: [],
        questTypeData: [],
        statusData: [
          {name: "未提交", value: -1},
          {name: "未启用(待审核)", value: 0},
          {name: "启用(已审核)", value: 1},
          {name: "停用(已删除)", value: 2}],
        difficultyData: [
          {name: "易", value: 1},
          {name: "较易", value: 2},
          {name: "中", value: 3},
          {name: "较难", value: 4},
          {name: "难", value: 5}
        ],
        topicValue:''
      }
    },
    computed: {
      baseCondition: function () {
        let baseCondition = {
          questBankId: this.questBankId,
          status$in: this.statusValue,
          insertDt$bt: this.timeValue,
          difficulty$in: this.difficultyValue,
        }
        if (this.topicValue.length > 0) {
          baseCondition['topic$in']=this.topicValue
        }
        return baseCondition
      }
    },
    watch: {
      questBankId: function (nv, ov) {
        this.refreshChapter();
      },
      questBankData: function (nv, ov) {
        this.refreshChapter();
      },
      statusValue: function (nv, ov) {
        this.refreshChapter();
      },
      timeValue: function (nv, ov) {
        if (nv!=null){
          this.refreshChapter();
        }
      },
      difficultyValue: function (nv, ov) {
        this.refreshChapter();
      },
      /*chapterData: function (nv, ov) {
        this.$refs.chapterTable.toggleAllSelection()
      },*/
      questTypeData: function (nv, ov) {
        // console.log(nv)
        //this.$refs.typeTable.toggleAllSelection()
      },

    },
    methods: {
      limitChange(row, key) {
        if (row[key] > 30) {
          row[key] = 30
        } else if (row[key] <= 0) {
          row[key] = 1
        }
      },
      onSubmit() {
        let condition = this.baseCondition;
        condition["chapter$in"] = this.chapterValue;
        if(this.questTypeValue.length === 0){
          this.$message.error('请选择题目类型！')
          return
        }else{
          condition["type$in"] = this.questTypeValue;
        }
        let typeRandom = {};
        if (this.questTypeData.some(v => !v.typeCount)) {
          this.$message.error('选中题型数量不能为空或0！')
          return
        }
        if (this.questTypeData.some(v => !v.score)) {
          this.$message.error('选中题型分值不能为空或0！')
          return
        }
        this.questTypeData.forEach(v=>{
          typeRandom[v['name']] = v['typeCount']
        })
        this.$emit('closeChapterType', true)
        this.chapterTypeVisible = false;
        post("queryRandomQuest", {
          condition: condition,
          typeRandom: typeRandom
        }).then(res => {
          const questData = res.bean;
          questData.map(v => {
            const row = this.questTypeData.filter(item => item.name === v.type)[0]
            // console.log(row);
            if (row) {
              v.score = row.score
            }
          })
          this.$emit('showQuest', questData);
        }).catch(() =>{
          this.$emit('closeChapterType', false)
        })

      },
      chapterSelect(){
        this.chapterTypeVisible = true;
        delete this.baseCondition["chapter$in"]
        delete this.baseCondition["type$in"]
        this.refreshChapter().then(res =>{
          this.toggleSelection()
        })
        // setTimeout(() => {
        //   this.$refs.typeTable.toggleAllSelection()
        // },1000)
      },
      toggleSelection() {
        this.$nextTick(() =>{
          this.$refs.chapterTable.toggleAllSelection();
        })

      },
      chapterChange: function (val) {
        let list = [];
        val.forEach(v => {
          list.push(v.name);
        })
        this.chapterValue = list;
        let condition = this.baseCondition;
        condition["chapter$in"] = this.chapterValue;
        aggregate("Quest", "type", condition).then(res => {
          mapTree(res.bean, {"name": "_id", "value": "count"})
          this.questTypeData = res.bean;
          this.$refs.typeTable.toggleAllSelection()
          this.questTypeData.forEach((v,i)=>{
            this.$set(this.questTypeData[i], 'score', 1)
            if (v.value > 30) {
              this.$set(this.questTypeData[i], 'typeCount', 30)
            } else {
              this.$set(this.questTypeData[i], 'typeCount', v.value)
            }
            // v['typeCount'] = v.value
          })
        });

      },
      questTypeChange: function (val) {
        let list = [];
        val.forEach(v => {
          list.push(v.name);
        })
        this.questTypeValue = list;

        this.questTypeData.forEach((v, i) => {
          // this.$set(this.questTypeData[i], 'score', 1)
          if(this.questTypeValue.includes(v.name)){
            if (v.typeCount==0) v.typeCount = v.value > 30 ? 30 : v.value
          }else {
            // v.typeCount = 0
          }
        })
      },
      refreshChapter: function () {
        if (_.isEmpty(this.questBankId)) return;
        return aggregate("Quest", "chapter", this.baseCondition).then(res => {
          mapTree(res.bean, {"name": "_id", "value": "count"})
          this.chapterData = res.bean;
        });
      }
    },
    created() {
      // queryBean("QuestBank", {}).then(res => {
      //   this.questBankData = res.bean.data;
      // });
    }
  }
</script>
