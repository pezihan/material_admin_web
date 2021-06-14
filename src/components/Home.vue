<template>
    <el-container class="home-container" >
        <!-- 頭部區域 -->
        <el-header ref="header">
            <div >
                <span>后台管理</span>
            </div>
            <span>{{ userMsg.user_name }}</span>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px' : '200px'"> <!--侧边栏展开为200px 折叠时为64px-->
                <!-- 侧边栏菜单 -->
                <el-menu :class="status == false ? '' : 'fiedx'" background-color="#444444" text-color="#fff" active-text-color="#e37554"
                unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true"
                :default-active="activePath">
                  <div class="toggle-button" @click="toggleCollapse"><a style="color:#fff;fontSize:14px">{{ btntext }}</a></div>
                <!-- collapse 是否折叠  collapse-transition 是否使用折叠动画 -->
                    <!-- 一级菜单 -->
                    <el-submenu :index="index + ''" v-for="(item,index) in menulist" :key="item.name">
                        <!-- 一级菜单模板区 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[index]"></i>
                            <!-- 文本 -->
                            <span>{{ item.name }}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="subItem.nav" v-for="subItem in item.list" :key="subItem.nav" @click="saveNavState(subItem.nav)">
                            <template slot="title">
                            <!-- 图标 -->
                            <i class="el-icon-menu"></i>
                            <!-- 文本 -->
                            <span>{{ subItem.name }}</span>
                        </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容主体 -->
            <el-main>
                  <keep-alive include="AppUser,VirtualUser,SceneCrawling,AudioTagManage,AudioTag">
                    <router-view></router-view>
                  </keep-alive>
            </el-main>
        </el-container>
        <el-backtop :bottom="100">回到顶部</el-backtop>
    </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        0: 'iconfont icon-yonghuguanli',
        1: 'iconfont icon-sucai-outline',
        2: 'iconfont icon-biaoqian1',
        3: 'iconfont icon-yonghuguanli1'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: '',
      // 用户信息
      userMsg: {},
      // 展开与合并按钮文字
      btntext: '<合并',
      // 设置左侧是否为固定
      status: false
    }
  },
  created () {
    this.judgeAamin()
    this.activePath = window.sessionStorage.getItem('activePath')
    this.userMsg = JSON.parse(window.sessionStorage.getItem('userMsg'))
    this.getPath()
  },
  mounted () {
    window.addEventListener('scroll', this.headerScroll)
  },
  methods: {
    // 判断用户是管理员还是普通账号
    judgeAamin () {
      const status = JSON.parse(window.sessionStorage.getItem('userMsg'))
      if (status.status === 2) {
        // 管理员
        this.menulist = [
          {
            name: '用户管理',
            list: [{
              name: '所有用户',
              nav: '/allUser'
            }, {
              name: '关键词',
              nav: '/keyword'
            }]
          },
          {
            name: '素材管理',
            list: [{
              name: '所有素材',
              nav: '/allScene'
            }, {
              name: '素材爬取',
              nav: '/sceneCrawling'
            }]
          },
          {
            name: '标签管理',
            list: [{
              name: '所有标签',
              nav: '/allTag'
            }]
          },
          {
            name: '权限管理',
            list: [{
              name: '所有账号',
              nav: '/allAccount'
            }]
          }
        ]
      } else {
        this.menulist = [
          {
            name: '用户管理',
            list: [{
              name: '所有用户',
              nav: '/allUser'
            }, {
              name: '关键词',
              nav: '/keyword'
            }]
          },
          {
            name: '素材管理',
            list: [{
              name: '所有素材',
              nav: '/allScene'
            }, {
              name: '素材爬取',
              nav: '/sceneCrawling'
            }]
          },
          {
            name: '标签管理',
            list: [{
              name: '所有标签',
              nav: '/allTag'
            }]
          }
        ]
      }
    },
    // 获取素材路径地址
    async getPath () {
      const { data: res } = await this.$http.get('/getPath')
      if (res.meta.status !== 200) return this.$message.error('资源访问路径获取失败')
      window.sessionStorage.setItem('path', JSON.stringify(res.data))
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
      if (this.isCollapse === true) {
        this.btntext = '展开>'
      } else {
        this.btntext = '<合并'
      }
    },
    // 保存链接的激活状态 （保存子菜单的index值到sessionStorage中，页面加载时取出来）
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/')
    },
    // 页面滚动
    headerScroll () {
      const height = Number(parseInt(this.$refs.header.height))
      const scrollHeight = document.documentElement.scrollTop || document.body.scrollTop
      if (scrollHeight >= height) {
        this.status = true
      } else {
        this.status = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .home-container {
        height: 100%;
    }
    .el-header {
        background-color: #333333;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        align-items: center;
        color: #fff;
        font-size: 20px;
        > div {
            display: flex;
            align-items: center;
            span {
                margin-left: 15px;
            }
        }
    }
    .el-aside {
        background-color: #444444;
        .el-menu {
            border-right: none;
        }
    }
    .el-main {
        background-color: #EAEDF1;
    }
    .iconfont {
        margin-right: 10px;
        color: #fff;
    }
    .toggle-button {
        background-color: #535353;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
    .el-backtop {
    background-color: rgb(160, 160, 160);
    color: #fff;
    width: 50px;
    height: 50px;
    text-align: center;
    font-size: 15px;
    padding: 5px;
    &:hover {
      background-color: rgb(110, 110, 110);
    }
  }

  .fiedx {
    position: fixed;
    top: 0;
  }
</style>
