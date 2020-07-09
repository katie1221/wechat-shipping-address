// pages/shipping-address/shipping-address.js
//引入城市JSON数据文件
var tcity = require("../../utils/citys-select.js")
//获取app实例
var app =getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    concatPerson: "",//联系人
    phone: "",//手机号
    address: "",//详细地址
    multiCityArray:  ['','',''],//picker  multiSelector 城市数据
    multiIndex: [0, 0, 0],//picker  multiSelector 当前选中的第几项
    cityData:[],
    isWechat:false,//是否使用微信收货地址
    visible: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initCityData()
  },
  //文本框失去焦点事件
  bindinputblur: function(e){
    console.log(e)
    let type = e.currentTarget.dataset.type
    if(type == "concatPerson"){
      this.data.concatPerson = e.detail.value
    }else if(type == "phone"){
      this.data.phone = e.detail.value
    }else if(type == "address"){
      this.data.address = e.detail.value
    }

  },
   //获取JSON 城市数据，进行 picker  multiSelector 所需数据
   initCityData:function(){
    var that = this
    //一、获取城市JSON数据
    tcity.init(that)
    var cityData = that.data.cityData
    this.data.cityData= cityData
    
    //二、组装multiCityArray 数据数组
    var multiCityArray=[[],[],[]]
    //1.遍历城市JSON数据，组装 省级 数据数组
    for(var i=0;i<cityData.length;i++){
      multiCityArray[0].push(cityData[i].name)
    }
    //2.遍历第一个省份的数据，组装 该省级下的城市 数据数组
    for(var i=0;i<cityData[0].sub.length;i++){
      multiCityArray[1].push(cityData[0].sub[i].name)
    }
    //3.遍历第一个省份下的第一个城市的数据，组装 该市级下的区县 数据数组
    for(var i=0;i<cityData[0].sub[0].sub.length;i++){
      multiCityArray[2].push(cityData[0].sub[0].sub[i].name)
    }

    //设置data中的multiCityArray数据,并渲染页面
    this.setData({
      'multiCityArray': multiCityArray
    })
  }, 
  //picker change回调
  _multiPickerChange:function(e){
    console.log("调用父组件的事件")
    console.log("调用父组件的事件",e)
    this.data.multiIndex = e.detail.multiIndex
    this.data.multiCityArray = e.detail.multiCityArray
  },
  //保存
  save:function(){
    let concatPerson = this.data.concatPerson
    let phone = this.data.phone
    let address = this.data.address
    if(!concatPerson){
      wx.showToast({
        title: "请输入联系人姓名",
        icon :'none' //success、loading、none 
      })
      return
    }
    var phonetel = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if(!phone){
      wx.showToast({
        title: "请输入手机号",
        icon :'none' //success、loading、none 
      })
      return
    }else{
      if(!phonetel.test(phone)){
        wx.showToast({
          title: "请输入合法的手机号",
          icon :'none' //success、loading、none 
        })
        return
     }
    } 
    //处理省份、城市、区县  中文名称
    let province=this.data.multiCityArray[0][this.data.multiIndex[0]]
    let city=this.data.multiCityArray[1][this.data.multiIndex[1]]
    let district=this.data.multiCityArray[2][this.data.multiIndex[2]]
    console.log("province",province)
    console.log("city",city)
    console.log("district",district)

    //处理省份、城市、区县
    let provinceObject=this.data.cityData[this.data.multiIndex[0]]
    let cityObject=this.data.cityData[this.data.multiIndex[0]].sub[this.data.multiIndex[1]]
    let districtObject=this.data.cityData[this.data.multiIndex[0]].sub[this.data.multiIndex[1]].sub[this.data.multiIndex[2]]
    console.log("provinceObject",provinceObject)
    console.log("cityObject",cityObject)
    console.log("districtObject",districtObject)
    
  },
  //微信小程序获取用户收货地址:获取用户收货地址需要用户点击授权。所以有两种情况：确定授权、取消授权。
  //情况一：用户第一次访问用户地址授权，并且点击确定授权
  //情况二：用户点击取消授权后，再次获取授权
  /**
   * 流程如下：
   * 1.点击事件触发函数，获取用户当前设置
   * 2.根据用户当前设置中的用户授权结果，判断是否包含收货地址授权
   * 3.如果包含收货地址授权并且没有取消过收货地址授权，直接调用wx.chooseAddress()，获取用户收货地址
   * 4.取消过收货地址授权，调用wx.openSetting(),调起客户端小程序设置界面让用户去打开授权
   *  4.1：用户当前设置包含收货地址授权但是用户点击取消授权，调用wx.openSetting()，调起客户端小程序设置界面让用户去打开授权
   *  4.2：用户当前设置不包含收货地址授权（说明是第一次打开获取用户收货地址信息的授权），调用wx.chooseAddress()，获取用户收货地址
   */
  getWechatAddress:function(){
    var that = this
    //1.获取用户当前设置
    wx.getSetting({
      success(res){
        //2.res.authSetting:返回的授权结果
        if(res.authSetting['scope.address']){
          //3.如果包含收货地址授权并且没有取消过收货地址授权，直接调用wx.chooseAddress()，获取用户收货地址
          wx.chooseAddress({
            success(data){
              console.log('3chooseAddress',data)
              that.data.isWechat = true
              //console.log('errmsg',data.errMsg)//错误信息
              //let postalCode = data.postalCode//邮编
              //let nationalCode = data.nationalCode//收货地址国家码
              that.data.concatPerson = data.userName//收货人姓名
              that.data.phone = data.telNumber//收货人手机号码
              that.data.address = data.detailInfo//详细收货地址信息
              let provinceName = data.provinceName//国标收货地址第一级地址
              let cityName = data.cityName//国标收货地址第二级地址
              let countyName = data.countyName//国标收货地址第三级地址

              //根据返回的省份、城市、区县名称 处理 multiIndex 和multiCityArray
              that.handelMultiCityInfo(provinceName,cityName,countyName)
            }
          })
        }else {
          //4.取消过收货地址授权，调用wx.openSetting(),调起客户端小程序设置界面让用户去打开授权
          if(res.authSetting['scope.address'] == false){
            wx.openSetting({
              success(data){
                console.log('openSetting',data)
                //打开授权， 用wx.chooseAddress()，获取用户收货地址
                wx.chooseAddress({
                  success(res){
                    console.log('5.chooseAddress',res)
                    that.data.isWechat = true
                    //console.log('errmsg',res.errMsg)//错误信息
                    //let postalCode = res.postalCode//邮编
                    //let nationalCode = res.nationalCode//收货地址国家码
                    that.data.concatPerson = res.userName//收货人姓名
                    that.data.phone = res.telNumber//收货人手机号码
                    that.data.address = res.detailInfo//详细收货地址信息
                    let provinceName = res.provinceName//国标收货地址第一级地址
                    let cityName = res.cityName//国标收货地址第二级地址
                    let countyName = res.countyName//国标收货地址第三级地址
                    
                    //根据返回的省份、城市、区县名称 处理 multiIndex 和multiCityArray
                    that.handelMultiCityInfo(provinceName,cityName,countyName)
                  }
                })
              }
            })
          }else{
            //4.2用户当前设置不包含收货地址授权（说明是第一次打开获取用户收货地址信息的授权），调用wx.chooseAddress()，获取用户收货地址
            wx.chooseAddress({
              success(data){
                console.log('4.2chooseAddress',data)
                that.data.isWechat = true
                //console.log('errmsg',data.errMsg)//错误信息
                //let postalCode = data.postalCode//邮编
                //let nationalCode = data.nationalCode//收货地址国家码
                that.data.concatPerson = data.userName//收货人姓名
                that.data.phone = data.telNumber//收货人手机号码
                that.data.address = data.detailInfo//详细收货地址信息
                let provinceName = data.provinceName//国标收货地址第一级地址
                let cityName = data.cityName//国标收货地址第二级地址
                let countyName = data.countyName//国标收货地址第三级地址
  
                //根据返回的省份、城市、区县名称 处理 multiIndex 和multiCityArray
                that.handelMultiCityInfo(provinceName,cityName,countyName)
              }
            })
          }
        }
        
      }
    })
  },
  /**
   * 根据省份、城市、区县名称 处理 multiIndex 和multiCityArray
   * @provinceName 省份名称
   * @cityName 城市名称
   * @countyName 区县名称
   */
  handelMultiCityInfo(provinceName,cityName,countyName){
    
    /**findIndex():返回传入一个测试条件（函数）符合条件的数组第一个元素位置；
      当数组中的元素在测试条件时返回 true 时, findIndex() 返回符合条件的元素的索引位置，之后的值不会再调用执行函数。
      如果没有符合天剑的元素返回-1
    **/
    //读取省 索引位置 
    var pIndex = this.data.cityData.findIndex(ele =>{
      return ele.name == provinceName
    })
    if(pIndex != -1){//省份存在
      this.data.multiIndex[0] = pIndex
    }
    
    //读取市 索引位置 
    var cIndex = this.data.cityData[pIndex].sub.findIndex(ele =>{
      return ele.name == cityName
    })
    if(cIndex != -1){//城市存在
      this.data.multiIndex[1] = cIndex
    }
    //读取区县 索引位置 
    var dIndex = this.data.cityData[pIndex].sub[cIndex].sub.findIndex(ele =>{
      return ele.name == countyName
    })
    if(dIndex != -1){//区县存在
      this.data.multiIndex[2] = dIndex
    }
    //组装multiCityArray 数据数组
    var multiCityArray=[[],[],[]]
    var cityData = this.data.cityData
    //1.遍历城市JSON数据，组装 省级 数据数组
    for(var i=0;i<cityData.length;i++){
      multiCityArray[0].push(cityData[i].name)
    }
    //2.遍历索引为pIndex的省份的数据，组装 该省级下的城市 数据数组
    for(var i=0;i<cityData[pIndex].sub.length;i++){
      multiCityArray[1].push(cityData[pIndex].sub[i].name)
    }
    //3.遍历索引为pIndex的省份下的索引为cIndex的城市的数据，组装 该市级下的区县 数据数组
    for(var i=0;i<cityData[pIndex].sub[cIndex].sub.length;i++){
      multiCityArray[2].push(cityData[pIndex].sub[cIndex].sub[i].name)
    }
    this.setData({
      multiIndex:this.data.multiIndex,
      multiCityArray:multiCityArray,
      concatPerson: this.data.concatPerson,
      phone: this.data.phone,
      address: this.data.address

    })
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
})