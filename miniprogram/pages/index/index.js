const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#c4efff',
  'cloudy': '#daeff7',
  'overcast': '#c4ced2',
  'lightrain': '#b6d6e2',
  'heavyrain': '#c3ccd0',
  'snow': '#99e3ff'
}

var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBg: '',
    hourlyWeather: [],
    todayTemp: '',
    todayDate: '',
    city: '广州市',
    locationAuthType: UNPROMPTED 
  },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    });
  },
  onLoad() {
    this.getNow();
    this.qqmapsdk = new QQMapWX({
      key: 'EAXBZ-33R3X-AA64F-7FIPQ-BY27J-5UF5B'
    })
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        let locationAuthType = auth ? AUTHORIZED
          : (auth === false) ? UNAUTHORIZED : UNPROMPTED
        this.setData({
          locationAuthType: locationAuthType,
        })

        if (auth)
          this.getCityAndWeather()
        else
          this.getNow() //使用默认城市广州
      },
      fail: () => {
        this.getNow() //使用默认城市广州
      }
    })
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now', //仅为示例，并非真实的接口地址
      data: {
        city: this.data.city
      },
      success: res => {
        let result = res.data.result;
        this.setNow(result);
        this.setHourlyWeather(result);
        this.setToday(result);
      },
      complete: () => {
        callback && callback();
      }
    });
  },
  // set Now
  setNow(result) {
    let temp = result.now.temp;
    let weather = result.now.weather;
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBg: `../../images/${weather}-bg.png`,
    });
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    });
  },
  // set forecast
  setHourlyWeather(result) {
    let forecast = result.forecast;
    let hourlyWeather = [];
    let nowHour = new Date().getHours();
    for (let i = 0; i < 8; i++ ) {
      hourlyWeather.push({
        time: (i*3 + nowHour) % 24 + '时',
        iconPath: `../../images/${forecast[i].weather}-icon.png`,
        temp: forecast[i].temp + '°'
      });
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result) {
    let date = new Date()
    this.setData({
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`,
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`
    })
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: '../list/list?city=' + this.data.city
    })
  },
  onTapLocation() {
    if (this.data.locationAuthType === UNAUTHORIZED) {
      wx.openSetting({
        success: res => {
          let auth = res.authSetting['scope.userLocation'];
          if(auth) {
            this.getCityAndWeather();
          }
        }
      });
    }
    else {
      this.getCityAndWeather();
    }
  },
  getCityAndWeather() {      
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city: city,
            })
            this.getNow();
          }
        });
      },
      fail: ()=> {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
  }
})

