<template>
  <div>
    <button @click="start">开始实验</button>

  </div>

</template>

<script>
  export default {
    data() {
      return {
        ws: null
      }
    },
    methods: {
      start: ()=>{
        //
      }
    },
    created() {
      this.ws = new WebSocket("ws://localhost:8087/exp")

      this.ws.onopen = (event) => {
        let wsRequest = {
          command: 1,
          userId: "123"
        }
        this.ws.send(JSON.stringify(wsRequest));
        console.log("Send Text WS was opened.");
      };
      this.ws.onmessage = function (event) {
        console.log(event.data);
      };
      this.ws.onerror = function (event) {
        console.log("Send Text fired an error");
      };
      this.ws.onclose = function (event) {
        console.log("WebSocket instance closed.");
      };
    }
  }
</script>

<style scoped>

</style>
