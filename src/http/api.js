/*
 * 接口统一集成模块
 */
import * as login from './moudules/login'
import * as user from './moudules/user'
import * as dept from './moudules/dept'
import * as role from './moudules/role'
import * as menu from './moudules/menu'
import * as dict from './moudules/dict'
import * as log from './moudules/log'
import * as data from './moudules/data'
import * as labroom from './moudules/labroom'
import * as base from './base'
import * as curriculum from './moudules/curriculum'
import * as experiment from './moudules/experiment'
import * as exptemplate from './moudules/exptemplate'
import * as labbuilding from './moudules/labbuilding'
import * as examquest from './moudules/examquest'
import * as exampaper from './moudules/exampaper'
import * as examresult from './moudules/examresult'
import * as expresult from './moudules/expresult'
import * as teacher from './moudules/teacher'
import * as student from './moudules/student'
import * as bank from './exam/bank'
import * as quest from './exam/quest'
import * as paper from './exam/paper'
import * as practice from './exam/practice'

// 默认全部导出
export default {
  login,
  user,
  dept,
  role,
  menu,
  dict,
  log,
  base,
  curriculum,
  experiment,
  exptemplate,
  data,
  labroom,
  labbuilding,
  examquest,
  exampaper,
  examresult,
  expresult,
  teacher,
  student,
  bank,
  quest,
  paper,
  practice,
}
