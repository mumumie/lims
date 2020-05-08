import axios from '../axios'
import {addBean, queryBean, updateBean} from "../base";

/* 
 * 题库管理模块
 */

// 保存
let baseUrl=null;
let typeName = 'ExamQuest';
export const save = (data) => {
  let doc = {
    subject: data.subject,            //主题。(选择题,判断题,填空题的题干)(问答题的标题)
    type: Number(data.type),          //题型。1单项选择题 2多项选择题 3判断题 4填空题 5问答
    option:data.option,               //选择题选项
    optionType:data.optionType,
    optionAnswer:data.optionAnswer,   //选择题答案下标
    tfAnswer:data.tfAnswer,           //对错题答案
    blankAnswer:data.blankAnswer,     //填空题答案
    content:data.content,             //问答题正文
    filePath:data.filePath,           //问答题 附件路径
    imgPath:data.imgPath,
    note:data.note,                   //答案解释。学生在评分后可看
    difficulty:Number(data.difficulty),       //难度，分1简单 2中等 3困难
    scoreWeight:parseFloat(data.scoreWeight)
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

