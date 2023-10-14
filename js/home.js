$(function () {
  const $headerAddr = $('.top-left .address')
  const $navList = $('.top-right .nav')
  const $menuList = $('.menu .list')
  const $searchContent = $('.search-content .content')
  const $searchList = $('.sug-tips .search-list')
  const $arrow = $('.menu .arrow')
  const $secondHouse = $('.recommend-wrapper .second-hand')
  const $communityHouse = $('.recommend-wrapper .community-selection')
  const $qualityHouse = $('.recommend-wrapper .rent-house')
  const $footertitleList = $(`.footer .title-list`)
  const $btnItem = $('.nav-link .btn')
  const $cancel = $('.loadApp .cancel')
  const $loadApp =$('.loadApp')
  const $noticeBannerList = $('.notice-banner .list')
  const $noticeBannerItem = $('.notice-banner .list .item')
  const placeholderString ='请输入区域、商圈或小区名开始'

  // 缓存热门推荐数据
  let cacheSearchList = []
  let channel = 'site'
  let curLocation = ''

  


  
  
  // 1.轮播公告
  let count = 0
  const $firstItem = $noticeBannerItem.eq(0).clone(true)
  $noticeBannerList.append($firstItem)
  const $newNoticeBannerItem = $('.notice-banner .item')
  setInterval(function() {
    count++
    $newNoticeBannerItem.css('transform', `translateY(${-20*count}px)`).css('transition', 'all 2s ease-in')
    if(count === $newNoticeBannerItem.length -1){
      // 变换动画具有2秒的过渡时间，而循环的周期是3秒。因此，必须使用 setTimeout 函数，不然if 语句块中的代码会在过渡动画还没完成的情况下立即执行，导致过渡效果无法完全展现。
      setTimeout(function() {
        $newNoticeBannerItem.css('transform', 'translateY(0px)').css('transition', 'none');
      }, 2000);
      count = 0
    }
  }, 3000)
  

  // 2.监听选项卡
  $menuList.on('click', 'li', function() {
    // 记录当前channel
    channel = $(this).data('key')
    // active切换
    $(this).addClass('active').siblings().removeClass('active')
    // 箭头移动
    const $menuItem = $(this)
    renderMenuArrow($menuItem)
    // 输入框placeholder
    $searchContent.get(0).placeholder =`${placeholderString}${$menuItem.text()}`
  })

  
  // 3.监听输入框输入 防抖
  $searchContent.on('input', _.debounce(
    function() {
      // 记录输入内容
      const key = $(this).val()
      // 发送网络请求
      NetReq.get(Netconfig.baseURL + NetAPI.House_Search, {
        cityId: 440100,
        cityName: curLocation.city,
        channel: channel,
        keyword: key ,
        query: key	 
      }).then(function(res) {
        // 拿到搜索结果
        let searchList = res.data.result || []
        // 数据的映射
        searchList = searchList.map(item => {
          return{title: item.hlsText || item.text}
        })
        renderSearchList(searchList, 1)
      })
    }, 600) 
  )

    // 4.监听输入框聚焦
  $searchContent.on('focus', function () {
    // 判断输入框是否有值
    const value = $(this).val()
    // 输入框内有内容,模拟用户input事件
    if(value.trim()) {
      $(this).trigger('input')
      return
    }
    // 如果已有缓存直接使用缓存
    if(cacheSearchList.length) {
      renderSearchList(cacheSearchList)
      return
    }
    // 没有缓存,发送网络请求获取热门数据
    NetReq.get(Netconfig.baseURL + NetAPI.Home_Recommend).then(res => {
      // 获取数据
      let searchList = res.rent_house_list.list || []
      // 数据的映射
      searchList = searchList.map(item => {
        return { title: item.app_house_title }
      })
      // 数据缓存
      cacheSearchList = searchList
      // 搜索列表展示
      renderSearchList(cacheSearchList)
    })

  })

  // 5.监听输入框失去焦点
  $searchContent.on('blur', function() {
    // 搜索框隐藏
    $searchList.css('display', 'none')
  })

  // 6.监听底部nav鼠标移动
  $btnItem.on('mouseenter','span', function() {
    // 切换active
    $(this).addClass('active').siblings().removeClass('active')
    const $btnList = $('.nav-link .btn span')
    // 获取响应的索引
    const index = Array.from($btnList).indexOf(this)
    // 展示对应的列表
    $('.nav-link .link-list .list').eq(index).css('display', 'block').siblings().css('display', 'none')
  })

  // 7.监听cancel按钮点击
  $cancel.on('click', function() {
    $loadApp.css({
      height: 0,
      overflow: 'hidden'
    })
  })

  // 初始化页面
  NetReq.get(Netconfig.baseURL + NetAPI.Home_Page).then(res => {
    // 渲染头部地址
    renderHeaderAddr(res.curLocation)
    // 渲染topBar
    renderNavList(res.topBars)
    // 渲染searchMenu
    renderSearchMenu(res.searchMenus)
    // 渲染二手房
    renderSecondHouse(res.secondHouse)
    // 渲染小区精选
    renderCommunityHouse(res.comunityHouse)
    // 渲染品质租房
    renderQualityHouse(res.qualityHouse)
    // 渲染footerTitle
    renderFooterTitle(res.footerTitles)
  })

  function renderHeaderAddr(location) {
    $headerAddr.text(location.city)
  }

  function renderNavList(topbar = []) {
    topbar.forEach(item => {
      let htmlString = ''
      htmlString += `
      <li class="item">
      <a href=${item.linkUrl}>${item.title}</a>
      </li>`
      // $navList.empty() //先清除
      $navList.append(htmlString) //再添加
    });
  }

  function renderSearchMenu(searchMenus = []) {
    searchMenus.forEach((item) => {
      let htmlString = ''
      htmlString += `<li class="item" data-key=${item.key}>${item.title}</li>`
      $menuList.append(htmlString)
    })
    $menuList.get(0).children[0].classList.add('active')
  }

  function renderMenuArrow($menuItem) {
    const menuItemWidth = $menuItem.width()
    const menuItemPosition = $menuItem.position()
    const arrowLeft = menuItemWidth/2 + menuItemPosition.left
    $arrow.css('left', `${arrowLeft}px`)
  }

  function renderSearchList(searchList = [], type = 0) {
    const String = type === 0 ? '热门搜索': '你可能在找'
    // 将结果渲染页面
    let htmlString = `<li class="item hot-name">${String}</li>`
    searchList.forEach(item => {
      htmlString += `<li class="item ">${item.title}</li>`
      $searchList.empty().append(htmlString)
    });
    $searchList.css('display', 'block')
  }

  function renderSecondHouse(secondHouse) {
    const secondHouseList = secondHouse.houses
    let htmlString = ``
    secondHouseList.forEach(item => {
      htmlString += `
      <li>
          <a class="house_display" href="#">
            <div class="album">
              <img src="./img/secondhand_album01.jpg" alt="">
              <i class="vr_item"></i>
              <i class="goodhouse" style='background-image: url(${item.tagImgUrl})'></i>
            </div>
            <div class="name">
              <p class="location nowrap_ellipsis">${item.title}</p>
              <p class="house_name nowrap_ellipsis">${item.subTitle}</p>
            </div>
            <div class="info">
              <span class="left">${item.specification}平方</span>
              <span class="right">${item.referenceTotalPrice}</span>
            </div>
          </a>
        </li>
      `
    })
    $secondHouse.html(`
      <h1 class="section_title">${secondHouse.title}</h1>
      <div class="section_sug">
      <div class="left">${secondHouse.subTitle}</div>
      <a href="" class="more">更多广州二手房</a>
      </div>
      <ul class="house_list">
      ${htmlString}
      </ul>
    `)
  }

  function renderCommunityHouse(communityHouse) {
    const communityList = communityHouse.houses
    let htmlString = ``
    communityList.forEach(item => {
      htmlString += `
      <li>
          <a class="community_display">
            <div class="album">
              <img src="./img/community-selection-01.jpg.280x210.jpg" alt="">
            </div>
            <div class="info">
              <span class="left">${item.title}</span>
              <span class="right">${item.perSquareAveragePrice}</span>
            </div>
            <p class="year">${item.buildDate}</p>
          </a>
        </li>
      `
    })
    $communityHouse.html(`
      <h1 class="section_title">${communityHouse.title}</h1>
      <div class="section_sug">
      <div class="left">${communityHouse.subTitle}</div>
      <a href="" class="more">更多广州小区</a>
      </div>
      <ul class="house_list community_list">
      ${htmlString}
      </ul>
    `)
  }

  function renderQualityHouse(qualityHouse) {
    const qualityHouseList = qualityHouse.houses
    let htmlString = ''
    qualityHouseList.forEach(item => {
      htmlString += `
        <li>
          <a class="house_display rent_display">
            <div class="album">
              <img src="./img/renthouse_album.jpg" alt="">
            </div>
            <div class="name">
              <p class="nowrap_ellipsis">${item.title}</p>
            </div>
            <div class="info">
              <span class="left">${item.address}/${item.specification}</span>
              <span class="right">${item.monthRentPrice}</span>
            </div>
          </a>
        </li>
      `
    })
    $qualityHouse.html(`
      <h1 class="section_title">${qualityHouse.title}</h1>
      <div class="section_sug">
        <div class="left">${qualityHouse.subTitle}</div>
        <a href="" class="more">更多广州租房</a>
      </div>
      <ul class="house_list rent_list">
        ${htmlString}
      </ul>
    `)
  }

  function renderFooterTitle(footerTitles) {
    let htmlString = ''
    footerTitles.forEach(item => {
      htmlString += `<li class="item"><a href=${item.linkUrl}>${item.title}</a></li>`
    })
    $footertitleList.html(htmlString)
  }

})
