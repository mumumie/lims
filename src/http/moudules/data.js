import axios from '../axios'
import {addBean, queryBean, updateBean} from "../base";

/* 
 * 用户管理模块
 */

// 保存
let baseUrl = null;
// let baseUrl = 'http://39.106.83.69:8088';
export const save = (data,typeName) => {
  if(data.id){ //新增
    return updateBean(typeName, data.id, data)
  }else { //修改
    return addBean(typeName, data)
  }


};
// 删除
export const batchDelete = (data,typeName) => {
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
// 分页查询
export const findPage = (data,typeName) => {
  return queryBean(typeName, {

  }, data)
}
// 查找用户的菜单权限标识集合
export const findPermissions = (params) => {
  let postData = {
  }
  return axios({
    url: '/getUserInfo',
    method: 'post',
    baseUrl: baseUrl,
    data: postData
  })
};
// 查询表名
export const findTableList = () => {
  return axios({
    url:'getTableList',
    method:'post',
    baseUrl: baseUrl,
    data:{userid:sessionStorage.getItem('userid')}
  })
};
// 查询表名字段
export const findTableInfo = (data) => {
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
// 模糊查询表单
export const findKeyWord = (data) => {
  return axios({
    url:'searchBean',
    method:'post',
    baseUrl: baseUrl,
    data:data
  })
};
