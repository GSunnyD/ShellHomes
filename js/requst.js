;(function(window, $) {
  function request(config) {
    return $.ajax({
      url: config.url || '',
      method: config.method || 'GET',
      data: config.data || {},
      timeout: config.timeout || 5000,
      header: config.header || {}
    })
  }

  function get(url, data = {}) {
    return request({
      url,
      method: 'GET',
      data,
    })
  }

  function post(url, data = {}) {
    return request({
      url,
      method: 'POST',
      data,
    })
  }

  window.NetReq = {
    request,
    get,
    post
  }
})(globalThis, jQuery)