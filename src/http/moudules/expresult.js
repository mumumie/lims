import axios from '../axios'
import {addBean, queryBean, updateBean} from "../base";

/*
 * 用户管理模块
 */

// 保存
let baseUrl=null;
let typeName = 'ExperimentResult';
export const save = (data) => {
  let doc = {

  };


  if(data.id==0){ //新增
    return addBean(typeName, doc)
  }else { //修改
    return updateBean(typeName, data.id, doc)
  }


};
// 删除
export const batchDelete = (data) => {
  let postData = {
    id: data[0].id,
    typeName: typeName
  };
  return axios({
    url: '/deleteBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
};
// 查找
export const getinfo = (data) => {
  let postData = {
    id: data[0].id,
    typeName: typeName
  };
  return axios({
    url: '/deleteBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
};
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

// 重置结果
export const rewriteResult = (id) => {
  let postData = {
    experimentResultId: id
  };
  return axios({
    url: '/rewriteResult',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
};
