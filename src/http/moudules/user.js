import axios from '../axios'
import {addBean, queryBean, updateBean} from "../base";

/*
 * 用户管理模块
 */

// 保存
let baseUrl=null;
let typeName = 'Account'
export const save = (data) => {
  let doc = {
    email:data.email,
    name: data.name,
    nickname: data.nickname,
    passwd:data.passwd,
    deptmentId:data.deptmentId,
    phone:data.phone,
    roleIdList: data.roleIdList
  };

  let doc2 = {
    roleIdList: data.roleIdList
  }


  if(data.id==0){ //新增
    return addBean(typeName, doc)
  }else { //修改
    // updateBean('UserRoles', data.userRolesId, doc2)
    return updateBean(typeName, data.id, doc)
  }


};
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
// 批量删除
export const deleteBatchBean = (data) => {
  let postData = {
    idList: data,
    typeName: typeName
  };
  return axios({
    url: '/removeBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
};

// 查询全部
export const findAll = () => {
  return queryBean(typeName, {
  })
}

// 分页查询
export const findPage = (data) => {
  return queryBean(typeName, data.condition, data)
};
// 查找用户的菜单权限标识集合
export const findPermissions = (params) => {
  let postData = {
  };
  return axios({
    url: '/getUserInfo',
    method: 'post',
    baseUrl: baseUrl,
    data: postData
  })
};
// 查找用户的菜单权限标识集合
export const findAccount = (params) => {
  let postData = {
  };
  return axios({
    url: '/getAccount',
    method: 'post',
    baseUrl: baseUrl,
    data: postData
  })
};
// 查找用户的待完成任务数量
export const getTodoList = (params) => {
  let postData = {
    userid:sessionStorage.getItem('userid')
  };
  return axios({
    url: '/getTodoList',
    method: 'post',
    baseUrl: baseUrl,
    data: postData
  })
};
//批量上傳附件
export const addBatchBean = (data) => {
  let postData = {
    typeName:typeName,
    docs:data
  };
  return axios({
    url: '/addBatchBean',
    method: 'post',
    baseUrl: baseUrl,
    data: postData
  })
};

export const findByDeptId = (deptId) => {
  return queryBean(typeName, {
    deptmentId: deptId
  })
};

export const findByName = (nickname) => {
  return queryBean(typeName, {
    nickname: nickname
  })
};
