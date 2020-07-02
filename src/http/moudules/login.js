import axios from '../axios'
import global from '@/utils/global'
/*
 * 系统登录模块
 */

// 登录
let baseUrl = global.baseUrl;
export const login = data => { //新本地
  let postData = {
    loginReq: {
      username: data.account,
      passwd: data.passwd,
      client: data.client
    }
  }
    return axios({
        url: '/login',
        data: postData,
      baseUrl: baseUrl,
      method: 'post'
    })
}

// // 验证登录
// export const LoginResp = data => {
//   return axios({
//     url: 'LoginResp',
//     method: 'post',
//     data
//   })
// }

// 登出
export const logout = () => {
    return axios({
        url: 'logout',
        method: 'get'
    })
}
