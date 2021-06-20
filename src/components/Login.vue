<template>
    <div class="login_container" @keyup.enter="login">
        <img class="image_backgrund" src="@/assets/images/home.jpg" alt="">
        <div class="body_shade"></div>
        <div class="login_box">
            <!-- 头像部分 -->
            <div class="avatar_box">
                <img src="@/assets/logo.png" alt="">
            </div>
            <!-- 登录表单区 -->
            <el-form ref="loginFormRef" label-width="0px" class="login_from" :model="loginForm" :rules="loginFormRules">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input placeholder="请输入账号" v-model="loginForm.username" prefix-icon="iconfont icon-denglu"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input placeholder="请输入密码" v-model="loginForm.password" prefix-icon="iconfont icon-suo" type="password"></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="danger" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import MD5 from 'js-md5'
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: 'admin'
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //   点击重置按钮，重置登录表单
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    // 对整个登录表单进行预校验的方法
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const data = {
          username: this.loginForm.username,
          password: MD5(this.loginForm.password)
        }
        const { data: res } = await this.$http.post('/login', data)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('登录成功')
        // 1.登录成功之后的token与用户信息，保存 到客户端的sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        window.sessionStorage.setItem('userMsg', JSON.stringify({ user_id: res.data.id, user_name: res.data.username, status: res.data.status }))
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="scss" >
    .login_container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
    }
    .login_box {
        z-index: 200;
        width: 450px;
        height: 300px;
        background-color: RGBA(255,255,255,.6);
        border-radius: 8px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        .avatar_box {
            height: 110px;
            width: 110px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: RGBA(255,255,255,.7);
            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #fff;
            }
        }
    }
    .login_from {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
    }
    .btns {
        display: flex;
        justify-content: flex-end;
    }
    .image_backgrund {
        width: 100%;
        height: 100%;
        filter: blur(14px);
        transform: scale(1.05);
    }
    .body_shade {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color:RGBA(255,255,255,.1);
    }
    .el-input__inner {
        background-color: RGBA(255,255,255,.37) !important;
        // border: none;
    }
    input::-webkit-input-placeholder{
        color:rgb(146, 146, 146) !important;
    }
    input:-moz-placeholder{
        color:rgb(146, 146, 146) !important;
    }
</style>
