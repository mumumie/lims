import axios from '../axios'
import {addBean, deleteBean, queryBean, updateBean} from "../base";

/*
 * 菜单管理模块
 */

 // 保存
let baseUrl = null
let typeName = 'Menus'
export const save = (data) => {
  let doc = {
    type: data.type,
    name: data.name,
    parentId: data.parentId,
    url: data.url,
    orderNum: data.orderNum,
    icon: data.icon,
    perms: data.perms
  }
  if (data.id == 0){//新增
    return addBean(typeName, doc)
  }else {//修改
    return updateBean(typeName, data.id, doc)
  }

}


// 删除
export const batchDelete = (data) => {
  return deleteBean(typeName, data[0].id)
}



// 查找导航菜单树 新本地接口
export const findNavTree = (params) => {
  let postData = {

  }
    return axios({
        url: '/getUserInfo',
      method: 'post',
      baseUrl: baseUrl,
      data: postData
    })
}
//原全部菜单
/*export const findNavTree = (params) => {
  return axios({
    url: '/menu/findNavTree',
    method: 'get',
    params
  })
}*/
// 查找导航菜单树
export const findMenuTree = () => {
  return queryBean(typeName,
    {
        parentId: '',
    },
    {
      pageNum:1,
      sort:{
        orderNum:1
      }
    })
}
