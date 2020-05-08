export default {
    state: {
        perms: [],  // 用户权限标识集合
        user:{}
    },
    getters: {
   
    },
    mutations: {
        setPerms(state, perms){  // 用户权限标识集合
            state.perms = perms;
        },
        setUserInfo(state, user){
            state.user = user;
        }
    },
    actions: {
    }
}
