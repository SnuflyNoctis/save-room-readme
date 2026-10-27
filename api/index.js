export default async function handler(req, res) {
	const username = "SnuflyNoctis";

	try {
		// Busca dados principais do teu perfil (Repositórios e Seguidores)
		const userRes = await fetch(`https://api.github.com/users/${username}`, {
			headers: { "User-Agent": "Requiem-Save-Room" },
		});
		const user = await userRes.json();

		// Busca os eventos recentes para extrair Commits e PRs
		const eventsRes = await fetch(
			`https://api.github.com/users/${username}/events/public`,
			{
				headers: { "User-Agent": "Requiem-Save-Room" },
			},
		);
		const events = await eventsRes.json();

		let recentCommit = "No recent logs found.";
		let recentPrs = 0;

		if (Array.isArray(events)) {
			// Procura a última mensagem de commit
			const pushEvent = events.find((e) => e.type === "PushEvent");
			if (pushEvent && pushEvent.payload.commits.length > 0) {
				recentCommit = pushEvent.payload.commits[0].message.split("\n")[0];
				if (recentCommit.length > 40)
					recentCommit = recentCommit.substring(0, 40) + "...";
			}

			// Conta quantos Pull Requests abriste recentemente
			recentPrs = events.filter((e) => e.type === "PullRequestEvent").length;
		}

		// Calcula o "Condition" (Status de vida de RE) baseado no número de repositórios
		let conditionText = "FINE";
		let conditionColor = "#32cd32"; // Verde
		if (user.public_repos < 10) {
			conditionText = "CAUTION";
			conditionColor = "#ffd700";
		} // Amarelo
		if (user.public_repos < 5) {
			conditionText = "DANGER";
			conditionColor = "#ff0000";
		} // Vermelho

		// Desenha o SVG animado e detalhado
		const svg = `
      <svg width="600" height="420" viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&amp;display=swap');
            
            .paper { fill: #e8dfc8; stroke: #cbbba1; stroke-width: 2; }
            .text { font-family: 'Courier Prime', 'Courier New', Courier, monospace; font-size: 14px; fill: #2c2c2c; }
            .title { font-size: 20px; font-weight: bold; fill: #9e1a1a; letter-spacing: 2px; }
            .subtitle { font-weight: bold; fill: #555; }
            
            /* Animação do Cursor a piscar (estilo máquina de escrever) */
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            .cursor { fill: #9e1a1a; animation: blink 1s step-end infinite; }
            
            /* Animação suave do papel (como se estivesse a ser inserido) */
            @keyframes slideUp {
              0% { transform: translateY(10px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            .paper-group { animation: slideUp 1.5s ease-out forwards; }
          </style>
          
          <!-- Gradientes para dar um aspeto 3D à máquina de escrever -->
          <linearGradient id="machine-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3a3a3a" />
            <stop offset="100%" stop-color="#141414" />
          </linearGradient>
          <linearGradient id="roller-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1a1a1a" />
            <stop offset="50%" stop-color="#2c2c2c" />
            <stop offset="100%" stop-color="#0a0a0a" />
          </linearGradient>
        </defs>

        <!-- FUNDO TRANSPARENTE -->
        <rect width="600" height="420" fill="#00000000" />

        <g class="paper-group">
          <!-- O PAPEL ENVELHECIDO -->
          <rect x="75" y="20" width="450" height="340" class="paper" rx="4" />
          <path d="M 75 40 Q 85 45 95 40 T 115 40" fill="none" stroke="#cbbba1" /> <!-- Detalhe de desgaste no topo -->

          <!-- CONTEÚDO DO PAPEL -->
          <text x="100" y="65" class="text title">SURVIVAL LOG / SAVE DATA</text>
          <line x1="100" y1="80" x2="500" y2="80" stroke="#9e1a1a" stroke-width="2" stroke-dasharray="8,4" />

          <!-- VITAIS E LOCALIZAÇÃO -->
          <text x="100" y="110" class="text"><tspan class="subtitle">PLAYER   :</tspan> ${user.name || username}</text>
          <text x="100" y="130" class="text"><tspan class="subtitle">LOCATION :</tspan> VCA Safehouse / Front-End Labs</text>
          <text x="100" y="150" class="text"><tspan class="subtitle">CONDITION:</tspan> <tspan fill="${conditionColor}" font-weight="bold">${conditionText}</tspan></text>

          <line x1="100" y1="165" x2="500" y2="165" stroke="#cbbba1" stroke-width="1" />

          <!-- INVENTÁRIO (SKILLS) -->
          <text x="100" y="190" class="text subtitle">[ EQUIPPED ITEMS ]</text>
          <text x="100" y="210" class="text">> React.js, TypeScript (Primary)</text>
          <text x="100" y="230" class="text">> Tailwind CSS, Three.js (Secondary)</text>

          <line x1="100" y1="245" x2="500" y2="245" stroke="#cbbba1" stroke-width="1" />

          <!-- RECORDS (STATS DO GITHUB) -->
          <text x="100" y="270" class="text subtitle">[ RECORDS ]</text>
          <text x="100" y="290" class="text">> Public Artifacts (Repos) : ${user.public_repos}</text>
          <text x="100" y="310" class="text">> Recent PRs Merged        : ${recentPrs}</text>
          <text x="100" y="330" class="text">> Allies (Followers)       : ${user.followers}</text>

          <!-- ÚLTIMO EVENTO (COM CURSOR ANIMADO) -->
          <text x="100" y="365" class="text subtitle">> LATEST LOG:</text>
          <text x="210" y="365" class="text">${recentCommit}</text>
          <!-- Cursor a piscar no fim do último commit -->
          <rect x="${210 + recentCommit.length * 8.5}" y="353" width="8" height="15" class="cursor" />
        </g>

        <!-- A MÁQUINA DE ESCREVER (Carriage / Rolo) -->
        <g transform="translate(0, 310)">
          <!-- Base traseira -->
          <rect x="40" y="30" width="520" height="70" rx="8" fill="url(#machine-grad)" stroke="#111" stroke-width="2"/>
          <!-- Rolo de borracha principal -->
          <rect x="55" y="10" width="490" height="35" rx="15" fill="url(#roller-grad)" stroke="#000" stroke-width="2"/>
          <!-- Guias de metal do papel -->
          <rect x="120" y="25" width="20" height="50" rx="3" fill="#888" stroke="#222"/>
          <rect x="460" y="25" width="20" height="50" rx="3" fill="#888" stroke="#222"/>
          <rect x="250" y="40" width="100" height="5" fill="#444" stroke="#111"/>
          <!-- Botões laterais do rolo -->
          <circle cx="50" cy="27" r="12" fill="#222" stroke="#000" stroke-width="2"/>
          <circle cx="550" cy="27" r="12" fill="#222" stroke="#000" stroke-width="2"/>
        </g>
      </svg>
    `;

		res.setHeader("Content-Type", "image/svg+xml");
		// Cache de 2 horas para evitar limites de requisição da API do GitHub
		res.setHeader("Cache-Control", "public, max-age=7200");
		res.status(200).send(svg);
	} catch (error) {
		res.status(500).send("Erro ao gerar o Save Room.");
	}
}
