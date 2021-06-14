module.exports = {
  devServer: {
    proxy: {
      '/admin': {
        target: 'http://127.0.0.1:5000',
        //   ws: true,
        changeOrigin: true
      }
      // '/foo': {
      //   target: '<other_url>'
      // }
    }
  },

  publicPath: './',
  outputDir: 'C:\\web前端\\素材分享web\\material_server\\web',
  lintOnSave: false
}
