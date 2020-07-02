<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="课程"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" v-if="hasPerms('teach:curriculum:edit')" perms="teach:curriculum:edit" type="primary" @click="handleAdd" />
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
    <kt-table
      :height="700"
      permsEdit="teach:curriculum:edit"
      permsDelete="teach:curriculum:delete"
      permsDetail=""
      permsRecord=""
      permsPass="sys:user:view"
      :btnWidth="180"
      :maxHeight="700"
      :data="pageResult"
      :columns="filterColumns"
      @findPage="findPage"
      @handleEdit="handleEdit"
      @handleDelete="handleDelete"
      @handleDetail="handleDetail"
      @handlePass="handlePass"
      @handleRecord="handleRecord"
      @handleApprove="handleApprove"
      :showBtnPass="hasPerms('sys:user:view')"
      :showBtnEdit="hasPerms('teach:curriculum:edit')"
      :showBtnDelete="hasPerms('teach:curriculum:delete')"
      :showBtnApprove="hasPerms('teach:curriculum:edit')"
      :showBtnRecord="true"
      :showBtnDetail="true">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="100px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="实验室课程" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" :disabled="operation?false:true"></el-input>
        </el-form-item>
        <el-form-item label="课程备注" prop="content">
          <el-input v-model="dataForm.content" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="学生成员" prop="members">
          <el-select
            v-model="dataForm.memberIds"
            multiple
            filterable
            :disabled="true"
            remote
            reserve-keyword
            :remote-method="remoteMethod"
            placeholder="请添加成员"
            style="width: 70%;">
            <el-option v-for="item in userAll" :key="item.name"
                       :label="item.nickname" :value="item.id">
            </el-option>
          </el-select>
          <!--          <div class="memberInfo">-->
          <!--            <span v-for="item in dataForm.memberIds" :key="item">{{item}}</span>-->
          <!--          </div>-->
          <el-button :size="size" @click.native="showMembers(dataForm.memberIds,null)">{{operation?'新增':'修改'}}</el-button>
        </el-form-item>
        <el-form-item label="实验室" prop="labRoomIds">
          <el-select v-model="dataForm.labRoomIds" multiple filterable placeholder="请选择"
                     style="width: 100%;">
            <el-option v-for="item in lab" :key="item.name"
                       :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联实验" prop="expTemplateId" >
          <el-select
            v-model="dataForm.expTypeName"
            filterable
            placeholder="请选择"
            :disabled="operation?false:true"
            @change="typeNameChange"
            clearable
            style="width: 100%;">
            <el-option v-for="item in experiment" :key="item.simpleName"
                       :label="item.zhName" :value="item.simpleName">
            </el-option>
          </el-select>
        </el-form-item>
        <div v-if="dataForm.expTypeName === 'ExpTwo'">
          <ExperimentInput
            :name="item"
            v-for="item in tableNavs"
            :list="dataTemplateForm"
            :key="item.id"
            :operation="operation"
            @inputValue="inputValue"
            ref="isEmpty"
            v-if="reFresh"></ExperimentInput>
        </div>
        <div v-if="dataForm.expTypeName === 'ExpOne'">
          <el-form-item label="实验动物" prop="expAnimalIds">
            <div class="question_type">
              <div class="question_type_title" style="padding-bottom: 1px;">

                <i class="el-icon-circle-plus" @click="addAnimals"></i>
              </div>
              <el-table
                :data="dataTemplateForm.expAnimalList"
                size="mini"
                border
                style="width: 100%">
                <el-table-column
                  prop="name"
                  label="动物名称"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="minWeight"
                  label="最小体重(g)"
                  width="100">
                </el-table-column>
                <el-table-column
                  prop="maxWeight"
                  label="最大体重(g)"
                  width="100">
                </el-table-column>
                <el-table-column
                  prop="amount"
                  label="数量">
                </el-table-column>
                <el-table-column
                  prop="mf"
                  label="雌雄">
                  <template slot-scope="scope">
                    {{scope.row.mf === 0 ? '雌' : '雄'}}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="monthAge"
                  label="月龄">
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="50">
                  <template slot-scope="scope">
                    <i class="el-icon-delete" @click="handleDeleting(scope.$index, scope.row)"></i>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-form-item>
          <el-form-item label="指标观测" prop="indicator">
            <el-input v-model="dataTemplateForm.indicator[0]"  type="textarea" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="实验药品" prop="medicine">
            <el-input v-model="dataTemplateForm.medicine[0]" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="实验器材" prop="apparatus">
            <el-input v-model="dataTemplateForm.apparatus[0]" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="步骤"  prop="steps">
            <el-input v-model="dataTemplateForm.steps[0]" :rows="5" type="textarea" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="放血时间" prop="pj11">
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj11[0]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj11[1]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataTemplateForm.pj11Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="map上升至基础值的x" prop="pj12">
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj12[0]" auto-complete="off">
                <template slot="append">%</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj12[1]" auto-complete="off">
                <template slot="append">%</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataTemplateForm.pj12Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="血压平稳时间" prop="pj13">
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj13[0]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj13[1]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataTemplateForm.pj13Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="x分钟内进行wap测定" prop="pj21">
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj21[0]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj21[1]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataTemplateForm.pj21Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="map下降" prop="pj22">
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj22[0]" auto-complete="off">
                <template slot="append">%</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj22[1]" auto-complete="off">
                <template slot="append">%</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataTemplateForm.pj22Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="血压平稳时间" prop="pj23">
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj23[0]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj23[1]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataTemplateForm.pj23Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="存活时间" prop="pj31">
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj31[0]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataTemplateForm.pj31[1]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataTemplateForm.pj31Score" auto-complete="off"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="实验类型" prop="publicType" >
          <el-select v-model="dataForm.publicType"  filterable placeholder="请选择"
                     style="width: 100%;">
            <el-option label="教学实验" :value="1"></el-option>
            <el-option label="开放实验" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="课程时间" prop="datetime">
          <el-date-picker
            v-model.trim="dataForm.datetime"
            @input="datetimeChange"
            type="daterange"
            value-format="timestamp"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
