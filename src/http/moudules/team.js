import axios from '../axios'
import {addBean, deleteBean, queryBean, updateBean} from '../base'
/* 
 * 小组模块
 */

let typeName = 'Team'

export const findTeam = () => {
  return queryBean(typeName)
}


