'use strict';

console.log('\'Allo \'Allo! Content script. Debugging'); //modified

//acquire URL of current tab, and query Readability Parser API
//cannot use chrome.tabs in content scripts
var apiPath = 'https://readability.com/api/content/v1/parser'
var apiKey = '47b4422e1b7c3b3d12c717b3d52e6a3151b3e9d9'

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.tabURL) {
      var tabURL = request.tabURL
      console.log('tab url: ', tabURL)
      var xhr = new XMLHttpRequest()
      var path = apiPath + '?token=' + apiKey + '&url=' + tabURL
      console.log('path: ', path)
      xhr.open('GET', path, true)
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          var resp = JSON.parse(xhr.responseText)
          // console.log('parsed text: ', resp)
          // for (var key in resp) {
          //   console.log(key + ': ' + resp[key])
          // }
          console.log('parsed content: ' + resp.content)
        }
      }
      xhr.send()
    }
  }
)
