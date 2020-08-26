import _ from 'lodash'
// import moment from "moment"
//
// //
// const dateFormA = 'YYYY-MM-DD HH:mm:ss'
// export const stampToStr = (stamp)=>{
//   return moment.unix(moment(stamp).unix()).format(dateFormA)
// }

//对一个对象或树状结构 键值映射。入参map的key为新key，value为旧key
export const mapTree = (tree, map)=>{
  if (tree instanceof Array) {
    tree.forEach((tree) => {
      mapTree(tree, map)
    })
  } else {
    for(let key in map){
      tree[key] = tree[map[key]];
      tree[map[key]] = undefined
    }
    //tree.key = tree.id;
    //tree.label = tree.name;

    if(tree.children!=undefined ){
      if (tree.children instanceof Array && tree.children.length < 1) {
        tree.children = undefined;
      } else {
        mapTree(tree.children, map);
      }
    }else{
      tree.children=[]
    }
  }
};

//过滤难易度字段
export const difficultyFilter = (row, column, cellValue, index) => {
  switch (cellValue) {
    case 1:
      return '易';
    case 2:
      return '较易';
    case 3:
      return '中';
    case 4:
      return '较难';
    case 5:
      return '难';
    default:
      return ' - ';
  }
};

//过滤试题类型字段
export const questTypeFilter = (row, column, cellValue, index) => {
  switch (cellValue) {
    case 1:
      return '单选题';
    case 2:
      return '多选题';
    case 3:
      return '判断题';
    case 4:
      return '填空题';
    case 5:
      return '问答题';
    default:
      return ' - ';
  }
};

//过滤html格式
export const htmlFilter = (row, column, cellValue, index) => {
  if(cellValue){
    let str1 = cellValue.replace(/[\“\”\’\‘\'\"\\\/\s+\b\f\n\r\t]/g, '');
    let str2 = str1.replace(/<[^>]+>/g,"");
    return str2
  }else{
    return cellValue
  }
}
