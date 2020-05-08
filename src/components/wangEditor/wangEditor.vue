<template>
  <div>
    <div :id="'edit'+id"></div>
  </div>

</template>

<script>
  export default {
    name: "wangEditor",
    props: {
      introduce:{
        type:String,
        default:''
      },
      id: {
        type:String,
        default:''
      }
    },
    data(){
      return{
        editor:null,
        htmlEdit:''
      }
    },
    methods: {
      getEditContent() {
        // 获取内容方法
        return this.editor.txt.html()
      }
    },
    watch: {
      introduce: function() {
        this.$nextTick(function(){
          this.htmlEdit = this.introduce;
          this.editor.txt.html(this.htmlEdit);
        });
      }
    },
    mounted() {
      var that = this;
      var E = window.wangEditor;
      that.editor = new E('#edit'+that.id);
      that.editor.customConfig.menus = [
        'head',  // 标题
        'bold',  // 粗体
        'fontSize',  // 字号
        'fontName',  // 字体
        'italic',  // 斜体
        'underline',  // 下划线
        'strikeThrough',  // 删除线
        'foreColor',  // 文字颜色
        'backColor',  // 背景颜色
        'link',  // 插入链接
        'justify',  // 对齐方式
        'image',  // 插入图片
        'undo',  // 撤销
      ];
      that.editor.customConfig.zIndex = 100;
      that.editor.customConfig.showLinkImg = false;
      that.editor.customConfig.uploadFileName = 'image';
      that.editor.customConfig.uploadImgServer = this.global.baseUrl+'/uploadImage' ;//配置上传到服务器地址
      that.editor.customConfig.pasteFilterStyle = false;
      that.editor.customConfig.uploadImgHooks = {
        customInsert: function (insertImg, result, editor) {
          // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
          // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
          // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
          var url = result.data[0];
          insertImg(that.global.baseUrl+url)
          // result 必须是一个 JSON 格式字符串！！！否则报错
        }
      };
      that.editor.customConfig.customAlert = function (info) {
        console.log('自定义提示：' + info)
      };
      that.editor.customConfig.onchange = function (html) {
        // html 即变化之后的内容
        let data={
          content:html,
          id:that.id
        };
        that.$emit('getEditContent',data);
      };
      that.editor.create();
      that.htmlEdit = that.introduce;
      that.editor.txt.html(that.htmlEdit);
    }
  }
</script>

<style scoped>

</style>
