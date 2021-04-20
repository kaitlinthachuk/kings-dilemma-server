const socket = io()
const root = document.getElementById('root')

// helpers
// https://stackoverflow.com/a/15373215
Handlebars.registerHelper('select', (value, options) => {
  console.log({ value })
  const selectElem = document.createElement('select')
  selectElem.innerHTML = options.fn(this)
  selectElem.value = value
  console.log(selectElem.children)
  selectElem.children[selectElem.selectedIndex].setAttribute('selected', '')
  return selectElem.innerHTML
})

// templates
const numberTemplate = Handlebars.compile(`
  <h2>{{title}}: {{value}}</h2>
  <input name="{{title}}" type="number" value={{value}} onChange="{{onChange}}(this.value)"/>
`)

const booleanTemplate = Handlebars.compile(`
  <h2>{{title}}: {{value}}</h2>
  <input type="checkbox" onChange="{{onChange}}(this.checked)" {{#if value}}checked{{/if}}>
`)

const winnerTemplate = Handlebars.compile(`
  <h2>{{title}}: {{value}}</h2>
  <select name="{{title}}" onChange="{{onChange}}(this.value)">
    {{#select value}}
    <option value="">-</option>
    <option>aye</option>
    <option>nay</option>
    {{/select}}
  </select>
`)

const playerSelectTemplate = Handlebars.compile(`
  <h2>{{title}}: {{value}}</h2>
  <select name="{{title}}" onChange="{{onChange}}(this.value)">
    {{#select value}}
    <option value="">-</option>
    <option>tork</option>
    <option>solad</option>
    <option>tiryll</option>
    <option>crann</option>
    <option>coden</option>
    {{/select}}
  </select>
`)

const selectStateTemplate = Handlebars.compile(`
  <h2>{{title}}: {{value}}</h2>
  <select name="game-state" onChange="{{onChange}}(this.value)">
    {{#select value}}
    <option>default</option>
    <option>secretAgenda</option>
    <option>voting</option>
    <option>voteOver</option>
    <option>gameOver</option>
    <option>lobby</option>
    {{/select}}
  </select>
`)

const playerTemplate = Handlebars.compile(`
  <h2>Players</h2>
  {{#each this}}
    <div id="{{house}}">
      <h3>{{house}}</h3>
      <label for="coins">Coins</label>
      <input name="coins" type="number" value={{coins}} />
      <label for="power">Power</label>
      <input name="power" type="number" value={{power}} />
      <ul>
        {{#each agendaTokens}}
          <li>
            <span>type: {{type}}, resource: {{resource}}</span>
            <button onClick="removeAgendaToken('{{../house}}', '{{type}}', '{{resource}}')">-</button>
          </li>
        {{/each}}
      </ul>
      <form onsubmit="addAgendaToken('{{house}}'); return false">
        <input id="{{house}}-pos" name="posneg" value="pos" type="radio" checked>
        <label for="{{house}}-pos">pos</label>
        <input id="{{house}}-neg" name="posneg" value="neg" type="radio">
        <label for="{{house}}-neg">neg</label>
        <select name="resource">
          <option>Influence</option>
          <option>Wealth</option>
          <option>Morale</option>
          <option>Welfare</option>
          <option>Knowledge</option>
        </select>
        <input type="submit" value="+">
      </form>
    </div>
  {{/each}}
`)

const messageBox = Handlebars.compile(`
  <h2>Message box</h2>
  <textarea onchange="updateMessage(this.value)">{{message}}</textarea>
`)

// handlers
const updateMessage = (message) => {
  socket.emit('game:setMessage', message)
}
const updateTurn = (playerName) => {
  socket.emit('game:setTurn', playerName)
}
const updateLeader = (playerName) => {
  socket.emit('game:setLeader', playerName)
}
const updateModerator = (playerName) => {
  socket.emit('game:setModerator', playerName)
}
const updateState = (state) => {
  socket.emit('game:setState', state)
}
const updateAvailablePower = (power) => {
  socket.emit('game:setAvailablePower', power)
}
const updateLeaderTie = (leaderTie) => {
  socket.emit('game:setLeaderTie', leaderTie)
}
const updateVoteTie = (voteTie) => {
  socket.emit('game:setVoteTie', voteTie)
}
const updateBecomeMod = (becomeModAvailable) => {
  console.log(becomeModAvailable)
  socket.emit('game:setBecomeMod', becomeModAvailable)
}
const updateWinner = (winner) => {
  socket.emit('game:setWinner', winner)
}
const addAgendaToken = (player) => {
  const formElem = document.querySelector(`#${player} > form`)
  const formData = new FormData(formElem)
  socket.emit('game:setAgendaToken', player, {
    type: formData.get('posneg'),
    resource: formData.get('resource'),
  })
}
const removeAgendaToken = (player, type, resource) => {
  socket.emit('game:removeAgendaToken', player, { type, resource })
}

// get game state on joining
socket.emit('game:getState')
socket.on(
  'game:state',
  ({
    turn,
    leader,
    moderator,
    state,
    players,
    turnOrder,
    availablePower,
    votes,
    ayeOutcomes,
    nayOutcomes,
    leaderTie,
    leaderChoice,
    becomeModAvailable,
    voteTie,
    winner,
    message,
  }) => {
    const compiled = [
      playerSelectTemplate({
        title: 'Turn',
        value: turn,
        onChange: 'updateTurn',
      }),
      playerSelectTemplate({
        title: 'Leader',
        value: leader,
        onChange: 'updateLeader',
      }),
      playerSelectTemplate({
        title: 'Moderator',
        value: moderator,
        onChange: 'updateModerator',
      }),
      booleanTemplate({
        title: 'Become Moderator Available',
        value: becomeModAvailable,
        onChange: 'updateBecomeMod',
      }),
      selectStateTemplate({ title: 'State', value: state }),
      numberTemplate({
        title: 'Available Power',
        value: availablePower,
        onChange: 'updateAvailablePower',
      }),
      playerTemplate(Object.values(players)),
      messageBox({ message }),
      booleanTemplate({
        title: 'Vote Tie',
        value: voteTie,
        onChange: 'updateVoteTie',
      }),
      booleanTemplate({
        title: 'Leader Tie',
        value: leaderTie,
        onChange: 'updateLeaderTie',
      }),
      winnerTemplate({
        title: 'Winner',
        value: winner,
        onChange: 'updateWinner',
      }),
    ]
    root.innerHTML = compiled
      .map((html) => `<div class="card">${html}</div>`)
      .join('')
  },
)
