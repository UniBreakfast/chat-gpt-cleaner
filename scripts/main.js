console.log("<<< chatGPT cleaner extension is running >>>")

setInterval(highlightDisclaimers, 2000)

document.addEventListener('keydown', event => {
  if (event.altKey && event.code === 'KeyC') {
    toggleComments()
  }
})

function toggleComments() {
  const comments = findAllComments()

  if (!comments) return

  const visibleComments = findAllVisible(comments)

  if (visibleComments) hide(visibleComments)
  else show(comments)
}

function findAllComments() {
  const comments = document.querySelectorAll('span[class*="-comment"]')

  return comments.length ? comments : null
}

function findAllVisible(comments) {
  const visibleComments = [...comments].filter(c => !c.hidden)

  return visibleComments.length ? visibleComments : null
}

function hide(comments) {
  for (let c of comments) {
    c.hidden = true
    if (!c.textContent.endsWith('*/')) c.nextSibling.remove()
  }
}

function show(comments) {
  for (let c of comments) {
    c.hidden = false
    if (!c.textContent.endsWith('*/')) {
      const indent = c.previousSibling?.textContent.match(/ *$/)[0] || ''
      c.replaceWith(c, '\n' + indent)
    }
  }
}

function highlightDisclaimers() {
  let messageBlocks = document.querySelectorAll("[class^=ThreadLayout__]>[class^=ConversationItem__]")

    ;[...messageBlocks]
      .filter(msg => msg.querySelectorAll("button").length > 1)
      .forEach(msg => {
        msg.querySelectorAll('p').forEach(p => {
          if (p.innerText.toLowerCase().includes('large language model trained by openai')) {
            p.title = p.innerText
            p.innerText = 'POSSIBLE DISCLAIMER'
          }
        })
      })
}
