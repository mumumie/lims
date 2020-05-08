<template>
  <div>
    <el-form-item
      v-if="name.editable || !operation"
      :label="name.zhName"
      :prop="name.name"
      :key="list.name">
      <el-input
        v-if="name.fieldType === 'INPUT'"
        :type="(name.fieldClass==='int'||name.fieldClass ==='double')?'number':'text'"
        v-model="form[name.name]"
        @change="inputValue"
        :disabled="!name.editable"
        :key="list.name">
      </el-input>
      <el-radio-group
        v-if="name.fieldType === 'RADIO'"
        @change="inputValue"
        v-model="form[name.name]">
        <el-radio
          v-for="(item,index) in name.verifyDesc"
          :key="index"
          :label="index">{{item+'-'+index}}</el-radio>
      </el-radio-group>
      <el-checkbox-group
        v-if="name.fieldType === 'CHECKBOX'"
        @change="inputValue"
        v-model="form[name.name]">
        <el-checkbox
          v-for="(item,index) in name.verifyDesc"
          :key="index"
          :label="index">
          {{item+'-'+index}}
        </el-checkbox>

      </el-checkbox-group>
      <el-date-picker
        v-if="name.fieldType === 'DATE'"
        v-model="form[name.name]"
        type="datetime"
        @change="inputValue"
        value-format="timestamp"
        :disabled="!name.editable"
        placeholder="选择日期">
      </el-date-picker>
      <el-select
        v-if="name.fieldType === 'SELECT'"
        v-model="form[name.name]"
        @change="inputValue"
        :multiple="name.type==='List'"
        filterable
        placeholder="请输入关键词">
        <el-option
          v-for="(item,index) in name.verifyDesc"
          :key="index"
          :label="item+'-'+index"
          :value="index">
        </el-option>
      </el-select>
      <el-button
        v-if="name.refClass"
        @click="handleTableData">
        添加
      </el-button>
      <AddRefClass
        v-if="name.refClass"
        :name="name"
        :dialogVisible="dialogVisible"
        @dialogVisible="handleDialogVisible"
        @inputValue="inputValue">
      </AddRefClass>
    </el-form-item>

  </div>

</template>

<script>
  import AddRefClass from './AddRefClass'
  export default {
    name: "formInfo",
    props:{
      name:{
        type:Object
      },
      list:{
        type:Object
      },
      operation:{
        type:Boolean
      }
    },
    components:{
      AddRefClass
    },
    data(){
      return {
        form:{},
        listData:[],
        restaurants: [],
        state: '',
        timeout:  null,
        options: [],
        dialogVisible: false,

      }
    },
    methods:{
      inputValue:function(val){
        if(val){
          this.form[this.name.name]=val;
        }
        if(this.name.fieldClass==='int'||this.name.fieldClass==='double'){
          this.form[this.name.name]=Number(this.form[this.name.name]);
        }
        this.$emit('inputValue',this.form)
      },
      handleTableData:function(){
        this.dialogVisible=true;
      },
      handleDialogVisible:function(){
        this.dialogVisible=false;
      },
      isEmpty:function(){
        if(this.name.type==='List'){
          this.form[this.name.name]=[];
        }else{
          this.form[this.name.name]=''
        }
      },

    },
    created() {
      this.$set(this.form,this.name.name,this.list[this.name.name]);
    }

  }
</script>
<style>
  .f2 .el-select-dropdown{
    display: none;
  }
</style>
<style scoped>

  .my-autocomplete  li {
    line-height: normal;
    padding: 7px;
  }
  .my-autocomplete .name {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .my-autocomplete .addr {
    font-size: 12px;
    color: #b4b4b4;
  }

  .my-autocomplete .highlighted .addr {
    color: #ddd;
  }


</style>
