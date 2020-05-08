<template>
  <div class="experiment_dict">
    <div class="experiment_title" v-if="!(name.fieldType === 'CLASS' && name.fieldClass === 'List')">{{name.zhName}} :</div>
    <div class="experiment_content">
      <div v-if="name.fieldType === 'INPUT' && (name.fieldClass === 'Integer' || name.fieldClass === 'int' || name.fieldClass === 'String' || name.fieldClass === 'Float')">
        {{form[name.name]}}<span v-if="name.desc">{{name.desc}}</span>
      </div>
      <div v-if="name.fieldType === 'INPUT' && name.fieldClass === 'List' && name.size === 0">
        <span v-for="(item,index) in form[name.name]" :key="index">
          {{item + ((form[name.name].length-1) === index ? '' : ' ， ')}}
        </span>
      </div>
      <div v-if="name.fieldType === 'INPUT' && name.fieldClass === 'List' && name.size === 2">
        <span v-for="(item,index) in form[name.name]" :key="index">{{item + name.desc + (index === 0 ? ' - ' : '')}}</span>
      </div>
      <div v-if="name.fieldType === 'CLASS' && name.fieldClass === 'List'">
        <div class="experiment_title">{{name.zhName}} :</div>
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
            v-if="item.name !== 'id'  && item.name !== 'insertDt' && item.name !== 'updateDt' && item.name !== 'status'"
            show-overflow-tooltip>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "formInfo",
    props:{
      name:{
        type:Object
      },
      list:{
        type:Object
      },
    },
    data(){
      return {
        form:{},
        listData:[],
        restaurants: [],
        state: '',
        timeout:  null,
        options: [],

      }
    },
    methods:{

    },
    created() {
      this.$set(this.form,this.name.name,this.list[this.name.name]);
    }

  }
</script>
<style scoped>
  .experiment_dict{
    display: flex;
  }
  .experiment_title{
    padding-right:20px;
    font-weight: 600;
  }
  .experiment_content{
    flex: auto;
  }
</style>
