
import './style.css'

const app = document.querySelector('#app')

const defaultData = {
  leagueName: 'FOXTEAM LEAGUE',
  teams: [],
  matches: []
}

let data

try {
  data = JSON.parse(localStorage.getItem('foxteam-data')) || defaultData
} catch {
  data = defaultData
}

function save() {
  localStorage.setItem('foxteam-data', JSON.stringify(data))
}

function safe(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char])
}

let currentPage = 'dashboard'

function button(label, action, extra = '') {
  return `<button class="action-btn ${extra}" data-action="${action}">${label}</button>`
}

function getTable() {
  return data.teams.map(team => {
    const played = data.matches.filter(m =>
      m.home === team.id || m.away === team.id
    )

    let wins = 0
    let draws = 0
    let losses = 0
    let scored = 0
    let conceded = 0
    let points = 0

    played.forEach(match => {
      const home = match.home === team.id
      const mine = home ? match.homeScore : match.awayScore
      const other = home ? match.awayScore : match.homeScore

      scored += mine
      conceded += other

      if (mine > other) {
        wins++
        points += 3
      } else if (mine === other) {
        draws++
        points++
      } else {
        losses++
      }
    })

    return {
      ...team,
      played: played.length,
      wins,
      draws,
      losses,
      scored,
      conceded,
      difference: scored - conceded,
      points
    }
  }).sort((a, b) =>
    b.points - a.points ||
    b.difference - a.difference ||
    b.scored - a.scored
  )
}

function dashboard() {
  return `
    <section class="welcome">
      <div>
        <span class="orange-text">OFICJALNA PLATFORMA ROZGRYWEK</span>
        <h2>RYWALIZACJA.<br>EMOCJE. ZWYCIĘSTWO.</h2>
        <p>Witaj w ${safe(data.leagueName)}!</p>
      </div>
      <img src="/foxteam-logo.png" alt="FoxTeam">
    </section>

    <div class="section-heading">
      <h2>STATYSTYKI LIGI</h2>
      <span>SEZON 2026</span>
    </div>

    <section class="stats">
      <div class="stat-card">
        <span>DRUŻYNY</span>
        <strong>${data.teams.length}</strong>
        <small>Zarejestrowane zespoły</small>
      </div>
      <div class="stat-card">
        <span>MECZE</span>
        <strong>${data.matches.length}</strong>
        <small>Wyniki spotkań</small>
      </div>
      <div class="stat-card">
        <span>ROZEGRANE SPOTKANIA</span>
        <strong>${data.matches.length}</strong>
        <small>Wprowadzone wyniki</small>
      </div>
      <div class="stat-card">
        <span>LIDER LIGI</span>
        <strong class="leader-number">${safe(getTable()[0]?.name || '—')}</strong>
        <small>Aktualnie pierwsze miejsce</small>
      </div>
    </section>

    <section class="panel main-panel">
      <div class="panel-heading">
        <h3>OSTATNIE WYNIKI</h3>
        <span>FOXTEAM</span>
      </div>
      ${data.matches.length ? data.matches.slice().reverse().slice(0, 5).map(match => `
        <div class="match-row">
          <span>${safe(data.teams.find(t => t.id === match.home)?.name || '?')}</span>
          <strong>${match.homeScore} : ${match.awayScore}</strong>
          <span>${safe(data.teams.find(t => t.id === match.away)?.name || '?')}</span>
        </div>
      `).join('') : '<p class="empty-message">Nie dodano jeszcze żadnych meczów.</p>'}
    </section>
  `
}

function teamsPage() {
  return `
    <section class="panel main-panel">
      <div class="panel-heading">
        <h3>DODAJ DRUŻYNĘ</h3>
        <span>ZARZĄDZANIE</span>
      </div>

      <form id="team-form" class="data-form">
        <input name="name" placeholder="Nazwa drużyny" maxlength="35" required>
        <button class="action-btn" type="submit">+ DODAJ DRUŻYNĘ</button>
      </form>
    </section>

    <section class="panel main-panel">
      <div class="panel-heading">
        <h3>LISTA DRUŻYN</h3>
        <span>${data.teams.length} ZESPOŁÓW</span>
      </div>

      ${data.teams.length ? data.teams.map((team, index) => `
        <div class="team-row">
          <div class="team-number">${String(index + 1).padStart(2, '0')}</div>
          <div class="team-info">
            <strong>${safe(team.name)}</strong>
            <small>FOXTEAM LEAGUE</small>
          </div>
          ${button('USUŃ', `delete-team:${team.id}`, 'danger-btn')}
        </div>
      `).join('') : '<p class="empty-message">Nie ma jeszcze żadnych drużyn. Dodaj pierwszą drużynę powyżej.</p>'}
    </section>
  `
}

