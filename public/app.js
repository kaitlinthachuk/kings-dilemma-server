const socket = io()
const root = document.getElementById('root')

// templates
const numberTemplate = Handlebars.compile(`
  <h2>{{title}}: {{value}}</h2>
  <input name="{{title}}" type="number" value={{value}} onChange="{{onChange}}(this.value)"/>
`)
const booleanTemplate = Handlebars.compile(`
  <h2>{{title}}: {{value}}</h2>
  <select name="{{title}}" onChange="{{onChange}}(this.value)">
    <option>Select</option>
    <option>true</option>
    <option>false</option>
  </select>
`)

const winnerTemplate = Handlebars.compile(`
  <h2>{{title}}: {{value}}</h2>
  <select name="{{title}}" onChange="{{onChange}}(this.value)">
    <option>Select</option>
    <option>Aye</option>
    <option>Nay</option>
  </select>
`)

const playerSelectTemplate = Handlebars.compile(`
  <h2>{{title}}: {{value}}</h2>
  <select name="{{title}}" onChange="{{onChange}}(this.value)">
    <option>Select</option>
    <option>tork</option>
    <option>solad</option>
    <option>tiryll</option>
    <option>crann</option>
    <option>coden</option>
  </select>
`)

const selectStateTemplate = Handlebars.compile(`
  <h2>{{title}}: {{value}}</h2>
  <select name="game-state" onChange="{{onChange}}{this.value)">
    <option>default</option>
    <option>secretAgenda</option>
    <option>voting</option>
    <option>voteOver</option>
    <option>gameOver</option>
    <option>lobby</option>
  </select>
`)

const playerTemplate = Handlebars.compile(`
  <h2>Players</h2>
  {{#each this}}
    <h3>{{house}}</h3>
      <label for="coins">Coins</label>
      <input name="coins" type="number" value={{coins}} />
      <label for="power">Power</label>
      <input name="power" type="number" value={{power}} />
      <label for="agendaTokens">Agenda Tokens</label>
      <ul>
        {{#each agendaTokens}}
          <li>type: {{type}}, resource: {{resource}}</li>
          <button onClick="deleteAgendaToken({{house}},{{type}},{{resource}})">-</button>
        {{/each}}
      </ul>
      <form onSubmit=addAgendaToken()>
      <input name="pos-neg" type="radio" checked>pos</input>
      <input mame="pos-neg" type="radio">neg</input>
      <select name="resource">
        <option>Influence</option>
        <option>Wealth</option>
        <option>Morale</option>
        <option>Welfare</option>
        <option>Knowledge</option>
      </select>
      <button>+</button>
    </form>
  {{/each}}
`)

const messageBox = Handlebars.compile(`
  <h2>Message box</h2>
  <textarea onchange="updateMessage(this.value)">{{message}}</textarea>
`)

let tempAgendaTokens = {
  "tork": { "type": "", "resource": "" },
  "solad": { "type": "", "resource": "" },
  "coden": { "type": "", "resource": "" },
  "crann": { "type": "", "resource": "" },
  "tiryll": { "type": "", "resource": "" }
}

const agendaRadioOnChange = (house, value) => {
  console.log(house, value);
  tempAgendaTokens[house].type = value
}
const selectAgendaResourceOnChange = (house, value) => {
  console.log(house, value);
  tempAgendaTokens[house].resource = value
}
const addAgendaToken = (house) => {
  console.log(house)
  socket.emit('game:setAgendaToken', house, tempAgendaTokens[house])
  tempAgendaTokens[house] = { "type": "", "resource": "" }
}
const deleteAgendaToken = (house, type, resource) => {
  socket.emit('game:removeAgendaToken', house, { "type": type, "resource": resource })
}

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
  socket.emit('game:setLeaderTie', leaderTie === 'true')
}
const updateVoteTie = (voteTie) => {
  socket.emit('game:setVoteTie', voteTie === 'true')
}
const updateBecomeMod = (becomeModAvailable) => {
  socket.emit('game:setBecomeMod', becomeModAvailable === 'true')
}
const updateWinner = (winner) => {
  socket.emit('game:setWinner', winner)
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
    console.log(state)
    const compiled = [
      playerSelectTemplate({ title: 'Turn', value: turn, onChange: 'updateTurn' }),
      playerSelectTemplate({ title: 'Leader', value: leader, onChange: 'updateLeader' }),
      playerSelectTemplate({ title: 'Moderator', value: moderator, onChange: 'updateModerator' }),
      booleanTemplate({ title: "Become Moderator Available", value: becomeModAvailable, onChange: 'updateBecomeMod' }),
      selectStateTemplate({ title: 'State', value: state }),
      numberTemplate({ title: 'Available Power', value: availablePower, onChange: 'updateAvailablePower' }),
      playerTemplate(Object.values(players)),
      messageBox({ message }),
      booleanTemplate({ title: 'Vote Tie', value: voteTie, onChange: 'updateVoteTie' }),
      booleanTemplate({ title: 'Leader Tie', value: leaderTie, onChange: 'updateLeaderTie' }),
      winnerTemplate({ title: "Winner", value: winner, onChange: 'updateWinner' })
    ]
    root.innerHTML = compiled.map(html => `<div class="card">${html}</div>`).join('')
  },
)
