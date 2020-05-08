//异常和异常处理器定义
import vue from "@/main";
import _ from "lodash";

export const errorHandler = (error, vm) => {
  if (error.name == 'ErrorResult') {
    vue.$message({message: error.message, type: 'error'})
    return
  }
  console.log(error)
}

export class ErrorResult extends Error {
  constructor(message) {
    super()
    this.message = message
    this.name = "ErrorResult"
  }
}



/*export function ErrorResult(msg){
  this.name="ErrorResult";
  this.message = msg;
}
ErrorResult.prototype = Object.create(Error.prototype);
ErrorResult.prototype.constructor = ErrorResult*/
