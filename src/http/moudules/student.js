import axios from '../axios'
import {addBean, queryBean, updateBean,addBatchBean} from "../base";

/*
 * 用户管理模块
 */

// 保存
let baseUrl=null;
let typeName = 'CourseSelection'
export const save = (data) => {
  let doc = {
    studentId:data.studentId,
    courseTeachingId: data.courseTeachingId,
    annual: data.annual,
    semester: data.semester,
  };
  if(data.id==0){ //新增
    let docs = data.studentId.map(v =>{
      return {
        courseTeachingId: data.courseTeachingId,
        annual: data.annual,
        semester: data.semester,
        studentId:v
      };
    })
    return addBatchBean(typeName, docs)
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
