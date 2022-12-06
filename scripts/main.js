const disclaimerMarkers = [
  'large language model trained by openai',
  'browse the internet or access any files',
  'browse the internet or access external resources',
  'language model trained to assist with tasks',
  'my response did not meet your expectations',
]
const input = document.querySelector('textarea')
const eol = Symbol('eol')

console.log("<<< chatGPT cleaner extension is running >>>")

widenMessages()

setInterval(collapseDisclaimers, 2000)

document.addEventListener('keydown', event => {
  if (event.altKey && event.code === 'KeyC') {
    toggleComments()
  }
})

input.addEventListener('keydown', event => {
  if (event.code === 'ArrowUp') showPreviousPrompt()
  else if (event.code === 'ArrowDown') showNextPrompt()
})

function showPreviousPrompt() {
  const allPrompts = getAllPrompts()
  const i = allPrompts.indexOf(input.value)

  if (i > 0) input.value = allPrompts[i - 1] || '' 
  else input.value = allPrompts.at(-1) || ''
}

function showNextPrompt() {
  const allPrompts = getAllPrompts()
  const i = allPrompts.indexOf(input.value)

  if (i < allPrompts.length - 1) input.value = allPrompts[i + 1] || ''
  else input.value = allPrompts[0] || ''
}

function getAllPrompts() {
  const storedPrompts = JSON.parse(localStorage.getItem('chatGPT_prompts')) || []
  const presentPrompts = getAllPresentPrompts()
  const allPrompts = [...new Set([...storedPrompts, ...presentPrompts])]

  localStorage.setItem('chatGPT_promps', JSON.stringify(allPrompts))
  
  return allPrompts
}

function getAllPresentPrompts() {
  const messages = findAllMessages()

  if (!messages) return []

  const userMessages = findMy(messages)

  return userMessages.map(msg => msg.innerText)
}

function widenMessages() {
  const style = document.createElement('style')

  style.innerHTML = `
    @media (min-width: 1280px) {
      [class^=ConversationItem__Message] {
        max-width: 70rem !important;
      }
    }
  `
  document.head.append(style)
}

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
    if (c.nextSibling.textContent.startsWith('\n')) {
      c.nextSibling.textContent = c.nextSibling.textContent.slice(1)
      c[eol] = true
    }
  }
}

function show(comments) {
  for (let c of comments) {
    c.hidden = false
    if (c[eol]) {
      if (c.nextSibling instanceof Element) c.replaceWith(c, '\n')
      else c.nextSibling.textContent = '\n' + c.nextSibling.textContent
    }
  }
}

function collapseDisclaimers() {
  const messages = findAllMessages()

  if (!messages) return

  const botMessages = findHis(messages)

  if (!botMessages) return

  const disclaimers = findDisclaimers(botMessages)

  if (!disclaimers) return

  collapse(disclaimers)
}

function findAllMessages() {
  const messages = document.querySelectorAll('div:has(+button)>div')

  return messages.length ? [...messages] : null
}

function findHis(messages) {
  const botMessages = messages.filter(msg => msg.querySelectorAll("button").length > 1)

  return botMessages.length ? botMessages : null
}

function findMy(messages) {
  const userMessages = messages.filter(msg => msg.querySelectorAll("button").length < 2)

  return userMessages.length ? userMessages : null
}

function findDisclaimers(botMessages) {
  const disclaimers = botMessages.flatMap(
    msg => [...msg.querySelectorAll('p')]
  ).filter(msg => {
    const text = msg.innerText.toLowerCase()
    return disclaimerMarkers.some(marker => text.includes(marker))
  })

  return disclaimers.length ? disclaimers : null
}

function collapse(disclaimers) {
  for (const p of disclaimers) {
    p.title = p.innerText
    p.innerText = 'POSSIBLE DISCLAIMER'
  }
}
