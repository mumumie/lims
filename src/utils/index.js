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

    if(tree.children!=undefined){
      if (tree.children instanceof Array && tree.children.length < 1) {
        tree.children = undefined;
      } else {
        mapTree(tree.children, map);
      }
    }
  }
}
