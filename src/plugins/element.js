import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Container,
  Header,
  Aside,
  Menu,
  MenuItem,
  Submenu,
  Main,
  Backtop,
  MessageBox,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  Tag,
  TableColumn,
  Switch,
  Pagination,
  Dialog,
  Avatar,
  Radio,
  RadioGroup,
  Message
} from 'element-ui'

Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$message = Message // 弹窗组件必须挂在在vue的原型上
Vue.use(Button).use(Form).use(FormItem).use(Input).use(Container).use(Header).use(Aside).use(Menu).use(Submenu).use(MenuItem).use(Main)
Vue.use(Backtop).use(Breadcrumb).use(BreadcrumbItem).use(Card).use(Row).use(Col).use(Tag).use(Avatar)
Vue.use(Table).use(TableColumn).use(Switch).use(Pagination).use(Dialog).use(Radio).use(RadioGroup)
