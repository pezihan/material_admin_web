<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>所有账号</el-breadcrumb-item>
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
                <el-col :span="10">
                    <el-button type="primary" @click="addDilogVisible = true">添加管理账号</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区 -->
            <el-table :data="userlist" border stripe>
                <el-table-column align="center" type="index"></el-table-column>  <!-- 索引列 -->
                <el-table-column align="center" label="ID" prop="id"></el-table-column>
                <el-table-column align="center" label="账号名" prop="username"></el-table-column>
                <el-table-column align="center" label="创建时间">
                    <template slot-scope="scope"> <!-- 作用域插槽 -->
                        {{ scope.row.create_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="管理员权限">
                    <template slot-scope="scope"> <!-- 作用域插槽 -->
                        <el-switch v-model="scope.row.status" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" width="180px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
             </el-table>
             <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="queryInfo.start" :page-sizes="[5, 10, 20, 50, 100]" :page-size="queryInfo.limit"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加用户对话框 -->
        <el-dialog
          title="添加账号" :visible.sync="addDilogVisible" width="50%" @close="addDialogClosed">
          <!-- 内容主体区域 -->
          <el-form :model="addForm" :rules="FormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="管理员" prop="status">
                    <el-switch v-model="addForm.status"></el-switch>
            </el-form-item>
          </el-form>
          <!-- 底部区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDilogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 修改用户对话框 -->
        <el-dialog
          title="修改账号" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
          <el-form :model="editForm" :rules="FormRules" ref="editFormRef" label-width="70px">
            <el-form-item label="用户名" >
              <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="editForm.password"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
          </span>
        </el-dialog>
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
      // 用户列表数据
      userlist: [],
      // 总共多少条数据
      total: 0,
      // 控制添加用户对话框的显示隐藏
      addDilogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        status: false
      },
      // 表单的验证规则对象
      FormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '用户名的长度应在2~10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '密码的长度应在5~15个位之间', trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 这是查询到的用户信息对象
      editForm: {
        id: '',
        username: '',
        password: ''
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取账号信息
    async getUserList () {
      const { data: res } = await this.$http.get('/allAdminUser', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userlist = res.data
      this.total = res.meta.sum
    },
    // 搜索
    searchUserList () {
      this.queryInfo.start = 1
      this.getUserList()
    },
    // 监听switch 开关状态的改变
    async userStateChanged (userinfo) {
      const { data: res } = await this.$http.put(`/setAdminStatus?status=${userinfo.status === false ? 1 : 2}&id=${userinfo.id}`)
      if (res.meta.status !== 201) {
        userinfo.status = !userinfo.status
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('操作成功')
      if (userinfo.id === JSON.parse(window.sessionStorage.getItem('userMsg')).user_id && userinfo.status === false) {
        window.sessionStorage.clear()
        this.$router.push('/')
      }
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
    // 监听添加用户对话框的关闭事件 重置表单状态
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser () {
      const data = {
        username: this.addForm.username,
        password: MD5(this.addForm.password),
        status: this.addForm.status === true ? 1 : 2
      }
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 预校验通过可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('/addAdminUser', data)
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
          return
        }
        this.$message.success('添加账号成功')
        // 隐藏添加用户对话框
        this.addDilogVisible = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog (user) {
      this.editForm.username = user.username
      this.editForm.id = user.id
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo () {
      // 预校验通过发起网络请求修改用户数据
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 通过发起修改请求
        const data = {
          id: this.editForm.id,
          password: MD5(this.editForm.password)
        }
        const { data: res } = await this.$http.post('/editAdmin', data)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('更新成功')
      })
    },
    // 根据id删除对应的用户数据
    async removeUserById (id) {
      // 弹框询问用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete(`/delAdmin?id=${id}`)
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('删除用户成功')
      if (id === JSON.parse(window.sessionStorage.getItem('userMsg')).user_id) {
        window.sessionStorage.clear()
        this.$router.push('/')
        return
      }
      // 删除成功刷新用户列表
      this.getUserList()
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-row {
    margin-bottom: 20px;
  }
  h4 {
    margin-top: 30px;
  }
  .server {
    margin-top: 20px;
    .el-tag {
      margin-right: 10px;
      margin-bottom: 10px;
    }
  }
</style>
