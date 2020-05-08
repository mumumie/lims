import axios from '../axios'
import {addBean, queryBean, updateBean} from "../base";

/*
 * 用户管理模块
 */

// 保存
let baseUrl=null;
let typeName = 'Experiment';
export const save = (data) => {
  let doc = {
    creator:data.id,
    name: data.name,
    content: data.content,
    memberIds:data.memberIds,
    publicType:Number(data.publicType),
    deptmentIds:data.deptmentIds,
    labRoomIds:data.labRoomIds,
    reviewer:data.reviewer,
    expOneId:data.expOneId,
    expTwoId:data.expTwoId,
    expTypeName:data.expTypeName, //关联实验
    startTime:data.startTime,
    endTime:data.endTime
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

// 查询表名
export const findExpTableList = () => {
  let postData = {
    userid:sessionStorage.getItem('userid'),
    desc: 'EXPERIMENT'
  };
  return axios({
    url:'getTableList',
    method:'post',
    baseUrl: baseUrl,
    data:postData
  })
};
// 查询表名字段
export const findExpTableInfo = (data) => {
  let postData = {
    userid:'test',
    typeName: data
  };
  return axios({
    url:'getTableInfo',
    method:'post',
    baseUrl: baseUrl,
    data:postData
  })
};
