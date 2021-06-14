<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>关键词</el-breadcrumb-item>
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
                    <el-button type="danger" @click="removeUserById(true)">批量删除</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区 -->
            <el-table @selection-change="handleSelectionChange" :data="userlist" border stripe>
                <el-table-column align="center" type = "selection"></el-table-column>
                <el-table-column align="center" type="index"></el-table-column>  <!-- 索引列 -->
                <el-table-column align="center" label="关键词" prop="keyword"></el-table-column>
                <el-table-column align="center" label="搜索次数" prop="counts"></el-table-column>

                <el-table-column align="center" label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="setkeyword(scope.row.keyword)">修改</el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(false, scope.row.keyword)">删除</el-button>
                    </template>
                </el-table-column>
             </el-table>
             <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="queryInfo.start" :page-sizes="[5, 10, 20, 50, 100]" :page-size="queryInfo.limit"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
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
      // 关键词多选
      multipleSelection: []
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取账号信息
    async getUserList () {
      const { data: res } = await this.$http.get('/getkeyword', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userlist = res.data
      this.total = res.meta.sum
    },
    // 多选
    handleSelectionChange (val) {
      this.multipleSelection = val.map(v => v.keyword)
    },
    // 搜索
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
    // 修改关键词
    async setkeyword (keyword) {
      // 弹框询问用户是否删除
      this.$prompt('请输入要修改成的关键词', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async ({ value }) => {
        const { data: res } = await this.$http.put('/setkeyword', { keyword: keyword, newKeyword: value.trim() })
        if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
        }
        this.$message.success('修改成功')
        // 删除成功刷新列表
        this.getUserList()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 根据id删除对应的用户数据
    async removeUserById (type, keyword) {
      if (type === true && this.multipleSelection.length === 0) {
        return this.$message.error('请选择需要删除的关键词')
      }
      // 弹框询问用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该搜索关键词, 是否继续?', '提示', {
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
      if (keyword !== undefined) {
        const { data: res } = await this.$http.delete(`/delkeyword?keyword=${keyword}`)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
      } else {
        const { data: res } = await this.$http.post('/delkeyword', { keyword_arr: this.multipleSelection })
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
      }
      this.$message.success('删除成功')
      // 删除成功刷新列表
      this.getUserList()
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-row {
    margin-bottom: 20px;
  }
</style>
