<template>
  <router-view class="home"></router-view>
</template>

<script>
  import remAndPhoneConfig from '@/assets/js/remConfig.js';
  remAndPhoneConfig();
  export default {
      name: "Home"
  }
</script>

<style scoped>
  .home{
    font-size:0.14rem;
    padding-bottom:1.2rem;
    padding-top:40px;
    box-sizing: border-box;
  }
</style>
