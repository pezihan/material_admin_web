<template>
    <div>
      <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>所有用户</el-breadcrumb-item>
        </el-breadcrumb>

      <!-- 卡片视图区 -->
        <el-card>
          <!-- 搜索与添加区 -->
            <el-row :gutter="20"> <!-- 行 -->
                <el-col :span="8"> <!-- 列 -->
                     <el-input placeholder="请输入内容" v-model="queryInfo.query"  @keyup.enter.native="searchUserList" clearable @clear="searchUserList">
                        <el-button slot="append" icon="el-icon-search" @click="searchUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDilogVisible">添加账号</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区 -->
            <el-table :data="userlist" border stripe>
                <el-table-column align="center" type="index"></el-table-column>  <!-- 索引列 -->
                <el-table-column width="80px" align="center" label="用户头像">
                    <template slot-scope="scope"> <!-- 作用域插槽 -->
                        <el-avatar shape="square" size="large" :src="path.user_images + scope.row.user_image">
                            <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
                        </el-avatar>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="ID" prop="id"></el-table-column>
                <el-table-column align="center" label="用户昵称" prop="user_name"></el-table-column>
                <el-table-column align="center" label="性别" prop="sex">
                    <template slot-scope="scope">{{ scope.row.sex | sexConvert }}</template>
                </el-table-column>
                <el-table-column align="center" label="地区">
                    <template slot-scope="scope">{{ scope.row.region | textFilter }}</template>
                </el-table-column>
                <el-table-column align="center" label="手机号">
                    <template slot-scope="scope">{{ scope.row.phone | textFilter }}</template>
                </el-table-column>
                <el-table-column align="center" label="注册时间">
                    <template slot-scope="scope">{{ scope.row.creat_time | dateFormat }}</template>
                </el-table-column>
                <el-table-column align="center" label="最近登录时间">
                    <template slot-scope="scope">{{ scope.row.login_information | dateFormat }}</template>
                </el-table-column>
                <el-table-column align="center" label="个性签名">
                    <template slot-scope="scope">{{ scope.row.signature | textFilter }}</template>
                </el-table-column>
                <el-table-column align="center" label="状态">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.user_type == 0" type="success">正常</el-tag>
                        <el-tag v-else type="danger">已封号</el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" width="400px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                        <el-button @click="resetPassword(scope.row)" type="success" size="mini" icon="el-icon-key">重置密码</el-button>
                        <el-button @click="sealDialog(scope.row.id)" v-if="scope.row.user_type == 0" type="warning" size="mini" icon="el-icon-lock">封号</el-button>
                        <el-button @click="sealDialog(scope.row.id)" v-else type="warning" size="mini" icon="el-icon-unlock">解除</el-button>
                        <el-button @click="deleteUser(scope.row.id)" type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                    </template>
                </el-table-column>
             </el-table>
              <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="queryInfo.start" :page-sizes="[5, 10, 20, 50, 100]" :page-size="queryInfo.limit"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

            <!-- 添加与修改用户对话框 -->
            <el-dialog
            :title="DialogVisibleStatus == true ? '添加账户' : '编辑账户'" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="FormRules" ref="editFormRef" label-width="100px">
                <el-form-item class="user_image"  label="用户头像" prop="user_image">
                    <!-- <el-avatar shape="square" size="large" > -->
                      <img :src="imagesErr" class="uploadImg"/>
                    <!-- </el-avatar> -->
                    <div v-show="shadeSHow" class="shade">
                        <span class="iconfont icon-round-loading"></span>
                    </div>
                </el-form-item>
                <el-form-item label="用户昵称" prop="user_name">
                    <el-input v-model="editForm.user_name"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <el-radio-group v-model="editForm.sex" size="small">
                      <el-radio :label="0" border>男</el-radio>
                      <el-radio :label="1" border>女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="地区" prop="region">
                    <el-input v-model="editForm.region"></el-input>
                </el-form-item>
                <el-form-item label="账号" prop="phone">
                    <el-input type="text" v-model="editForm.phone"></el-input>
                </el-form-item>
                <el-form-item v-if="DialogVisibleStatus" label="密码" prop="password">
                    <el-input type="password" v-model="editForm.password"></el-input>
                </el-form-item>
                <el-form-item label="个性签名" prop="signature">
                    <el-input v-model="editForm.signature"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="info" @click="uploadBtn" :disabled='shadeSHow'>上传头像</el-button>
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
                <input class="fileInput" type="file" accept=".png,.jpg,.jpeg" name="" ref="uploadImgRef" style="display:none"  @change="uploadChange($event)"/>
            </span>
            </el-dialog>

            <!-- 修改用户对话框 -->
            <el-dialog
            title="重置密码" :visible.sync="editDialogPassword" width="50%" @close="PasswordDialogClosed">
            <el-form :model="editPasswordForm" :rules="PassWordFormRules" ref="editPassWordFormRef" label-width="70px">
              <el-form-item label="用户名" >
                <el-input v-model="editPasswordForm.user_name" disabled></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="editPasswordForm.password"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="editDialogPassword = false">取 消</el-button>
              <el-button type="primary" @click="passWordUserInfo">确 定</el-button>
            </span>
          </el-dialog>
        </el-card>
    </div>
