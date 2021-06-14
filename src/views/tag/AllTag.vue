<template>
    <div class="content">
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>标签管理</el-breadcrumb-item>
            <el-breadcrumb-item>所有标签</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
            <el-tag v-for="item in tagList" @close="handleClose(item.id)" closable :key="item.id">{{ item.name }}</el-tag>
            <el-input class="input-new-tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput"
            size="small" @keyup.enter.native="handleInputConfirm" @blur="inputVisible = false"></el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      tagList: [],
      inputVisible: false,
      inputValue: ''
    }
  },
  mounted () {
    this.getTagList()
  },
  methods: {
    async getTagList () {
      const { data: res } = await this.$http.get('/getTag')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.tagList = res.data
    },
    showInput () {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async handleInputConfirm () {
      if (this.inputValue !== '' && this.inputValue !== undefined) {
        const { data: res } = await this.$http.put('/addTag', { name: this.inputValue })
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success('添加成功')
          this.getTagList()
        }
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    async handleClose (id) {
      const { data: res } = await this.$http.delete('/delTag?id=' + id)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.$message.success('删除成功')
      this.getTagList()
    }
  }
}
</script>

<style lang="scss" scoped>
    .el-tag {
        margin: 10px;
    }
    .input-new-tag {
        width: 100px;
    }
</style>
