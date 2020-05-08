import axios from '../axios'
import {addBean, queryBean, updateBean} from "../base";

/*
 * 用户管理模块
 */

// 保存
let baseUrl=null;
let typeName = 'ExpTemplate';
export const save = (data) => {
  let doc = {
    name: data.name,
    code:Number(data.code),
    expAnimalList:data.expAnimalList,
    indicator: data.indicator,
    medicine:data.medicine,
    apparatus:data.apparatus,
    steps:data.steps,
    pj11:data.pj11,
    pj11Score:data.pj11Score,
    pj12:data.pj12,
    pj12Score:data.pj12Score,
    pj13:data.pj13,
    pj13Score:data.pj13Score,
    pj21:data.pj21,
    pj21Score:data.pj21Score,
    pj22:data.pj22,
    pj22Score:data.pj22Score,
    pj23:data.pj23,
    pj23Score:data.pj23Score,
    pj31:data.pj31,
    pj31Score:data.pj31Score,
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
