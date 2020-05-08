<template>
  <div>
    <el-form-item
      v-if="name.editable || !operation"
      :label="name.zhName"
      :prop="name.name"
      :key="name.name">
      <el-input
        v-if="name.fieldType === 'INPUT' && (name.fieldClass === 'Integer' || name.fieldClass === 'int' || name.fieldClass === 'String' || name.fieldClass === 'Float')"
        :type="(name.fieldClass === 'int' || name.valueClass==='Integer'||name.valueClass ==='Float')?'number':'text'"
        v-model="form[name.name]"
        @change="inputValue"
        :disabled="!name.editable">
        <template slot="append" v-if="name.desc">{{name.desc}}</template>
      </el-input>
      <div v-if="name.fieldType === 'INPUT' && name.fieldClass === 'List' && name.size === 0">
        <el-input
          :type="(name.valueClass==='Integer'|| name.valueClass ==='Float')?'number':'text'"
          v-for="(item,index) in form[name.name]"
          :key="index"
          :placeholder="name.zhName + (index+1)"
          v-model="form[name.name][index]"
          @change="inputValue(form[name.name][index],index)"
          :disabled="!name.editable">
          <template slot="append" v-if="name.desc">{{name.desc}}</template>
        </el-input>
        <el-button @click="addNameArray(form[name.name])">添加</el-button>
      </div>

      <el-row v-if="name.fieldType === 'INPUT' && name.fieldClass === 'List' && name.size === 2">
        <el-col :span="11">
          <el-input
            v-model="form[name.name][0]"
            :type="(name.valueClass==='Integer' || name.valueClass ==='Float')?'number':'text'"
            @change="inputValue(form[name.name][0],0)"
            auto-complete="off" :key="0">
            <template slot="append" v-if="name.desc">{{name.desc}}</template>
          </el-input>
        </el-col>
        <el-col style="text-align: center;" :span="2">
          -
        </el-col>
        <el-col :span="11">
          <el-input
            v-model="form[name.name][1]"
            :type="(name.valueClass==='Integer'|| name.valueClass ==='Float')?'number':'text'"
            @change="inputValue(form[name.name][1],1)"
            auto-complete="off" :key="1">
            <template slot="append" v-if="name.desc">{{name.desc}}</template>
          </el-input>
        </el-col>
      </el-row>
      <div class="question_type" v-if="name.fieldType === 'CLASS' && name.fieldClass === 'List'">
        <div class="question_type_title" style="padding-bottom: 1px;">

          <i class="el-icon-circle-plus" @click="addAnimals"></i>
        </div>
        <el-table
          v-if="form[name.name].length > 0"
          :data="form[name.name]"
          size="mini"
          border
          style="width: 100%">
          <el-table-column
            v-for="item in name.fieldProps"
            :key="item.name"
            :prop="item.name"
            :label="item.zhName"
            show-overflow-tooltip>
          </el-table-column>
<!--          <el-table-column-->
<!--            prop="minWeight"-->
<!--            label="最小体重(g)"-->
<!--            width="100">-->
<!--          </el-table-column>-->
<!--          <el-table-column-->
<!--            prop="maxWeight"-->
<!--            label="最大体重(g)"-->
<!--            width="100">-->
<!--          </el-table-column>-->
<!--          <el-table-column-->
<!--            prop="amount"-->
<!--            label="数量">-->
<!--          </el-table-column>-->
<!--          <el-table-column-->
<!--            prop="mf"-->
<!--            label="雌雄">-->
<!--            <template slot-scope="scope">-->
<!--              {{scope.row.mf === 0 ? '雌' : '雄'}}-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column-->
<!--            prop="monthAge"-->
<!--            label="月龄">-->
<!--          </el-table-column>-->
          <el-table-column label="操作" fixed="right" width="50">
            <template slot-scope="scope">
              <i class="el-icon-delete" @click="handleDeleting(scope.$index, scope.row)"></i>
            </template>
          </el-table-column>
        </el-table>
      </div>
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
    <!--      添加动物-->
    <el-dialog
      width="40%"
      title="添加动物属性"
      :visible.sync="animalsVisible"
      :close-on-click-modal="false"
      v-if="name.fieldType === 'CLASS' && name.fieldClass === 'List'"
      append-to-body>
      <el-form :model="animalForm" label-width="100px"  ref="animalForm" :size="size">
        <el-form-item label="动物名称" >
          <el-input v-model="animalForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="最小体重(g)" >
          <el-input v-model="animalForm.minWeight" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="最大体重(g)" >
          <el-input v-model="animalForm.maxWeight" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="数量" >
          <el-input v-model.number="animalForm.amount" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="雌雄" >
          <el-select
            v-model="animalForm.mf"
            placeholder="请选择"
            style="width: 100%;">
            <el-option label="雌" :value='0'></el-option>
            <el-option label="雄" :value='1'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="月龄" >
          <el-input v-model="animalForm.monthAge" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="animalsVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="animalSubmitForm">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
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
        animalsVisible:false,
        animalForm:{
          name:'Wistar 大鼠',
          minWeight:'290',
          maxWeight:'310',
          amount:5,
          mf:1,
          monthAge:'10',
        }, //动物表单
      }
    },
    methods:{
      inputValue:function(val,num){
        console.log(val)
        console.log(num);
        console.log(this.name.name);
        if(this.name.fieldClass === 'List'){
          this.form[this.name.name][num] = this.isValueClass(val);
        }else{
          this.form[this.name.name] = this.isValueClass(val);
        }
        // if(this.name.fieldClass==='int'||this.name.fieldClass==='double'){
        //   this.form[this.name.name]=Number(this.form[this.name.name]);
        // }
        this.$emit('inputValue',this.form)
      },
      handleTableData:function(){
        this.dialogVisible=true;
      },
      handleDialogVisible:function(){
        this.dialogVisible=false;
      },
      isValueClass:function(val){
        if(val){
          if(this.name.valueClass === 'Integer' || this.name.valueClass === 'Float'){
            console.log('int');
            return Number(val)
          }else if(this.name.valueClass === 'String'){
            console.log('String');
            return String(val)
          }else{
            console.log('123');
            return val;
          }
        }else{
          return val;
        }
      },
      addNameArray:function(val){
        val.push('');
      },
      //删除动物列表
      handleDeleting:function(index,row){
        this.form[this.name.name].splice(index,1);
        this.$emit('inputValue',this.form)
      },
      // 添加动物
      addAnimals:function(){
        this.animalsVisible=true;
      },
      // 提交动物表单
      animalSubmitForm:function(){
        let animalForm=Object.assign({},this.animalForm);
        this.form[this.name.name].push(animalForm);
        this.$emit('inputValue',this.form)
        this.animalsVisible=false;
        this.animalForm={
          name:'小白兔',
          minWeight:'20',
          maxWeight:'30',
          amount:5,
          mf:0,
          monthAge:'10',
        }
      },


    },
    created() {
      this.$set(this.form,this.name.name,this.list[this.name.name]);
      // if(this.name.valueClass === 'ExpAnimal' ){
      //   this.form[this.name.name]=[{
      //     name:'小白兔',
      //     minWeight:'20',
      //     maxWeight:'30',
      //     amount:5,
      //     mf:0,
      //     monthAge:'10',
      //   }]
      // }
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