<!--      添加动物-->
      <el-dialog
        width="40%"
        title="添加动物属性"
        :visible.sync="animalsVisible"
        :close-on-click-modal="false"
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

    </el-dialog>
    <!--      添加成员-->
    <el-dialog
      width="60%"
      title="获取成员"
      :visible.sync="innerVisible"
      append-to-body>
      <GetUser :memberData="memberInfo" :limit="limit" @memberData="getMemberInfo" v-if="innerVisible"></GetUser>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="innerVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="addMembers" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
<!--    详情内容-->
    <el-dialog
      width="60%"
      title="详情"
      :visible.sync="detailVisible">
<!--      <div v-if="expTemplate.name">-->
<!--        <p v-if="expTemplate.name"><span>实验名称：</span>{{expTemplate.name}}</p>-->
<!--        <p v-if="expTemplate.code"><span>实验类型：</span>{{expTemplate.code===1?'动物休克模型教学实验':'其他教学实验'}}</p>-->
<!--        <p v-if="expTemplate.code"><span>指标观测：</span>{{expTemplate.indicator[0]}}</p>-->
<!--        <p v-if="expTemplate.code"><span>实验药品：</span>{{expTemplate.medicine[0]}}</p>-->
<!--        <p v-if="expTemplate.code"><span>实验器材：</span>{{expTemplate.apparatus[0]}}</p>-->
<!--        <p v-if="expTemplate.code"><span>步骤：</span>{{expTemplate.steps[0]}}</p>-->
<!--        <p v-if="expTemplate.code"><span>实验动物：</span></p>-->
<!--        <el-table-->
<!--          v-if="expTemplate.code"-->
<!--          :data="expTemplate.expAnimalList"-->
<!--          size="mini"-->
<!--          border-->
<!--          style="width: 100%">-->
<!--          <el-table-column-->
<!--            prop="name"-->
<!--            label="动物名称"-->
<!--            show-overflow-tooltip>-->
<!--          </el-table-column>-->
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
<!--        </el-table>-->
<!--        <p ><span>放血时间：</span>{{expTemplate.pj11}}Min</p>-->
<!--        <p ><span>map上升至基础值的x：</span>{{expTemplate.pj12[0]+'-'+expTemplate.pj12[1]}}%</p>-->
<!--        <p ><span>血压平稳时间：</span>{{expTemplate.pj13}}Min</p>-->
<!--        <p ><span>x分钟内进行wap测定：</span>{{expTemplate.pj21}}Min</p>-->
<!--        <p ><span>map下降：</span>{{expTemplate.pj22[0]+'-'+expTemplate.pj22[1]}}%</p>-->
<!--        <p ><span>血压平稳时间：</span>{{expTemplate.pj23}}Min</p>-->
<!--        <p ><span>存活时间：</span>{{expTemplate.pj31}}Min</p>-->
<!--        <el-table-->
<!--          :data="memberData"-->
<!--          stripe-->
<!--          style="width: 100%">-->
<!--          <el-table-column-->
<!--            prop="nickname"-->
<!--            label="学生姓名"-->
<!--          >-->
<!--          </el-table-column>-->
<!--          <el-table-column-->
<!--            prop="deptName"-->
<!--            label="所在班级"-->
<!--          >-->
<!--          </el-table-column>-->
<!--        </el-table>-->
<!--      </div>-->
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="detailVisible = false">{{$t('action.cancel')}}</el-button>
      </div>
    </el-dialog>
    <!--导入实验数据-->
    <el-dialog title="导入实验数据" width="60%" :visible.sync="dialogVisibleBatch" :close-on-click-modal="false">
      <div style="margin-bottom:20px;">
        <el-select
          size="mini"
          v-model="importMemberIds"
          multiple
          filterable
          remote
          disabled
          reserve-keyword
          :remote-method="remoteMethod"
          placeholder="请添加成员"
          style="width: 70%;">
          <el-option v-for="item in userAll" :key="item.name"
                     :label="item.nickname" :value="item.id">
          </el-option>
        </el-select>
        <el-button :size="size" @click.native="showMembers(importMemberIds,1)">选择学生</el-button>
      </div>
      <div class="batchAddHeader">
        <el-upload
          ref="upload"
          action="/"
          :show-file-list="false"
          :on-change="importExcel1"
          :auto-upload="false">
          <kt-button
            slot="trigger"
            icon="el-icon-upload"
            label="导入实验数据"
            perms="sys:user:add"
            type="primary" />
        </el-upload>
