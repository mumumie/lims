<template>
  <div>
    123
    <student-practice-stat :student-id="studentId" :practice-id="practiceId">
    </student-practice-stat>
  </div>

</template>

<script>
    import StudentPracticeStat from "../../components/Echarts/StudentPracticeStat";
    export default {
        name: "Index",
      components: {StudentPracticeStat},
      data() {
        return {
          studentId: '5d05dfbfe7257b7cbbb0ced7',
          practiceId: '5e3906bbb77b00602c50f9ac'
        }
      },
    }
</script>

<style scoped>

</style>
