import axios from '../axios'
import {addBean, queryBean, updateBean} from "../base";

/* 
 * 题库管理模块
 */

// 保存
let baseUrl=null;
let typeName = 'ExamResult';
export const save = (data) => {
  let doc = {
    examPaperId: data.examPaperId,                  //试卷
    examResultAnswerIds:data.examResultAnswerIds,   //学生的答案ids
    objCorrect:parseFloat(data.objCorrect),           //客观题做对分值
    reviewerId:data.reviewerId,
    anonymous:data.anonymous
  };


  if(data.id==0){ //新增
    return addBean(typeName, doc)
  }else { //修改
    return updateBean(typeName, data.id, doc)
  }


};
// 删除
export const batchDelete = (data) => {
  console.log(data);
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
// 查询全部
export const findAll = () => {
  return queryBean(typeName, {
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

