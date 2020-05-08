<template>
  <div class="inline_editor">
    <froala :tag="'textarea'" :config="froalaConfig"></froala>
  </div>
</template>

<script>
  export default {
    name: "froalaInlineEditor",
    props:{
      ids:{
        type:String,
        default:''
      }
    },
    data(){
      return{
        editor:null,
        //More -> https://www.froala.com/wysiwyg-editor/docs/options
        froalaConfig: {
          toolbarButtons: ['undo', 'redo', 'clearFormatting', '|', 'bold', 'italic', 'underline','strikeThrough','|', 'fontFamily', 'fontSize', 'color', 'insertLink', 'insertImage', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', '|', 'print', 'spellChecker'],
          // ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable', '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
          //显示可操作项
          // theme: "dark",//主题
          placeholder: "请输入内容",
          language: "zh_cn",//国际化
          imageUploadURL: this.global.baseUrl + '/thumbMap',//上传url
          fileUploadURL: this.global.baseUrl + '/thumbMap',//上传url 更多上传介绍 请访问https://www.froala.com/wysiwyg-editor/docs/options
          toolbarInline: true,
          charCounterCount: false,
          toolbarVisibleWithoutSelection: true,
          zIndex: 99,
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
  .inline_editor{
    width:100%;
  }
</style>