<!--        <a href="/static/批量导入用户模板.xlsx" download="批量导入用户模板.xlsx">下载模板</a>-->
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
  import KtTable from "@/views/Core/ExperimentTable"
  import KtButton from "@/views/Core/KtButton"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import ExperimentInput from "@/components/DataManager/ExperimentInput"
  import { format,formatData } from "@/utils/datetime"
  import {addBean, queryBean, updateBean, addBatchBean} from "@/http/base";
  import { getIFrameUrl, getIFramePath } from '@/utils/iframe'
  import store from '@/store'
  import GetUser from "@/components/ObjectSelect/GetUser"
  import { hasPermission } from '@/permission/index.js'
  export default {
    name:'Experiment',
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      GetUser,
      ExperimentInput
    },
    data() {
      return {
        size: 'mini',
        filters: {
          name: ''
        },
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        pageResult: {},
        detailVisible:false,
        operation: false, // true:新增, false:编辑
        dialogVisible: false, // 新增编辑界面是否显示
        editLoading: false,
        dataFormRules: {
          title: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ]
        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          name: '',
          content: '',
          memberIds: [],
          labRoomIds:[],
          datetime:[],
          reviewer:'',
          publicType:'',
          expTemplateId:'',
          expAnimalIds:[],
        },
        deptData: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        roles: [],
        innerVisible:false, //获取用户弹出框显示
        dialogVisibleBatch:false, //批量导入数据弹出框显示
        animalsVisible:false,
        memberInfo:[], //成员id
        limit:null,
        lab:[], //全部教室
        userAll:[],//全部用户
        memberData:[], //课程成员信息
        reviewer:[], //审核人
        animals:[],//所有动物
        experiment:[],//所有实验
        expTemplate:{},
        expTypeName:'',
        dataTemplateForm: {
          pj11:[55,65],
          pj11Score:15,
          pj12:[75,85],
          pj12Score:15,
          pj13:[15,100],
          pj13Score:15,
          pj21:[5,10],
          pj21Score:15,
          pj22:[20,30],
          pj22Score:15,
          pj23:[30,100],
          pj23Score:15,
          pj31:[10,100],
          pj31Score:10,
          indicator: ['①　使用多道生理记录仪对MAP、心率、体温等进行连续监测。\n' +
          '②　使用血气仪对动脉血氧血气进行定时测定。'],
          medicine:['戊巴比妥钠、肝素钠、乳酸Ringers溶液。'],
          apparatus:['血气仪、多道生理记录仪、引导管、自制保温装置。'],
          steps:['诱导休克模型制备：\n' +
          '①　大鼠腹腔注射戊巴比妥钠麻醉 ( 50 mg/ kg w ) 。\n' +
          '②　外颈静脉插管, 注入肝素钠抗凝(1000 IU/ kg)。\n' +
          '③　颈动脉插管，用于动脉压的监测。\n' +
          '④　股动脉插管，用于放血和采集血样。\n' +
          '⑤  用保温装置控制大鼠麻醉态体温在( 35±1℃) 。放血过程持续60min，放血过程采用梯度放血期加上血量调节期的双阶段放血方式。'],
          expAnimalList:[
            {
              name:'Wistar 大鼠',
              minWeight:'290',
              maxWeight:'310',
              amount:5,
              mf:1,
              monthAge:'10',
            },
          ],
          field1:'颈动脉插管',
          field2:'股动脉插管'
        },
        animalForm:{
          name:'Wistar 大鼠',
          minWeight:'290',
          maxWeight:'310',
          amount:5,
          mf:1,
          monthAge:'10',
        }, //动物表单
        importData:[
          {prop:'value1',label:'数值1'},
          {prop:'value2',label:'数值2'},
          {prop:'value3',label:'数值3'},
          {prop:'value4',label:'数值4'},
        ],
        importMemberIds:[]
      }
    },
    // watch:{
    //   'dataForm.datetime':function(val,oldval){
    //     if(this.setupData.ifReturnPage && (isNaN(val) || val>10 || val<0)){
    //       setTimeout(()=>{
    //         this.$set(this.setupData,'returnCD',oldval);
    //       },1)
    //     }
    //   }
    // },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        let pageRequest={
          pageNum: 1,
          pageSize: 10 ,
          sort:{
            insertDt:-1,
          },
          condition:{}
        };
        if(data !== null) {
          pageRequest = data.pageRequest
        }
        if(!this.hasPerms('teach:curriculum:edit')){
          pageRequest.condition.status=1;
        }
        if(this.filters.name){
          pageRequest.condition['name$regex'] = this.filters.name;
        }
        this.$api.experiment.findPage(pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },

      // 批量删除
      handleDelete: function (data) {
        this.$api.experiment.batchDelete(data.params).then(data!=null?data.callback:'')
      },
      // 显示新增界面
      handleAdd: function () {
        this.findlabroom();
        this.dialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          name: '',
          content: '',
          memberIds: [],
          labRoomIds:[],
          datetime:[],
          reviewer:'',
          publicType:'',
          expTemplateId:'',
          expAnimalIds:[],
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        console.log(params);
        this.findlabroom();
        this.dialogVisible = true;
        this.operation = false;
        this.dataForm = Object.assign({}, params.row);
        if(this.dataForm.expTypeName === 'ExpOne'){
          this.dataTemplateForm = Object.assign({}, params.row.expOne);
        }else if(this.dataForm.expTypeName === 'ExpTwo'){
          this.dataTemplateForm = Object.assign({}, params.row.expTwo);
        }else{
          this.dataTemplateForm= {
            pj11:[55,65],
              pj11Score:15,
              pj12:[75,85],
              pj12Score:15,
              pj13:[15,100],
              pj13Score:15,
              pj21:[5,10],
              pj21Score:15,
              pj22:[20,30],
              pj22Score:15,
              pj23:[30,100],
              pj23Score:15,
              pj31:[10,100],
              pj31Score:10,
              indicator: ['①　使用多道生理记录仪对MAP、心率、体温等进行连续监测。\n' +
            '②　使用血气仪对动脉血氧血气进行定时测定。'],
              medicine:['戊巴比妥钠、肝素钠、乳酸Ringers溶液。'],
              apparatus:['血气仪、多道生理记录仪、引导管、自制保温装置。'],
              steps:['诱导休克模型制备：\n' +
            '①　大鼠腹腔注射戊巴比妥钠麻醉 ( 50 mg/ kg w ) 。\n' +
            '②　外颈静脉插管, 注入肝素钠抗凝(1000 IU/ kg)。\n' +
            '③　颈动脉插管，用于动脉压的监测。\n' +
            '④　股动脉插管，用于放血和采集血样。\n' +
            '⑤  用保温装置控制大鼠麻醉态体温在( 35±1℃) 。放血过程持续60min，放血过程采用梯度放血期加上血量调节期的双阶段放血方式。'],
              expAnimalList:[
              {
                name:'Wistar 大鼠',
                minWeight:'290',
                maxWeight:'310',
                amount:5,
                mf:1,
                monthAge:'10',
              },
            ],
              field1:'颈动脉插管',
              field2:'股动脉插管'
          }
        }
        this.publicType=String(params.row.publicType);
        this.$set(this.dataForm, "datetime", [params.row.startTime, params.row.endTime]);
        this.memberInfo=this.dataForm.memberIds;

      },
      //显示成员框
      showMembers:function(val, limit){
        this.memberInfo = val;
        this.limit = limit;
        this.innerVisible = true;
      },
      // 查看
      handleDetail: function(params) {
        this.detailVisible = true;
        console.log(params);
        this.memberData=params.row.members;
        this.expTemplate=params.row.expTemplate;
        // // 如果是嵌套页面，转换成iframe的path
        // let path = getIFramePath('Teach/CurriculumDetail?id='+params.row.id);
        // if(!path) {
        //   path = 'Teach/CurriculumDetail?id='+params.row.id
        // }
        // // 通过菜单URL跳转至指定路由
        // this.$router.push("/" + path)
      },
      //导入数据
      handleApprove:function(params){
        this.importData = Object.assign({},params.row);
        if(params.row.expTypeName === 'ExpTwo'){
          let importData=[
            {prop:'value1',label:'Time'},
            {prop:'value2',label:'Sample count'},
            {prop:'value3',label:'IR count（红外）'},
            {prop:'value4',label:'Red count（红光）'},
            {prop:'value5',label:'Raw ECG'},
            {prop:'value6',label:'Raw ECG(mv)'},
            {prop:'value7',label:'Filtered ECG'},
            {prop:'value8',label:'Filtered ECG(mv)'},
          ]
          this.importData.dict = importData;
        }else{
          let importData=[
            {prop:'value1',label:'数值1'},
            {prop:'value2',label:'数值2'},
            {prop:'value3',label:'数值3'},
            {prop:'value4',label:'数值4'},
          ]
          this.importData.dict = importData;
        }
        console.log(this.importData);
        this.importMemberIds=[];
        this.dialogVisibleBatch = true
      },
      //批量导入excle
      importExcel1(file) {
        let that = this;
        const types = file.name.split('.')[1];
        this.fileName=file.name;
        const fileType = ['xlsx', 'xlc', 'xlm', 'xls', 'xlt', 'xlw', 'csv'].some(item => item === types);
        if (!fileType) {
          this.$message('文件格式错误！请重新选择');
          return;
        }else {
          let _this = this;
          // 通过DOM取文件数据
          this.file = event.currentTarget.files[0];
          // this.file = event.currentTarget.files[0];
          var rABS = false; //是否将文件读取为二进制字符串
          var f = this.file;
          var reader = new FileReader();
          //if (!FileReader.prototype.readAsBinaryString) {
          FileReader.prototype.readAsBinaryString = function(f) {
            var binary = "";
            var rABS = false; //是否将文件读取为二进制字符串
            var wb; //读取完成的数据
            var outdata;
            var reader = new FileReader();
            reader.onload = function(e) {
              var bytes = new Uint8Array(reader.result);
              var length = bytes.byteLength;
              for(var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              var XLSX = require('xlsx');
              if(rABS) {
                wb = XLSX.read(btoa(fixdata(binary)), { //手动转化
                  type: 'base64'
                });
              } else {
                wb = XLSX.read(binary, {
                  type: 'binary'
                });
              }
              outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
              //outdata就是你想要的东西
              this.da = [...outdata];
              let tableData = this.da.map(item => {
                var arr={}
                that.importData.dict.forEach(i =>{
                  arr[i.prop] =  item[i.label];
                })
                return arr;
              });
              console.log(tableData);
              _this.tableData=tableData;
            };
            reader.readAsArrayBuffer(f);
          };
          if(rABS) {
            reader.readAsArrayBuffer(f);
          } else {
            reader.readAsBinaryString(f);
          }
        }
      },

      //实验结果数据批量添加按钮
      BatchAdd:function () {
        var that = this;
        let expTypeName = this.importData.expTypeName;
        let resultPost = {
          userid : this.importMemberIds[0]
        }

        if(that.tableData && resultPost.userid){
          addBean(expTypeName+'Result', resultPost)
            .then(res =>{
              let experimentId = expTypeName.replace(expTypeName[0],expTypeName[0].toLowerCase()) + 'ResultId';
              let ExperimentResultPostData={
                userid : that.importMemberIds[0],
                experimentId:that.importData.id,
                [experimentId]:res.bean.id
              };
              addBean('ExperimentResult',ExperimentResultPostData)
                .then(res =>{
                  let experimentResultId = res.bean.id;
                  let tableData = that.tableData.map(item =>{
                    item.experimentResultId = experimentResultId;
                    return item
                  });
                  addBatchBean(expTypeName+'OriginResult',tableData)
                    .then(res =>{
                      console.log(res);
                      this.dialogVisibleBatch = false;
                    })
                })
            })
          // this.$api.experiment.addBatchBean(that.tableData)
          //   .then(function (res) {
          //     if(res.retCode === 0){
          //       console.log(res.bean);
          //       that.$message("导入成功");
          //       that.editLoading = false;
          //       that.dialogVisibleBatch=false;
          //       that.findPage(null);
          //       that.tableData = [];
          //     }
          //   }).catch(function (error) {
          //   that.$message(error);
          // })
          console.log(that.tableData)
        }else{
          that.$message("导入数据为空 或 没选择学生");
        }

      },
      //记录
      handleRecord:function(params){
        console.log(params)
        this.$router.push({path:'expresult',query:{id : params.row.id}});


      },
      //通过
      handlePass:function(params){
        let oldState='待审核';
        let state='启用';
        let status=1;
        if(params.row.status===1){
          oldState='启用';
          state='停用';
          status=2;
        }else if(params.row.status===2){
          oldState='停用';
          state='启用';
          status=1;
        }else{
          oldState='待审核';
          state='启用';
          status=1;
        }
        this.$prompt(`请备注说明${state}课程的原因`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(({value}) => {
          let postData={
            status:status,
            reviewerId:sessionStorage.getItem('userid')
          };
          let doc={
            targetName:'Experiment',
            targetId:params.row.id,
            content:value,
            title:`${oldState} -> ${state}`
          };
          updateBean('Experiment', params.row.id, postData)
            .then(res =>{
              this.findPage(null);
              this.$message({
                type: 'success',
                message: `${state}成功!`
              });
            });
          addBean('OperateMark',doc)
            .then(res =>{

            })
            .catch(err =>{
              this.$message(err)
            })

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      },
      // 编辑
      submitForm: function () {
        let that = this;
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              if(params.datetime){
                params.startTime=params.datetime[0];
                params.endTime=params.datetime[1];
              }
              let dataTemplateForm =Object.assign({},this.dataTemplateForm);
              if(!dataTemplateForm.id && params.expTypeName){
                addBean(params.expTypeName,dataTemplateForm).then((res) => {
                  console.log(res);
                  if (params.expTypeName === 'ExpOne') {
                    params['expOneId'] = res.bean.id
                  }else if(params.expTypeName === 'ExpTwo'){
                    params['expTwoId'] = res.bean.id
                  }
                  that.$api.experiment.save(params).then((res) => {

                    that.editLoading = false;
                    that.dialogVisible = false;
                    that.$refs['dataForm'].resetFields();
                    that.findPage(null)
                  })
                })
              }else{
                updateBean(params.expTypeName,dataTemplateForm.id,dataTemplateForm)
                  .then(res =>{
                    that.$api.experiment.save(params).then((res) => {
                      that.editLoading = false;
                      that.dialogVisible = false;
                      that.$refs['dataForm'].resetFields();
                      that.findPage(null)
                    })
                  })
              }
            })
          }
        })
      },
      // 获取用户组列表
      findDeptTree: function () {
        this.$api.dept.findDeptTree().then((res) => {
          this.deptData = res.bean.data
        })
      },
      // 加载实验室信息
      findlabroom: function () {
        this.$api.labroom.findAll().then((res) => {
          // 加载实验室集合
          this.lab = res.bean.data
        })
      },
      // 加载动物信息
      findanimal: function () {
        let postData={
          type:'animal',
        };
        queryBean('Dict',postData).then((res) => {
          // 加载实验室集合
          this.animals=res.bean.data;
        })
      },
      // 加载关联实验
      findexperiment: function () {

        this.$api.experiment.findExpTableList().then((res) => {
          // 加载实验室集合
          this.experiment=res.bean;
        })
      },
      // 菜单树选中
      deptTreeCurrentChangeHandle (data, node) {
        this.dataForm.deptmentId = data.id;
        this.dataForm.deptName = data.name
      },
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){
        return formatData(row.startTime)+'-'+formatData(row.endTime)
      },
      // 处理表格列过滤显示
      displayFilterColumnsDialog: function () {
        this.$refs.tableColumnFilterDialog.setDialogVisible(true)
      },
      // 处理表格列过滤显示
      handleFilterColumns: function (data) {
        this.filterColumns = data.filterColumns;
        this.$refs.tableColumnFilterDialog.setDialogVisible(false)
      },
      // 处理表格列过滤显示
      initColumns: function () {
        this.columns = [
          /*{prop:"id", label:"ID", minWidth:50},*/
          {prop:"name", label:"课程", minWidth:120},
          {prop:"content", label:"课程备注", minWidth:120},
          {prop:"startTime", label:"课程时间", minWidth:120,formatter:this.dateFormat},
          // {prop:"labRoomIds", label:"实验室", minWidth:100,formatter: this.labFilter},
          {prop:"reviewer.name", label:"审核人", minWidth:120},
          {prop:"status", label:"审核状态", minWidth:100,formatter: this.statusFilter},
          // {prop:"createBy", label:"创建人", minWidth:120},
          // {prop:"createTime", label:"创建时间", minWidth:120, formatter:this.dateFormat}
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ];
        this.filterColumns = this.columns;
      },

      getMemberInfo:function(val){
        this.memberInfo=val;
      },
      addMembers:function(){
        this.dataForm.memberIds=this.memberInfo;
        this.importMemberIds=this.memberInfo;
        this.innerVisible=false;
        this.memberInfo=[];
      },
      //过滤实验室字段
      labFilter:function(row, column, cellValue, index){
        let name=row.labRoomIds.map((item)=>{
          for(let key of this.lab){
            if(key.id===item){
              return key.name
            }
          }
        });
        return name.join(',');
      },
      //过滤审核人字段
      reviewerFilter:function(row, column, cellValue, index){
        if(row.reviewer){
          let reviewer=this.userAll.find((item)=>{
            if(row.reviewer===item.id){
              return item.nickname
            }
          });
          if(reviewer){
            return reviewer.nickname;
          }
        }else{
          return '无'
        }
      },
      //过滤状态字段
      statusFilter:function(row, column, cellValue, index){
        if(row.status===0){
          return '待审核';
        }else if(row.status === 1){
          return '启用';
        }else{
          return '停用';
        }
      },
      datetimeChange:function(val){
        this.$nextTick(() => {
          this.dataForm.datetime = null;
          this.$set(this.dataForm, "datetime", [val[0], val[1]]);
        });
      },
      remoteMethod:function(){

      },
      //查找所有用户
      findAccount:function(){
        this.$api.user.findAll().then((res) => {
          this.userAll = res.bean.data
        })
      },
      //查找审核人角色的用户
      findReviewer:function(){
        let postData={
          roleIdList:'5d312e18e7675a1173e84de5'
        };
        queryBean('UserRoles',postData).then((res) => {
          this.reviewer = res.bean.data.map((item) =>{
            return {
              userid:item.userid,
              nickname:item.user.nickname,
            }
          })
        })
      },
      hasPerms: function (perms) {
        // 根据权限标识和外部指示状态进行权限判断
        return hasPermission(perms)

      },
      typeNameChange:function(val){
        console.log(val);
        this.$api.data.findTableInfo(val)
          .then(res => {
            this.inputsInfo = res.bean.fieldProps;
            let arr = [];
            this.inputsInfo.forEach(item => {
              if (item.name !== 'id' && item.name !== '_id' && item.name !== 'flag') {
                arr.push(item);
              }
            });
            console.log(this.inputsInfo);
          })
        this.dataForm.expTypeName = val;
      },
      //删除动物列表
      handleDeleting:function(index,row){
        this.dataTemplateForm.expAnimalList.splice(index,1);
      },
      // 添加动物
      addAnimals:function(){
        this.animalsVisible=true;
      },
      // 提交动物表单
      animalSubmitForm:function(){
        let animalForm=Object.assign({},this.animalForm);
        this.dataTemplateForm.expAnimalList.push(animalForm);
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
      inputValue:function(val){
        this.dataTemplateForm = Object.assign(this.dataTemplateForm, val);
        console.log(this.dataTemplateForm)
      },

    },
    mounted() {
      this.findAccount();
      this.findexperiment();
      this.initColumns();
    }
  }
</script>

<style scoped>

</style>
