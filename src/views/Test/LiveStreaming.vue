<template>
  <div>
    <div>
      <el-button type="primary" v-for="item in urlData" :key="item.id">{{item.appName}}</el-button>
    </div>
    <video class="tvhou" width="100%" height="100%"
           controls="controls" autoplay="autoplay"
           x-webkit-airplay="true" x5-video-player-fullscreen="true"
           preload="auto" playsinline="true" webkit-playsinline
           x5-video-player-typ="h5">
      <source type="application/x-mpegURL" :src="url">
    </video>
  </div>
</template>

<script>
import { queryBean } from "@/http/base";
export default {
  name: "liveStreaming",
  data() {
    return {
      url: 'http://pull.bihaiwei.net/aa/bb.m3u8',
      urlData: []
    }
  },
  created() {
    this.getUrl()
  },
  methods: {
    getUrl() {
      queryBean('LivePush', {}).then(res => {
        this.urlData = res.bean.data
        // this.url = '//' + res.bean.data[0].pullAddress + '/' + res.bean.data[0].appName + '/' + res.bean.data[0].stream + '.m3u8'
      })
    }
  }
}
</script>

<style scoped>

</style>
