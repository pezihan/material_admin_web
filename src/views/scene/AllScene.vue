<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>素材管理</el-breadcrumb-item>
            <el-breadcrumb-item>所有素材</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
          <!-- 搜索与添加区 -->
            <el-row :gutter="20"> <!-- 行 -->
                <el-col :span="12"> <!-- 列 -->
                     <el-input placeholder="请输入内容" v-model="queryInfo.query" @keyup.enter.native="searchSceneList"  clearable @clear="searchSceneList">
                    <el-select v-model="queryInfo.sort" slot="prepend" @change="selectChang" class="input-sort-select" placeholder="请选择">
                      <el-option label="全部" :value="0">全部</el-option>
                      <el-option label="图片" :value="1">图片</el-option>
                      <el-option label="视频" :value="2">视频</el-option>
                    </el-select>
                        <el-select v-model="queryInfo.type" slot="prepend" @change="selectChang" class="input-with-select" placeholder="请选择">
                          <el-option label="素材ID" :value="1">素材ID</el-option>
                          <el-option label="用户ID" :value="2">用户ID</el-option>
                          <el-option label="素材MD5" :value="3">素材MD5</el-option>
                          <el-option label="素材标签" :value="4">素材类别</el-option>
                          <el-option label="已删除" :value="5">已删除</el-option>
                        </el-select>
                        <el-button slot="append" icon="el-icon-search" @click="searchSceneList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="8">
                    <el-button type="primary" icon="el-icon-edit" @click="setUserClick">修改所属用户</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="deleteScene">批量下线</el-button>
                </el-col>
            </el-row>

            <!-- 素材列表区 -->
            <el-table ref="multipleTable" tooltip-effect="dark" :data="scenelist" @selection-change="handleSelectionChange" border stripe>
                <el-table-column align="center" type="selection" width="55"></el-table-column>
                <el-table-column align="center" type="index"></el-table-column>  <!-- 索引列 -->
                <el-table-column align="center" label="素材封面" width="160" >
                    <template slot-scope="scope"> <!-- 作用域插槽 -->
                        <el-image v-if="scope.row.type == 1" style="width: 140px;cursor: pointer;" :preview-src-list="[path.images + scope.row.phone_path]" slot="error" :src="path.images + scope.row.phone_path" >
                          <i class="el-icon-picture-outline" style="font-size: 80px;cursor: pointer;"></i>
                        </el-image>
                        <video @click="showAuditDialog(path.video + scope.row.video_path)" v-else style="width: 140px;cursor: pointer;" :src="path.video + scope.row.video_path"></video>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="素材ID" prop="id"></el-table-column>
                <el-table-column align="center" label="用户ID" prop="user_id"></el-table-column>
                <el-table-column align="center" label="素材MD5" width="160" prop="md5"></el-table-column>
                <el-table-column align="center" label="所属分类" width="150">
                    <template slot-scope="scope">
                      <el-tag class="ele_tag" v-for="tag in scope.row.classify" :key="tag.id" closable
                      :disable-transitions="false" @close="handleprincipalClose(tag.id)">
                        {{tag.tag_name}}
                      </el-tag>
                      <el-button class="button-new-tag" size="small" @click="principalShowInput(scope.row.id)">+ 添加标签</el-button>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="作品类型" prop="type">
                  <template slot-scope="scope">
                      <el-tag v-if="scope.row.type == 2">视频</el-tag>
                        <el-tag v-else type="success">图片</el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="素材状态" width="140" prop="state">
                  <template slot-scope="scope">
                      <el-radio-group v-model="scope.row.state" size="mini" @change="sceneStatuChange(scope.row.id,scope.row.state)">
                        <el-radio  :label="1" border>上线</el-radio>
                        <el-radio  :label="2" border>下线</el-radio>
                      </el-radio-group>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="描述" width="180">
                    <template slot-scope="scope">
                      <p class="text_scene_desc">{{ scope.row.scene_desc }}</p>
                    </template>
                </el-table-column>

                <el-table-column align="center" label="上传时间">
                    <template slot-scope="scope">{{ scope.row.up_time | dateFormat }}</template>
                </el-table-column>

                <el-table-column align="center" label="点赞数量" prop="likeSum"></el-table-column>
                <el-table-column align="center" label="收藏次数" prop="collectSum"></el-table-column>
                <el-table-column align="center" label="评论数量" prop="commentSum"></el-table-column>
                <el-table-column align="center" label="审核信息">
                    <template slot-scope="scope">{{ scope.row.state_text_id == 0 || scope.row.state_text_id == null ? '无' :  scope.row.state_text_id }}</template>
                </el-table-column>
             </el-table>
              <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="queryInfo.start" :page-sizes="[5, 10, 20, 50]" :page-size="queryInfo.limit"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
         <!-- 添加对话框 -->
        <el-dialog title="添加分类标签" :visible.sync="addTagDialogVisible" width="50%" @close="addTagDialogClosed">
          <div class="tag_seace_content">
            <el-input @input="TagSearch" placeholder="请输入标签关键字" v-model="inputValue" clearable></el-input>
              <el-button type="primary" @click="addTagClick">添加标签</el-button>
          </div>
          <el-form :model="addTagForm" ref="addTagRef" label-width="70px">
            <el-checkbox-group v-model="addTagForm.tagPitch" size="mini">
              <el-checkbox v-for="item in tagList" :key="item.id" :label="item.id" border>{{ item.name }}</el-checkbox>
            </el-checkbox-group>
          </el-form>
        </el-dialog>
        <!-- 视频预览对话框 -->
        <div class="audit_content" @keydown.esc="auditDialogVisible = false" v-show="auditDialogVisible">
            <video autoplay controls :src="videoPath"></video>
            <div @click="auditDialogVisible = false" class="audit_button">
                <i class="el-icon-close"></i>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        // 搜索关键字
        query: '',
        // 搜索类型
        type: 1,
        // 页码
        start: 1,
        // 每页条数
        limit: 5,
        // 筛选图片与视频
        sort: 0
      },
      // 动态ip地址
      path: '',
      // 素材列表
      scenelist: [],
      // 总数据条数
      total: 0,
      // 多选数组
      multipleSelection: [],
      // 添加便签搜索框文字内容
      inputValue: '',
      // 控制添加标签对话框的显示与隐藏
      addTagDialogVisible: false,
      // 服务器获取的标签列表
      tagList: [],
      // 表单信息
      addTagForm: {
        scene_id: 0,
        tagPitch: []
      },
      // 视频预览面板
      auditDialogVisible: false,
      // 视频预览地址
      videoPath: ''
    }
  },
  created () {
    // 获取资源访问路径
    this.path = JSON.parse(window.sessionStorage.getItem('path'))
    this.getSceneList()
  },
  methods: {
    // 获取素材数据
    async getSceneList () {
      const { data: res } = await this.$http.get('/getSceneList', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.scenelist = res.data
      this.total = res.meta.sum
    },
    // 搜索素材
    searchSceneList () {
      this.queryInfo.start = 1
      this.getSceneList()
    },
    // 筛选选择器发生改变时
    selectChang () {
      this.queryInfo.start = 1
    },
    // 多选状态改变事件
    handleSelectionChange (val) {
      this.multipleSelection = val.map(v => v.id)
    },
    // 监听 pagesize 改变事件
    handleSizeChange (newSize) {
      this.queryInfo.limit = newSize
      this.getSceneList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.start = newPage
      this.getSceneList()
    },
    // 修改用户所属
    async setUserClick () {
      if (this.multipleSelection.length === 0) {
        return this.$message.error('请选择素材！')
      }
      const sate = await this.$prompt('请输入要用户id', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).catch(err => {
        return err
      })
      if (sate === 'cancel') {
        this.$message.info('已取消')
      }
      const { data: res } = await this.$http.post('/setSceneUser', { scene_Arr: this.multipleSelection, user_id: sate.value.trim() })
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('修改成功')
      // 删除成功刷新列表
      this.getSceneList()
    },
    // 批量删除素材
    async deleteScene () {
      if (this.multipleSelection.length === 0) {
        return this.$message.error('请选择素材！')
      }
      const confirmResult = await this.$confirm('此操作将改变所选素材为删除状态，是否继续？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 发送请求
      const { data: res } = await this.$http.delete('/deleteScene', { data: { scene_id_arr: this.multipleSelection } })
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg)
      }
      this.getSceneList()
      this.$message.success('删除成功')
    },
    // 素材状态修改
    async sceneStatuChange (sceneId, status) {
      const { data: res } = await this.$http.put('/scenestatus', { scene_id: sceneId, status: status })
      if (res.meta.status !== 201) {
        this.$message.error(res.meta.msg)
        this.getSceneList()
        return
      }
      this.getSceneList()
      this.$message.success('修改成功')
    },
    // 删除分类标签事件
    async handleprincipalClose (tag) {
      const { data: res } = await this.$http.delete('/delsceneTag', { params: { id: tag } })
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.getSceneList()
      this.$message.success('删除成功')
    },
    // 添加标签按钮
    principalShowInput (sceneId, status) {
      this.addTagForm.scene_id = sceneId
      this.inputValue = ''
      this.tagList = []
      this.TagSearch()
      this.addTagDialogVisible = true
    },
    // 标签搜索
    async TagSearch () {
      this.addTagForm.tagPitch = []
      const { data: res } = await this.$http.get(`/sceneTagSearch?query=${this.inputValue}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.tagList = res.data
    },
    // 监听添加标签对话框的关闭事件
    addTagDialogClosed () {
      this.$refs.addTagRef.resetFields()
    },
    // 确认添加标签按钮
    async addTagClick () {
      if (this.addTagForm.tagPitch.length === 0) {
        return this.$message.error('请选择要添加的标签')
      }
      const { data: res } = await this.$http.post('/addSceneTags', this.addTagForm)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.addTagForm.tagPitch = []
      this.$message.success('添加成功')
      this.getSceneList()
    },
    // 显示审核对话框
    showAuditDialog (path) {
      this.videoPath = path
      this.auditDialogVisible = true
    }
  },
  watch: {
    auditDialogVisible: function () {
      if (this.auditDialogVisible === false) {
        this.videoPath = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-with-select {
    width: 120px;
    margin-right: 10px;
  }
  .text_scene_desc {
    // width: 160px;
    max-height: 280px;
    overflow: scroll;
    text-align: center;
  }
  .ele_tag {
    margin: 5px;
  }
  .tag_seace_content {
    display: flex;
    .el-input {
      margin-right: 20px;
    }
  }
  .el-checkbox-group {
    .el-checkbox {
      margin: 10px;
    }
  }
  .el-radio-group {
    margin: 0 auto;
    .el-radio {
      margin: 5px;
    }
  }
  ::-webkit-scrollbar {
    display: none;
  }
   .tag_seace_content {
    display: flex;
    .el-input {
      margin-right: 20px;
    }
  }
  ::-webkit-scrollbar {
    display: none;
  }
  .input-sort-select {
    width: 100px;
  }
    .audit_content {
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba($color: #000000, $alpha: 0.6);
    z-index: 200;
    margin: 0 auto;
    width: 100%;
    height: 100vh;
    .audit_button {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        z-index: 220;
        position: absolute;
        right: 20px;
        top: 30px;
        background-color: rgba($color: #888888, $alpha: .6);
        cursor: pointer;
        i {
            font-size: 30px;
            color: rgb(172, 172, 172);
            text-align: center;
            line-height: 50px;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
        }
        &:hover {
            background-color: rgba($color: #b4b4b4, $alpha: .6);
            i {
                color: #fff;
            }
        }
    }
    video {
      height: 100vh;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
  }
</style>
