import axios from "./axios";
import _ from "lodash";
import global from '@/utils/global'
let baseUrl = global.baseUrl;
//let baseUrl = "http://localhost:8086"

export const post = (url, data) =>{
  return axios({
    baseUrl: baseUrl,
    url: url,
    method: 'post',
    data: data,
  })
}

export const aggregate = (typeName, groupField, condition) => {
  let pipeline = {$group: {_id: "$"+groupField, count: {$sum: 1}}}
  let postData = {
    typeName: typeName,
    condition: condition,
    exCondition: {pipeline: JSON.stringify(pipeline)}
  }
  return axios({
    baseUrl: baseUrl,
    url: '/aggregate',
    method: 'post',
    data: postData,
  })
};

export const queryBean = (typeName, condition, pageInfo,exCondition) => {
  let postData = {
    typeName: typeName,
    condition: condition,
    exCondition:exCondition,
    pagesize: pageInfo!=undefined && _.isEmpty(pageInfo.pageSize)?pageInfo.pageSize:undefined,
    pageno: pageInfo!=undefined && _.isEmpty(pageInfo.pageNum)?pageInfo.pageNum-1:undefined,
    sort: pageInfo!=undefined && pageInfo.sort!=undefined?pageInfo.sort:undefined
  }
  return axios({
    baseUrl: baseUrl,
    url: '/queryBean',
    method: 'post',
    data: postData,
  })
};

export const findMyExamPaper = (typeName, condition, pageInfo) => {
  let postData = {
    typeName: typeName,
    condition: condition,
    pagesize: pageInfo!=undefined && _.isEmpty(pageInfo.pageSize)?pageInfo.pageSize:undefined,
    pageno: pageInfo!=undefined && _.isEmpty(pageInfo.pageNum)?pageInfo.pageNum-1:undefined,
    sort: pageInfo!=undefined && pageInfo.sort!=undefined?pageInfo.sort:undefined
  }
  return axios({
    baseUrl: baseUrl,
    url: '/findMyExamPaper',
    method: 'post',
    data: postData,
  })
}

export const addBean = (typeName, doc) => {
  let postData = {
    typeName: typeName,
    doc: doc,
  }

  return axios({
    url: '/addBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
}

export const addBatchBean = (typeName, docs) => {
  let postData = {
    typeName: typeName,
    docs: docs,
  }
  return axios({
    url: '/addBatchBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
}
export const updateBatchBean = (typeName,ids, doc) => {
  let postData = {
    typeName: typeName,
    idList:ids,
    doc: doc,
  }

  return axios({
    url: '/updateBatchBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
}
export const updateBatchBean1 = (typeName, docs) => {
  let postData = {
    typeName: typeName,
    docs: docs,
  }

  return axios({
    url: '/updateBatchBean1',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
}

export const updateBean = (typeName, id, doc) => {
  let postData = {
    id: id,
    typeName: typeName,
    doc: doc,
  }

  return axios({
    url: '/updateBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
}

export const deleteBean = (typeName, id) => {
  let postData = {
    idList: [id],
    typeName: typeName
  }
  return axios({
    url: '/removeBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
}
export const deleteBatchBean = (typeName, ids) => {
  let postData = {
    idList: ids,
    typeName: typeName
  }
  return axios({
    url: '/removeBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl
  })
}

export const getBean = (typeName, id) => {
  let postData = {
    id: id,
    typeName: typeName,
  }
  return axios({
    url: '/getBean',
    method: 'post',
    data: postData,
    baseUrl: baseUrl,
  })
}

export const searchBean = (typeName, condition) => {
  let postData = {
    typeName: typeName,
    keyword:condition.keyword,
    condition: condition.condition,
    pagesize: condition!=undefined && _.isEmpty(condition.pagesize)?condition.pagesize:undefined,
    pageno: condition!=undefined && _.isEmpty(condition.pageno)?condition.pageno:undefined,
    sort: condition!=undefined && _.isEmpty(condition.sort)?condition.sort:undefined
  }
  return axios({
    baseUrl: baseUrl,
    url: '/searchBean',
    method: 'post',
    data: postData,
  })
}

export const getStudentStat = (condition, pageInfo) => {
  let postData = {
    conditionAccount:condition.conditionAccount,
    conditionExamResult:condition.conditionExamResult,
    conditionLoginLog:condition.conditionLoginLog,
    pagesize: pageInfo!=undefined && _.isEmpty(pageInfo.pageSize)?pageInfo.pageSize:undefined,
    pageno: pageInfo!=undefined && _.isEmpty(pageInfo.pageNum)?pageInfo.pageNum-1:undefined,
    sort: pageInfo!=undefined && pageInfo.sort!=undefined?pageInfo.sort:undefined
  }
  return axios({
    baseUrl: baseUrl,
    url: '/getStudentStat',
    method: 'post',
    data: postData,
  })
}

export const importOriginResultExcel = (postData) => {
  return axios({
    url: '/importOriginResultExcel',
    method: 'post',
    data: postData,
    baseUrl: baseUrl,
  })
}
export const mockExpRecord = (postData) => {
  return axios({
    url: '/mockExpRecord',
    method: 'post',
    data: postData,
    baseUrl: baseUrl,
  })
}


