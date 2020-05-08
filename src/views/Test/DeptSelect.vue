<template>
  <div>

    <!--<div>
      <UserSelect v-model="selectedUser"></UserSelect>
    </div>-->
    <div>
      <DeptSelect v-model="selectedDept"></DeptSelect>
    </div>



  </div>

</template>

<script>
  import UserSelect from "@/components/ObjectSelect/UserSelect"
  import DeptSelect from "@/components/ObjectSelect/DeptSelect"

  export default {
    data() {
      return {
        selectedDept: [],
        selectedUser: [],
      }
    },
    components: {
      UserSelect,
      DeptSelect
    },
    methods: {
      echoed: function() {
        this.selectedDept = ['5d034f82fc657830d94e2294']
        this.selectedUser = ['5d2af0a844dd2e373de809da']
      }
    },
    created() {
      this.echoed()
    }
  }
</script>

<style scoped>

</style>
