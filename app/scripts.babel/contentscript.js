'use strict';

//TODO: options for re-clicking browser action--auto-reload
//TODO: clean up URL with "utm" before parsing
//TODO: options for eecummings params

//acquire URL of current tab, and query Readability Parser API
//cannot use chrome.tabs in content scripts
var apiPath = 'https://readability.com/api/content/v1/parser'
var apiKey = '47b4422e1b7c3b3d12c717b3d52e6a3151b3e9d9'
var content = {} //content of a webpage returned by Readability Parser, contains HTML
var paragraphs = []
var words = []
var lines = []

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.tabURL) {
      var tabURL = request.tabURL
      var xhr = new XMLHttpRequest()
      var path = apiPath + '?token=' + apiKey + '&url=' + tabURL
      xhr.open('GET', path, true)
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          content = JSON.parse(xhr.responseText).content
          // console.log(content)
          eecummings(content)
        }
      }
      xhr.send()
    }
  }
)

function eecummings (content) {
  var el = $('<div></div>').html(content) //create new DOM elements from raw HTML with jQuery
  $('p', el).each(function (index) {
    var p = $(this).text()
    if (p.trim() !== '') { //prevent e.g. <img ...> and single newline
      var newP = transformParagraph(p)
      $('p').each(function (index) {
        if ($(this).text() === p) {
          $(this).html(newP.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'))
        }
      })
    }
  })
  console.log('e.e. cummings!')
}

function transformParagraph (p) {
  p = p.replace(/(\r\n|\n|\r)/gm, '')
  words = p.split(' ')
  words = randomCapitalization(words, 0.075) //0.1
  words = randomCase(words, 0.075, 0.075) //0.2, 0.2
  words = randomChunking(words, 0.075) //0.2
  words = randomNewLine(words, 0.2) //0.2
  lines = formLines(words)
  lines = randomTabbing(lines, 0.075) //0.2, 0.3
  p = lines.join(' ')
  return p
}

//TODO: following functions -> separate files -> browerify+gulp
function randomCapitalization (words, perc) {
  var newWords = []
  if (words.length > 0) {
    for (let word of words) {
      if (Math.random() < perc) {
        newWords.push(word.charAt(0).toUpperCase() + word.slice(1))
      } else {
        newWords.push(word.toLowerCase())
      }
    }
  }
  return newWords
}

function randomCase (words, percWord, percLetter) {
  var newWords = []
  var newWordByLetters = []
  if (words.length > 0) {
    for (let word of words) {
      if (Math.random() < percWord) { //use newWordByLetters to store (new) letters
        for (var i = 0, l = word.length; i < l; ++i) {
          if (Math.random() < percLetter) {
            newWordByLetters.push(word.charAt(i).toUpperCase())
          } else {
            newWordByLetters.push(word.charAt(i))
          }
        } //the resulting new letters will be stored in newWordByLetters
        newWords.push(newWordByLetters.join(''))
        newWordByLetters = []
      } else {
        newWords.push(word)
      }
    }
  }
  return newWords
}

function randomChunking (words, perc) {
  var newWords = words[0] ? [words[0]] : []
  var lastNewWord = {}
  if (words.length > 1) {
    for (let word of words.slice(1)) {
      if (Math.random() < perc) {
        lastNewWord = newWords.pop()
        newWords.push(lastNewWord + word)
      } else {
        newWords.push(word)
      }
    }
  }
  return newWords
}

function randomNewLine (words, perc) {
  var newWords = []
  if (words.length > 0) {
    for (let word of words) {
      if (!word.endsWith('\n') && Math.random() < perc) {
        newWords.push(word + '\n')
      } else {
        newWords.push(word)
      }
    }
  }
  return newWords
}

function formLines (words) {
  var lines = []
  var newLine = []
  if (words.length > 0) {
    for (let word of words) {
      newLine.push(word)
      if (word.endsWith('\n')) {
        lines.push(newLine.join(' '))
        newLine = []
      }
    }
    if (newLine.length > 0) { //if the last line doesn't end with \n
      lines.push(newLine.join(' ') + '\n')
    }
  }
  lines.push('\n') //paragraphs are separated by an extra newline
  return lines
}

/*
Cummings also would randomize the tabbing
percLine is the chance of a line being altered
percTabs is the chance of a line having more than one tab
colGuard is the cutoff point (if a line exceeds 79, no more tabs)
*/
function randomTabbing (lines, percLine, percTabs = 0.3) {
  var newLines = []
  if (lines.length > 0) {
    for (let line of lines) {
      if (line.length > 0 && Math.random() < percLine) {
        do {
          line = '\t' + line
        } while (Math.random() < percTabs)
      }
      newLines.push(line)
    }
  }
  return newLines
}