function matchesPage() {
  const options = data.teams.map(team =>
    `<option value="${team.id}">${safe(team.name)}</option>`
  ).join('')

  return `
    <section class="panel main-panel">
      <div class="panel-heading">
        <h3>DODAJ WYNIK MECZU</h3>
        <span>NOWE SPOTKANIE</span>
      </div>

      ${data.teams.length < 2 ? `
        <p class="empty-message">Najpierw dodaj minimum dwie drużyny.</p>
      ` : `
        <form id="match-form" class="data-form">
          <label>Gospodarz
            <select name="home" required>
              <option value="">Wybierz drużynę</option>
              ${options}
            </select>
          </label>

          <label>Gość
            <select name="away" required>
              <option value="">Wybierz drużynę</option>
              ${options}
            </select>
          </label>

          <label>Wynik gospodarzy
            <input type="number" name="homeScore" min="0" max="99" placeholder="0" required>
          </label>

          <label>Wynik gości
            <input type="number" name="awayScore" min="0" max="99" placeholder="0" required>
          </label>

          <label>Data meczu
            <input type="date" name="date" required>
          </label>

          <button class="action-btn" type="submit">+ ZAPISZ WYNIK</button>
        </form>
      `}
    </section>

    <section class="panel main-panel">
      <div class="panel-heading">
        <h3>ROZEGRANE MECZE</h3>
        <span>${data.matches.length} SPOTKAŃ</span>
      </div>

      ${data.matches.length ? data.matches.slice().reverse().map(match => `
        <div class="match-row">
          <span>${safe(data.teams.find(t => t.id === match.home)?.name || '?')}</span>
          <strong>${match.homeScore} : ${match.awayScore}</strong>
          <span>${safe(data.teams.find(t => t.id === match.away)?.name || '?')}</span>
          <small>${safe(match.date)}</small>
          ${button('USUŃ', `delete-match:${match.id}`, 'danger-btn')}
        </div>
      `).join('') : '<p class="empty-message">Nie dodano jeszcze wyników.</p>'}
    </section>
  `
}

