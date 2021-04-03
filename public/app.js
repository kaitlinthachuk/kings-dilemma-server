const socket = io()
const root = document.getElementById('root')

// templates
const numberTemplate = Handlebars.compile(`
  <label for="{{title}}">{{title}}</label>
  <input name="{{title}}" type="number" value={{value}} />
`)

const playerSelectTemplate = Handlebars.compile(`
  <p>Current value: {{value}}</p>
  <label for="{{title}}">{{title}}</label>
  <select name="{{title}}">
    <option>tork</option>
    <option>solad</option>
    <option>tiryll</option>
    <option>crann</option>
    <option>coden</option>
  </select>
`)

const selectStateTemplate = Handlebars.compile(`
  <p>Current value: {{this}}</p>
  <select name="game-state">
    <option>default</option>
    <option>secretAgenda</option>
    <option>voting</option>
    <option>voteOver</option>
    <option>gameOver</option>
    <option>lobby</option>
  </select>
`)

const playerTemplate = Handlebars.compile(`
  {{#each this}}
    <h2>{{house}}</h2>
    <form>
      <label for="coins">Coins</label>
      <input name="coins" type="number" value={{coins}} />
      <label for="power">Power</label>
      <input name="power" type="number" value={{power}} />
      <label for="agendaTokens">Agenda Tokens</label>
      <ul>
        {{#each agendaTokens}}
          <li>type: {{type}}, resource: {{resource}}</li>
          <button>-</button>
        {{/each}}
      </ul>
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
    voteTie,
    winner,
  }) => {
    const compiled = [
      playerSelectTemplate({ title: 'Turn', value: turn }),
      playerSelectTemplate({ title: 'Leader', value: leader}),
      playerSelectTemplate({ title: 'Moderator', value: moderator}),
      selectStateTemplate(state),
      numberTemplate({title: 'Available Power', value: availablePower}),
      playerTemplate(Object.values(players)),
    ]
    root.innerHTML = compiled.map(html => `<div>${html}</div>`).join('')
  },
)
