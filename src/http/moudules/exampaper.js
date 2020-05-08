import axios from '../axios'
import {addBean, queryBean, updateBean,findMyExamPaper} from "../base";

/* 
 * 题库管理模块
 */

// 保存
let baseUrl=null;
let typeName = 'ExamPaper';
export const save = (data) => {
  let doc = {
    name: data.name,                  //试卷名字
    examQuestIds:data.examQuestIds,   //题目ids
    scoreSum:data.scoreSum,           //卷面总分值
    examPaperScores:data.examPaperScores,           //试卷题目的分值ids
    status:data.status,
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
  return findMyExamPaper(typeName, data.condition, data)
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