function tablePage() {
  const rows = getTable()

  return `
    <section class="panel main-panel">
      <div class="panel-heading">
        <h3>TABELA LIGOWA</h3>
        <span>FOXTEAM LEAGUE</span>
      </div>

      <div class="table-scroll">
        <table class="league-table">
          <thead>
            <tr>
              <th>#</th>
              <th>DRUŻYNA</th>
              <th>M</th>
              <th>W</th>
              <th>R</th>
              <th>P</th>
              <th>BILANS</th>
              <th>PKT</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((team, index) => `
              <tr>
                <td class="rank">${index + 1}</td>
                <td class="team-name">${safe(team.name)}</td>
                <td>${team.played}</td>
                <td>${team.wins}</td>
                <td>${team.draws}</td>
                <td>${team.losses}</td>
                <td>${team.scored}:${team.conceded}</td>
                <td class="points">${team.points}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <p class="table-note">Zwycięstwo: 3 pkt · Remis: 1 pkt · Porażka: 0 pkt</p>
    </section>
  `
}

function adminPage() {
  return `
    <section class="panel main-panel">
      <div class="panel-heading">
        <h3>USTAWIENIA LIGI</h3>
        <span>ADMINISTRACJA</span>
      </div>

      <form id="settings-form" class="data-form">
        <label>Nazwa ligi
          <input name="leagueName" value="${safe(data.leagueName)}" maxlength="50" required>
        </label>
        <button class="action-btn" type="submit">ZAPISZ USTAWIENIA</button>
      </form>
    </section>

    <section class="panel main-panel">
      <div class="panel-heading">
        <h3>ZARZĄDZANIE DANYMI</h3>
        <span>UWAGA</span>
      </div>
      <p class="empty-message">Tutaj możesz wyczyścić wszystkie drużyny i wyniki. Tej operacji nie można cofnąć.</p>
      ${button('USUŃ WSZYSTKIE DANE LIGI', 'reset-data', 'danger-btn')}
    </section>

    <section class="panel main-panel">
      <div class="panel-heading">
        <h3>INFORMACJE</h3>
      </div>
      <p class="empty-message">Dane tej wersji strony są zapisywane lokalnie w przeglądarce na tym komputerze. Panel nie ma jeszcze prawdziwego logowania ani wspólnej bazy danych.</p>
    </section>
  `
}

function render() {
  const pages = {
    dashboard,
    teams: teamsPage,
    matches: matchesPage,
    table: tablePage,
    admin: adminPage
  }

  const titles = {
    dashboard: 'Dashboard',
    teams: 'Drużyny',
    matches: 'Mecze',
    table: 'Tabela ligowa',
    admin: 'Administracja'
  }

  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">
          <img src="/foxteam-logo.png" alt="FoxTeam">
          <div>
            <h2>FOXTEAM</h2>
            <span>COUNTER-STRIKE 2</span>
          </div>
        </div>

        <div class="menu-title">MENU GŁÓWNE</div>
        <nav>
          ${Object.entries(titles).map(([key, title]) => `
            <button class="nav-btn ${currentPage === key ? 'active' : ''}" data-page="${key}">
              ${title}
            </button>
          `).join('')}
        </nav>

        <div class="sidebar-bottom">
          <div class="version">FOXTEAM LEAGUE · v1.0</div>
        </div>
      </aside>

      <main class="content">
        <header>
          <div>
            <span class="overline">OFICJALNA STRONA LIGI</span>
            <h1>${titles[currentPage]}</h1>
          </div>
          <div class="status"><span></span> PANEL LIGI</div>
        </header>

        ${pages[currentPage]()}

        <footer>© 2026 FOXTEAM LEAGUE · ALL RIGHTS RESERVED</footer>
      </main>
    </div>
  `
}

app.addEventListener('click', event => {
  const nav = event.target.closest('[data-page]')

  if (nav) {
    currentPage = nav.dataset.page
    render()
    return
  }

  const actionButton = event.target.closest('[data-action]')
  if (!actionButton) return

  const [action, id] = actionButton.dataset.action.split(':')

  if (action === 'delete-team') {
    if (!confirm('Usunąć drużynę? Jej mecze również zostaną usunięte.')) return

    data.teams = data.teams.filter(team => team.id !== id)
    data.matches = data.matches.filter(match =>
      match.home !== id && match.away !== id
    )
  }

  if (action === 'delete-match') {
    if (!confirm('Usunąć ten wynik meczu?')) return
    data.matches = data.matches.filter(match => match.id !== id)
  }

  if (action === 'reset-data') {
    if (!confirm('Na pewno usunąć WSZYSTKIE drużyny i wyniki?')) return
    data.teams = []
    data.matches = []
  }

  save()
  render()
})

app.addEventListener('submit', event => {
  event.preventDefault()
  const form = event.target
  const values = Object.fromEntries(new FormData(form))

  if (form.id === 'team-form') {
    const name = values.name.trim()

    if (data.teams.some(team => team.name.toLowerCase() === name.toLowerCase())) {
      alert('Taka drużyna już istnieje!')
      return
    }

    data.teams.push({
      id: crypto.randomUUID(),
      name
    })
  }

  if (form.id === 'match-form') {
    const homeScore = Number(values.homeScore)
    const awayScore = Number(values.awayScore)

    if (values.home === values.away) {
      alert('Wybierz dwie różne drużyny!')
      return
    }

    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) ||
        homeScore < 0 || awayScore < 0 || homeScore > 99 || awayScore > 99) {
      alert('Podaj prawidłowy wynik!')
      return
    }

    data.matches.push({
      id: crypto.randomUUID(),
      home: values.home,
      away: values.away,
      homeScore,
      awayScore,
      date: values.date
    })
  }

  if (form.id === 'settings-form') {
    data.leagueName = values.leagueName.trim()
  }

  save()
  render()
})

render()

