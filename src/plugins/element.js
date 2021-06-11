import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  MessageBox,
  Message
} from 'element-ui'

Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$message = Message // 弹窗组件必须挂在在vue的原型上
Vue.use(Button).use(Form).use(FormItem).use(Input)
