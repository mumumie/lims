import axios from '../axios'
import {addBean, deleteBean, queryBean, updateBean} from '../base'
/*
 * 用户组管理模块
 */
let baseUrl=null;
let typeName = 'Deptment'
export const save = (data) => {
  let doc = {
    name: data.name,
    type:data.type,
    status:data.status,
    parentName:data.parentName,
    parentId: data.parentId,
    orderNum: data.orderNum,
    questBankIds: data.questBankIds,
  }
  if (data.id == 0){ //新增
    return addBean(typeName, doc)
  }else { //修改
    return updateBean(typeName, data.id, doc)
  }
}

// 单个删除
export const singleDelete = (data) => {
  let postData = {
    idList: [data.id],
    typeName: typeName
  };
  return axios({
    url: '/removeBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
};

// 查询用户组树
export const findDeptTree = () => {
  return queryBean(typeName, {parentId: '',/*type:0*/})
}

// 查询
export const findDept = (data) => {
  return queryBean(typeName, data)
}

// 分页查询
export const findPage = (data) => {
  return queryBean(typeName, data.condition, data)
};
