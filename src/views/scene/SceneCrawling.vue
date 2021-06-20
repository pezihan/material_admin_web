<template>
    <div>
      <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>素材管理</el-breadcrumb-item>
            <el-breadcrumb-item>素材爬取</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
          <!-- 搜索与添加区 -->
            <div class="content">
              <el-input class="description" placeholder="请输入关键字" v-model="description"></el-input>
              <div>
                <el-tag v-for="item in imagesInfo.tagPitch" @close="handleClose(item.id)" closable :key="item.id">{{ item.name }}</el-tag>
              </div>
              <div class="user_button">
                <el-button size="small" type="primary" icon="el-icon-paperclip" :disabled="btnShow" @click="principalShowInput">分类选择</el-button>
                <el-button size="small" type="primary" icon="el-icon-picture-outline" :disabled="btnShow" @click="addImagesUser">爬取图片</el-button>
                <el-button  size="small" type="primary" icon="el-icon-video-play" :disabled="btnShow" @click="addVideoUser">爬取视频</el-button>
                <el-button size="small" type="info" icon="el-icon-delete" :disabled="btnShow" @click="description = ''">清空</el-button>
                <el-input class="userInput" type="number" :disabled="btnShow" clearable placeholder="请输入用户id" size="small" v-model="imagesInfo.user_id"></el-input>
                <el-input class="userInput" type="number" clearable :disabled="btnShow" placeholder="请输入爬取数量" size="small" v-model="datasum"></el-input>
              </div>
              <el-progress :percentage="schedule"></el-progress>
              <div :span="20" class="content_box">
                <p v-for="(item,index) in contentText" :key="index" class="content_msg">{{ item }}</p>
              </div>
            </div>
        </el-card>
        <!-- 添加对话框 -->
        <el-dialog title="添加分类标签" :visible.sync="addTagDialogVisible" width="50%" @close="addTagDialogClosed">
          <div class="tag_seace_content">
            <el-input @input="TagSearch" placeholder="请输入标签关键字" v-model="inputValue" clearable></el-input>
              <el-button type="primary" @click="addTagClick">添加标签</el-button>
          </div>
          <el-form ref="addTagRef" label-width="70px">
            <el-checkbox-group v-model="tagList.tagId" size="mini">
              <el-checkbox v-for="item in tagList.tagArr" :key="item.id" :label="item.id" border>{{ item.name }}</el-checkbox>
            </el-checkbox-group>
          </el-form>
        </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'SceneCrawling',
  data () {
    return {
      // 提交的图片爬取数据
      imagesInfo: {
        user_id: '',
        tagPitch: [],
        data: {}
      },
      // 要爬取的数量
      datasum: '',
      // 第三方爬取关键字
      description: '',
      // 选择的分类标签
      tagList: {
        tagArr: [],
        tagId: []
      },
      // 分类标签搜索关键字
      inputValue: '',
      // 标签选择对话框
      addTagDialogVisible: false,
      // 获取爬取数据的分页
      pn: 0,
      // 素材搜索id
      searchId: '',
      // 爬取进度条
      schedule: 0,
      // 图片爬取成功数据临时存放
      crawlingData: [],
      // 爬取消息打印
      contentText: [],
      // 素材爬取类型
      type: 1,
      // 用户id
      user_id: '',
      // 按钮是否禁用状态
      btnShow: false,
      // 视频下载数组索引
      scene_index: 0,
      // 下载成功
      succeed: 0,
      // 下载失败
      errors: 0,
      // 定时器
      timer: null,
      // 用于批量查询下载是视频的序列号
      crawlingIndex: 0
    }
  },
  methods: {
    // 监听添加标签对话框的关闭事件
    addTagDialogClosed () {
      this.$refs.addTagRef.resetFields()
    },
    // 添加标签按钮
    principalShowInput () {
      this.inputValue = ''
      this.tagList = {
        tagArr: [],
        tagId: []
      }
      this.TagSearch()
      this.addTagDialogVisible = true
    },
    // 标签搜索
    async TagSearch () {
      const { data: res } = await this.$http.get(`/sceneTagSearch?query=${this.inputValue}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.tagList.tagArr = res.data
    },
    // 添加标签
    addTagClick () {
      this.tagList.tagArr.forEach(item => {
        if (this.tagList.tagId.some(v => v === item.id)) {
          this.imagesInfo.tagPitch.push(item)
        }
      })
      this.tagList.tagArr = []
      this.tagList.tagId = []
      this.inputValue = ''
      this.addTagDialogVisible = false
    },
    // 删除标签
    handleClose (id) {
      const index = this.imagesInfo.tagPitch.findIndex(item => item.id === id)
      this.imagesInfo.tagPitch.splice(index, 1)
    },
    // 爬取图片请求
    async addImagesUser () {
      if (this.datasum === '') {
        return this.$message.error('请输入要爬取的数量')
      } else if (this.imagesInfo.user_id === '') {
        return this.$message.error('请输入要存入的用户id')
      } else if (this.description === '') {
        return this.$message.error('请输入爬取关键字')
      }
      if (this.crawlingData.length === 0) {
        this.contentText = []
        this.schedule = 0
      }
      const { data: res } = await this.$http.get('/getImageReq', { params: { keyword: this.description, pn: this.pn } })
      if (res.meta.status !== 200) {
        this.btnShow = false
        this.succeed = 0
        this.errors = 0
        this.pn = 0
        this.crawlingData = []
        this.$message.error(res.meta.msg)
        this.contentText.unshift(res.meta.msg)
        return
      }
      this.crawlingData = res.data
      this.btnShow = true
      // 轮询爬取
      this.imageDownload()
    },
    async imageDownload (index) {
      if (this.succeed === Number(this.datasum)) {
        this.btnShow = false
        this.contentText.unshift(`爬取完成，成功${this.succeed}，失败${this.errors}，已保存在id为${this.imagesInfo.user_id}账号下`)
        this.succeed = 0
        this.errors = 0
        this.pn = 0
        this.crawlingData = []
        return
      }
      let i = index === undefined ? 0 : index
      if (i === this.crawlingData.length) {
        this.pn += 30
        this.addImagesUser()
        return
      }
      this.imagesInfo.data = this.crawlingData[i]
      const { data: res } = await this.$http.post('/setImagesReq', this.imagesInfo)
      if (res.meta.status === 404) {
        this.btnShow = false
        this.succeed = 0
        this.errors = 0
        this.pn = 0
        this.crawlingData = []
        this.$message.error(res.meta.msg)
        this.contentText.unshift(res.meta.msg)
      } else if (res.meta.status === 100) {
        this.contentText.unshift(`${this.crawlingData[i].fromPageTitleEnc}，${this.crawlingData[i].middleURL}---已经爬取过，已取消下载！`)
        this.imageDownload(++i)
      } else if (res.meta.status === 201) {
        this.contentText.unshift(`${this.succeed}：${this.crawlingData[i].fromPageTitleEnc}，${this.crawlingData[i].middleURL}---爬取成功！`)
        this.succeed++
        this.schedule = parseInt(this.succeed / Number(this.datasum) * 100)
        this.imageDownload(++i)
      } else {
        this.btnShow = true
        this.contentText.unshift(`${this.crawlingData[i].fromPageTitleEnc}，${this.crawlingData[i].middleURL}--爬取失败！${res.meta.msg}`)
        this.errors++
        this.imageDownload(++i)
      }
    },
    // 爬取视频请求
    async addVideoUser () {
      if (this.datasum === '') {
        return this.$message.error('请输入要爬取的数量')
      } else if (this.imagesInfo.user_id === '') {
        return this.$message.error('请输入要存入的用户id')
      } else if (this.description === '') {
        return this.$message.error('请输入爬取关键字')
      }
      if (this.crawlingData.length === 0) {
        this.contentText = []
        this.schedule = 0
        this.searchId = ''
      }
      const { data: res } = await this.$http.get('/getVideoReq', { params: { keyword: this.description, pn: this.pn, searchId: this.searchId } })
      if (res.meta.status !== 200) {
        this.btnShow = false
        this.succeed = 0
        this.errors = 0
        this.pn = 0
        this.crawlingData = []
        this.$message.error(res.meta.msg)
        this.contentText.unshift(res.meta.msg)
        return
      }
      this.crawlingData = res.data.feeds
      this.searchId = res.data.searchSessionId
      this.btnShow = true
      // 轮询爬取
      this.videoDownload()
    },
    async videoDownload (index) {
      if (this.succeed === Number(this.datasum)) {
        this.btnShow = false
        this.contentText.unshift(`爬取完成，成功${this.succeed}，失败${this.errors}，已保存在id为${this.imagesInfo.user_id}账号下`)
        this.succeed = 0
        this.errors = 0
        this.pn = 0
        this.searchId = ''
        this.crawlingData = []
        return
      }
      let i = index === undefined ? 0 : index
      if (i === this.crawlingData.length) {
        this.pn++
        this.addVideoUser()
        return
      }
      this.imagesInfo.data = this.crawlingData[i]
      const { data: res } = await this.$http.post('/setVideoReq', this.imagesInfo)
      if (res.meta.status === 404) {
        this.btnShow = false
        this.searchId = ''
        this.succeed = 0
        this.errors = 0
        this.pn = 0
        this.crawlingData = []
        this.$message.error(res.meta.msg)
        this.contentText.unshift(res.meta.msg)
      } else if (res.meta.status === 100) {
        this.contentText.unshift(`${this.crawlingData[i].photo.caption}，${this.crawlingData[i].photo.photoUrl}---已经爬取过，已取消下载！`)
        this.videoDownload(++i)
      } else if (res.meta.status === 201) {
        this.contentText.unshift(`${this.succeed}：${this.crawlingData[i].photo.caption}，${this.crawlingData[i].photo.photoUrl}---爬取成功！`)
        this.succeed++
        this.schedule = parseInt(this.succeed / Number(this.datasum) * 100)
        this.videoDownload(++i)
      } else {
        this.btnShow = true
        this.contentText.unshift(`${this.crawlingData[i].photo.caption}，${this.crawlingData[i].photo.photoUrl}--爬取失败！${res.meta.msg}`)
        this.errors++
        this.videoDownload(++i)
      }
    }
  }
}

</script>

<style lang="scss" scoped>
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
  .el-tag {
      margin-right: 10px;
  }
  .user_button {
      margin-top: 20px;
  }
  .content {
    width: 1000px;
    // margin: 0 auto;
  }
  .description {
    margin-bottom: 20px;
  }
  .userInput {
    width: 150px;
    margin-left: 10px;
  }
  .content_box {
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    color: #909399;
    padding: 0 10px;
    margin-top: 15px;
    p {
      word-break:break-word
    }
  }
  .content_msg {
    margin: 15px 0;
  }
</style>