</template>

<script>
import MD5 from 'js-md5'
export default {
  data () {
    return {
      // 输入框
      queryInfo: {
        // 搜索内容
        query: '',
        // 页码
        start: 1,
        // 每页条数
        limit: 10
      },
      // 资源访问路径
      path: '',
      // 用户列表
      userlist: [],
      // 总数据条数
      total: 0,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 控制正在加载动画与上传按钮是否禁用
      shadeSHow: false,
      // 控制是添加账号还是修改账号（添加为true，修改为false）
      DialogVisibleStatus: false,
      // 编辑页面头像加载失败显示的图片
      imagesErr: 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png',
      // 可提供修改的用户数据项目
      editForm: {
        user_id: 0,
        user_image: '',
        user_name: '',
        sex: 0,
        region: '',
        phone: '',
        password: '',
        signature: ''
      },
      // 表单的验证规则对象
      FormRules: {
        user_image: [
          { required: true, message: '请上传头像', trigger: 'blur' },
          { min: 1, message: '请上传头像', trigger: 'blur' }
        ],
        user_name: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 1, max: 20, message: '用户名的长度应在1~20个字符之间', trigger: 'blur' }
        ],
        signature: [
          { required: true, message: '请输入用户个性签名', trigger: 'blur' },
          { min: 1, max: 15, message: '密码的长度应在1~20个字符之间', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入用于登录的账号', trigger: 'blur' },
          { min: 6, max: 20, message: '用户名的长度应在6~20个字符之间', trigger: 'blur' }
        ]
      },
      // 重置密码面板
      editDialogPassword: false,
      // 重置密码提交表单
      editPasswordForm: {
        user_id: '',
        user_name: '',
        password: ''
      },
      // 表单的验证规则对象
      PassWordFormRules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码的长度应在6~15个位之间', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 获取资源访问路径
    this.path = JSON.parse(window.sessionStorage.getItem('path'))
    this.getUserList()
  },
  methods: {
    // 获取用户数据
    async getUserList () {
      const { data: res } = await this.$http.get('/userList', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userlist = res.data
      this.total = res.meta.sum
    },
    searchUserList () {
      this.queryInfo.start = 1
      this.getUserList()
    },
    // 监听 pagesize 改变事件
    handleSizeChange (newSize) {
      this.queryInfo.limit = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.start = newPage
      this.getUserList()
    },
    // 展示编辑用户的对话框
    async showEditDialog (user) {
      this.formatting()
      this.DialogVisibleStatus = false
      this.editForm.user_id = user.id
      this.editForm.user_image = user.user_image
      this.editForm.user_name = user.user_name
      this.editForm.sex = user.sex
      this.editForm.region = user.region
      this.editForm.phone = String(user.phone)
      this.editForm.signature = user.signature
      this.imagesErr = this.path.user_images + user.user_image
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 上传文件
    uploadBtn () {
      const upload = this.$refs.uploadImgRef
      upload.click()
    },
    // 选择文件之后发送请求
    async uploadChange  (e) {
      // 图片大小不超过5M
      const limitSize = 1024 * 1024 * 1 // 5M
      const file = e.target.files[0]
      if (file.size > limitSize) {
        this.$message.error('头像大小不能大于1M')
        return
      }
      const forms = new FormData()
      forms.append('file', file)
      const configs = {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
      this.shadeSHow = true
      const { data: res } = await this.$http.post(`/updateimage?user_id=${this.editForm.user_id}`, forms, configs)
      if (res.meta.status !== 201) {
        this.$message.error(res.meta.msg)
        this.shadeSHow = false
        return
      }
      this.editForm.user_image = res.data.path
      this.imagesErr = this.path.user_images + res.data.path
      this.$message.success(res.meta.msg)
      this.shadeSHow = false
    },
    // 确认修改信息
    editUserInfo () {
      // 修改账户
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 预校验通过可以发起添加用户的网络请求
        if (this.DialogVisibleStatus === false) {
          // 编辑用户信息
          const { data: res } = await this.$http.post('/setVirtualUser', this.editForm)
          if (res.meta.status !== 201) {
            this.$message.error(res.meta.msg)
            return
          }
          this.shadeSHow = false
          // 修改用户列表中的资料
          this.userlist.forEach(item => {
            if (item.id === this.editForm.user_id) {
              item.user_image = this.editForm.user_image
              item.user_name = this.editForm.user_name
              item.sex = this.editForm.sex
              item.region = this.editForm.region
              item.phone = this.editForm.phone
              item.signature = this.editForm.signature
            }
          })
          this.editDialogVisible = false
          this.$message.success('修改成功')
          return
        }
        // 添加用户
        this.editForm.password = MD5(this.editForm.password)
        const { data: res } = await this.$http.post('/addVirtualUser', this.editForm)
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
          return
        }
        this.shadeSHow = false
        // 修改用户列表中的资料
        this.editDialogVisible = false
        this.$message.success('添加成功')
        this.getUserList()
      })
    },
    // 添加虚拟账户面板
    addDilogVisible () {
      this.formatting()
      this.DialogVisibleStatus = true
      this.editDialogVisible = true
    },
    // 表单数据格式化
    formatting () {
      this.imagesErr = 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png'
      this.editForm = {
        user_id: 0,
        user_image: '',
        user_name: '',
        sex: 0,
        region: '',
        phone: '',
        password: '',
        signature: ''
      }
    },
    // 打开修改密码面板
    resetPassword (user) {
      this.editPasswordForm.user_id = user.id
      this.editPasswordForm.user_name = user.user_name
      this.editPasswordForm.password = user.password
      this.editDialogPassword = true
    },
    // 监听重置密码对话框的关闭事件
    PasswordDialogClosed () {
      this.$refs.editPassWordFormRef.resetFields()
    },
    // 确定修改密码
    passWordUserInfo () {
      // 预校验通过发起网络请求修改用户数据
      this.$refs.editPassWordFormRef.validate(async valid => {
        if (!valid) return
        // 通过发起修改请求
        const data = {
          user_id: this.editPasswordForm.user_id,
          password: MD5(this.editPasswordForm.password)
        }
        const { data: res } = await this.$http.post('/virtualReset', data)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        // 关闭对话框
        this.editDialogPassword = false
        // 提示修改成功
        this.$message.success('重置成功')
      })
    },
    // 对账号进行封号与解封
    async sealDialog (id) {
      const { data: res } = await this.$http.put(`/sealUser?user_id=${id}`)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.userlist.forEach(item => {
        if (item.id === id) {
          item.user_type = res.data.user_type
        }
      })
      this.$message.success(res.meta.msg)
    },
    // 删除虚拟账户
    async deleteUser (userId) {
      const confirmResult = await this.$confirm('此操作将删除此账号信息，以及移除此账号下的所有素材关联', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回字符串 cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 发送请求
      const { data: res } = await this.$http.delete(`/virtualUserDel?user_id=${userId}`)
      if (res.meta.status !== 201) {
        return this.$message.error('删除失败')
      }
      this.getUserList()
      this.$message.success('删除成功')
    }
  }
}
</script>

<style lang="scss" scoped>
    .uploadImg {
      width: 150px;
      height: 150px;
      border: 1px solid #dcdfe6;
      border-radius: 10px;
      vertical-align: middle;
      overflow: hidden;
  }
  .operationBtn {
      width: 100px;
  }
  .user_image {
    position: relative;
    .shade {
      position: absolute;
      width: 150px;
      height: 150px;
      background-color: rgba(0,0,0,.5);
      border-radius: 15px;
      top: 0;
      left: 0;
      z-index: 10;
      span {
        font-size: 60px;
        color: #fff;
        z-index: 11;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%) rotate(360deg);
        animation: move 1s linear infinite normal
      }
    }
  }
  @keyframes move {
    0% {
      transform:translate(-50%,-50%) rotate(0deg)
    }
    50% {
      transform:translate(-50%,-50%) rotate(180deg)
    }
    100% {
      transform:translate(-50%,-50%) rotate(360deg)
    }
  }
</style>
