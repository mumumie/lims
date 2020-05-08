<template>
  <div>
    <froala :tag="'textarea'" :config="froalaConfig"></froala>
  </div>
</template>

<script>
  export default {
    name: "froalaEditor",
    props:{
      ids:{
        type:String,
        default:''
      },
      placeholder:{
        type:String,
        default:'请填写内容'
      }
    },
    data(){
      return{
        editor:null,
        //More -> https://www.froala.com/wysiwyg-editor/docs/options
        froalaConfig: {
          toolbarButtons: ['undo', 'redo', 'clearFormatting', '|', 'bold', 'italic', 'underline','strikeThrough','|', 'fontFamily', 'fontSize', 'color', '|','paragraphFormat', 'align', 'outdent', 'indent', 'quote', 'insertLink', 'insertImage', 'embedly', 'insertFile', 'insertTable', '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', '|', 'print', 'spellChecker', 'help', '|', 'fullscreen'],
          // ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable', '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
          //显示可操作项
          theme: "dark",//主题
          placeholderText: this.placeholder,
          language: "zh_cn",//国际化
          heightMin: 150,
          heightMax: 300,
          imageUploadURL:this.global.baseUrl + '/thumbMap',//上传url
          fileUploadURL: this.global.baseUrl + '/thumbMap',//上传url 更多上传介绍 请访问https://www.froala.com/wysiwyg-editor/docs/options
          colorsHEXInput: false,//关闭16进制色值
          toolbarSticky: true,//操作栏是否自动吸顶
          zIndex: 999,
          events: {
            'froalaEditor.initialized': (e,editor)=> {
              this.editor = editor;
            },
            'froalaEditor.contentChanged':(e,editor)=>{
              this.$emit('on-change',{ids: this.ids,content:editor.html.get(true)});
            }
          },
        },
      }
    },
    methods:{
      setHtml(html){
        if(this.editor){
          this.editor.html.set(html);
        }
      }
    }
  }
</script>

<style scoped>

</style>
