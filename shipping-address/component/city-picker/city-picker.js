/**
 * 要编写一个自定义组件的步骤：
 * 1.首先需要在 json 文件中进行自定义组件声明
 * （将 component 字段设为 true 可将这一组文件设为自定义组件）; 
 * 
 * 2.同时，还要在 wxml 文件中编写组件模板，在 wxss 文件中加入组件样式，它们的写法与页面的写法类似。
 * 
 * 3.在自定义组件的 js 文件中，需要使用 Component() 来注册组件，并提供组件的属性定义、内部数据和自定义方法。
 *  组件的属性值和内部数据将被用于组件 wxml 的渲染，其中，属性值是可由组件外部传入的。
 * 
 * 4.使用自定义组件：使用已注册的自定义组件前，首先要在页面的json文件中进行引用生明。此时需要提供
 *  每个自定义组件的标签名和对应的自定义组件的文件路径
 **/

 /**
  * 注册组件
  */
 Component({
     options:{
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
     },
     properties: {
         //这里定义了相关属性，属性值可以在组件使用时指定
         visible:{
             type: Boolean,//类型（必填），目前接受的类型包括 String、Number、Boolean、Object、Array、null(表示任意类型)
             value: false
         },
         multiCityArray:{//picker  multiSelector 城市数据
            type: null,
            value:['','','']
         },
         multiIndex:{//picker  multiSelector 当前选中的第几项
            type: null,
            value:[0, 0, 0]
         },
         cityData:{
            type: null,
            value:[]
         }
     },
     data: {
         //这里是一些内部数据
         multiCityArray:['','',''],
         multiIndex:[0, 0, 0]
     },
     methods: {
         //这里是一个自定义方法
         _multiPickerChange: function (e) {
            console.log('picker发送选择改变，携带值为', e.detail.value)
            this.setData({
              multiIndex: e.detail.value
            })
            
            //触发确定回调
            this.triggerEvent('multiPickerChange',{multiIndex:e.detail.value,multiCityArray: this.data.multiCityArray}) 
            //this.triggerEvent('bindMultiPickerChange',{multiIndex:this.data.multiIndex},{}) 
            //triggerEvent可以有三个参数； 第一个参数：回调方法名  第二次参数：回调参数，提供给事件监听函数，第三个参数：触发事件的选项
            //触发事件的选项:bubbles(事件是否冒泡)\composed(事件是否可以穿越组件边界)\capturePhase(事件是否拥有捕获阶段)
          },
          _multiPickerColumnChange: function (e) {
            console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
          
            var cityData = this.data.cityData
            var multiCityArray=this.data.multiCityArray
            var multiIndex=this.data.multiIndex
            multiIndex[e.detail.column]=e.detail.value
        
            if(e.detail.column == 0){//滚动的是省级
              multiCityArray[1]=[]
              multiCityArray[2]=[]
              for(var i=0;i<cityData[e.detail.value].sub.length;i++){
                multiCityArray[1].push(cityData[e.detail.value].sub[i].name)
              }
              for(var i=0;i<cityData[e.detail.value].sub[0].sub.length;i++){
                multiCityArray[2].push(cityData[e.detail.value].sub[0].sub[i].name)
              }
              //重新设置data中的城市数据
              this.setData({
                'multiCityArray':multiCityArray,
                'multiIndex':multiIndex
              })
              return;
            }
            
            if(e.detail.column == 1){//滚动的是市级
              multiCityArray[2]=[]
              for(var i=0;i<cityData[multiIndex[0]].sub[e.detail.value].sub.length;i++){
                multiCityArray[2].push(cityData[multiIndex[0]].sub[e.detail.value].sub[i].name)
              }
              //重新设置data中的城市数据
              this.setData({
                'multiCityArray':multiCityArray,
                'multiIndex':multiIndex
              })
            }
            
            if(e.detail.column == 2){//滚动的是区县级
         
            }
          },
     }
 });
