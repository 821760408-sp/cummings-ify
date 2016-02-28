'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'Allo'});

console.log('\'Allo \'Allo! Event Page for Browser Action');

//added
//acquire URL of current tab, and query Readability Parser API
//cannot use chrome.tabs in content scripts
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.query(
    {active: true, currentWindow: true},
    function (tabs) {
      console.log('query tabs done')
      chrome.tabs.sendMessage(tabs[0].id, {tabURL: tabs[0].url}, function(response) {})
    }
  )
})
