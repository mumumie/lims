<template>
  <div>
     <div  class="prism-player" id="J_prismPlayer"></div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        playerId: "aliplayer_" + Math.random().toString(36).substr(2),
        scriptTagStatus: 0,
        isReload: false,
        instance: null
      }
    },
    created() {

    },
    mounted() {
      var player = new Aliplayer({
        id: 'J_prismPlayer',
        //支持播放地址播放,此播放优先级最高
        source: "http://pull.bihaiwei.net/aa/bb.m3u8",  //视频地址
        cover: "http://cdn.img.mtedu.com/images/assignment/day_3.jpg",  //播放器封面图
        autoplay: false,      // 是否自动播放
        width: "600px",       // 播放器宽度
        height: "450px",      // 播放器高度
        playsinline: true,
        seekable: true,
        // isLive: true,
        // getCurrentTime: _this.aaaa
      },function(player){
        console.log('播放器创建好了。')
      });
    },
    methods: {

    },
  }
</script>

<style lang="postcss" scoped>
  @import 'https://g.alicdn.com/de/prismplayer/2.7.2/skins/default/aliplayer-min.css';
</style>
