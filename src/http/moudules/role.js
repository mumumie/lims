import axios from '../axios'
import {addBean, deleteBean, queryBean, updateBean, getBean} from '../base'
import _ from 'lodash'
/*
 * 角色管理模块
 */

// 保存
let baseUrl = null
let typeName = 'Role'
export const save = (data) => {
  let doc = {
    name: data.name,
    remark: data.remark,
    typeNameList:data.typeNameList
  }
  if (data.id == 0){//新增
    return addBean(typeName, doc)

  }else {//修改
    return updateBean(typeName, data.id, doc)
  }


}
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
// 分页查询
export const findPage = (data) => {
  return queryBean(typeName, {
    name: _.isEmpty(data.columnFilters.name.value)?undefined:data.columnFilters.name.value
  }, data)
}
// 查询全部
export const findAll = () => {
  return queryBean(typeName, {
  })
}
// 查询角色菜单集合
export const findRoleMenus = (params) => {
  return getBean(typeName, params.roleId)
}
// 保存角色菜单集合
export const saveRoleMenus = (data) => {
  let menuIdList = [];
  data.forEach(v => {
    menuIdList.push(v.menuId)
  })
  let doc = {
    menuIdList: menuIdList
  }
  return updateBean(typeName, data[0].roleId, doc)

}
