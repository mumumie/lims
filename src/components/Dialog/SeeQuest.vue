<template>
  <!--    详情展示弹框-->
  <el-dialog
    width="60%"
    title="预览"
    append-to-body
    :visible.sync="switchBtn">
    <div class="detail_box" v-if="row.content">
      <h2>题目</h2>
      <div class="detail_content" v-html="row.content"></div>
      <div v-if="row.baseType === 1 || row.baseType === 2">
        <h2>选项</h2>
        <div v-for="(item,index) in row.option" class="detail_option">
          <div>{{AnswerType[index] + '、 '}}</div>
          <div v-html="item"></div>
        </div>
      </div>
      <h2>答案</h2>
      <div class="detail_content">
        <div v-if="row.baseType === 1 || row.baseType === 2">
          <i v-for="(optAsw,index) in row.optionAnswer" :key="index">{{AnswerType[optAsw] +
            ((row.optionAnswer.length-1)===index?'':'，') }}</i>
        </div>
        <div v-if="row.baseType === 3">
          <i>{{row.tfAnswer===true?'对': row.tfAnswer === false ? '错' : '-'}}</i>
        </div>
        <div v-if="row.baseType === 4">
          <div v-for="(item,index) in row.blankAnswer" style="display: flex;">
            <div>{{'填空' + (index+1) + '：'}}</div>
            <div v-html="item"></div>
          </div>
        </div>
        <div v-if="row.baseType === 5" v-html="row.subjectAnswer"></div>
      </div>
      <h2>解析</h2>
      <div class="detail_content" v-html="row.remark"></div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button :size="size" @click="$emit('close')">{{$t('action.cancel')}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: "SeeQuest",
    props: ['switchBtn', 'row'],
    data() {
      return {
        AnswerType:['A','B','C','D','E','F'],
        type:['','单选题','多选题','判断题','填空题','问答题'],
        difficulty:['', '易', '较易', '中', '较难', '难'],
      }
    },
    methods: {

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
</style>
