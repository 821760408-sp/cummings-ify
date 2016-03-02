'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

//added
//acquire URL of current tab, and query Readability Parser API
//cannot use chrome.tabs in content scripts
chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.query(
    {active: true, currentWindow: true},
    tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {tabURL: tabs[0].url}, response => {})
    }
  )
})
