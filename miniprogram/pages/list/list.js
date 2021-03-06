const dayMap = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
// miniprogram/pages/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    weekWeather: [],
    city: '广州市'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      city: options.city
    })
    this.getWeekWeather();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getWeekWeather(() => {
      wx.stopPullDownRefresh()
    })
  },
  
  getWeekWeather(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: this.data.city,
        time: new Date().getTime()
      },
      success: res => {
        let result = res.data.result;
        this.setWeekWeather(result);
      },
      complete: () => {
        callback && callback();
      }
    })
  },
  setWeekWeather(result) {
    let weekWeather = [];
    for (let i = 0; i < 7; i++) {
      let date = new Date();
      date.setDate(date.getDate() + i);
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        temp: `${result[i].minTemp}° - ${result[i].maxTemp}°`,
        iconPath: `../../images/${result[i].weather}-icon.png`
      })
    }
    weekWeather[0].day = '今天';
    this.setData({
      weekWeather: weekWeather
    })
  }
})