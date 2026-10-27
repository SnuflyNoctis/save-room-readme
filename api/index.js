export default async function handler(req, res) {
	const username = "SnuflyNoctis";

	try {
		const userRes = await fetch(`https://api.github.com/users/${username}`, {
			headers: { "User-Agent": "Requiem-Save-Room" },
		});
		const user = await userRes.json();

		const eventsRes = await fetch(
			`https://api.github.com/users/${username}/events/public`,
			{ headers: { "User-Agent": "Requiem-Save-Room" } },
		);
		const events = await eventsRes.json();

		let recentCommit = "No recent logs found.";
		let recentPrs = 0;

		if (Array.isArray(events)) {
			const pushEvent = events.find((e) => e.type === "PushEvent");
			if (pushEvent && pushEvent.payload.commits.length > 0) {
				recentCommit = pushEvent.payload.commits[0].message.split("\n")[0];
				if (recentCommit.length > 35)
					recentCommit = recentCommit.substring(0, 35) + "...";
			}
			recentPrs = events.filter((e) => e.type === "PullRequestEvent").length;
		}

		// Status baseado em Repositórios (Simulação de vida)
		let conditionText = "FINE";
		let conditionColor = "#32cd32"; // Verde clássico do RE
		if (user.public_repos < 10) {
			conditionText = "CAUTION";
			conditionColor = "#e6cc00";
		}
		if (user.public_repos < 5) {
			conditionText = "DANGER";
			conditionColor = "#cc0000";
		}

		const svg = `
      <svg width="600" height="420" viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&amp;display=swap');
            .paper { fill: #e8dfc8; stroke: #cbbba1; stroke-width: 2; }
            .text { font-family: 'Courier Prime', 'Courier New', Courier, monospace; font-size: 13px; fill: #2a2a2a; }
            .title { font-size: 22px; font-weight: bold; fill: #8b0000; letter-spacing: 1px; }
            .subtitle { font-weight: bold; fill: #555; }
            
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            .cursor { fill: #8b0000; animation: blink 1s step-end infinite; }
            
            @keyframes ecgBeat { 
              0% { stroke-dashoffset: 60; } 
              50%, 100% { stroke-dashoffset: 0; } 
            }
            .ecg-line { 
              fill: none; stroke: ${conditionColor}; stroke-width: 2; 
              stroke-dasharray: 60; animation: ecgBeat 1.5s linear infinite; 
            }
          </style>
          
          <linearGradient id="machine-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#2a2a2a" />
            <stop offset="100%" stop-color="#0f0f0f" />
          </linearGradient>
        </defs>

        <rect width="600" height="420" fill="#00000000" />

        <g>
          <!-- Papel com manchas de uso -->
          <rect x="85" y="10" width="430" height="350" class="paper" rx="2" />
          
          <!-- Cabeçalho -->
          <text x="110" y="45" class="text title">UMBRELLA // R&amp;D TERMINAL</text>
          <line x1="110" y1="55" x2="490" y2="55" stroke="#8b0000" stroke-width="2" stroke-dasharray="4,4" />

          <!-- Informações de Perfil -->
          <text x="110" y="80" class="text"><tspan class="subtitle">ID        :</tspan> ${user.name || username}</text>
          <text x="110" y="100" class="text"><tspan class="subtitle">LOCATION  :</tspan> Futuro Construções Labs</text>
          
          <!-- Linha ECG Animada + Condição -->
          <text x="110" y="120" class="text"><tspan class="subtitle">CONDITION :</tspan> <tspan fill="${conditionColor}" font-weight="bold">${conditionText}</tspan></text>
          <path d="M 230 115 L 240 115 L 245 105 L 250 125 L 255 115 L 270 115" class="ecg-line" />

          <line x1="110" y1="135" x2="490" y2="135" stroke="#cbbba1" stroke-width="1" />

          <!-- Equipamentos Modernos -->
          <text x="110" y="155" class="text subtitle">[ EQUIPPED ARSENAL ]</text>
          <text x="110" y="175" class="text">> UI  : React.js, Tailwind CSS, Shadcn</text>
          <text x="110" y="195" class="text">> ENG : TypeScript, Bun, Vite</text>
          <text x="110" y="215" class="text">> 3D  : Three.js, Framer Motion</text>

          <line x1="110" y1="230" x2="490" y2="230" stroke="#cbbba1" stroke-width="1" />

          <!-- Estatísticas -->
          <text x="110" y="250" class="text subtitle">[ TERMINAL STATS ]</text>
          <text x="110" y="270" class="text">> Total Research Files (Repos): ${user.public_repos}</text>
          <text x="110" y="290" class="text">> Lab Collaborators (Followers): ${user.followers}</text>

          <!-- Última Ação com Cursor -->
          <text x="110" y="320" class="text subtitle">> RECENT CODE LOG:</text>
          <text x="110" y="340" class="text">${recentCommit}</text>
          <rect x="${110 + recentCommit.length * 7.8}" y="328" width="8" height="14" class="cursor" />
        </g>

        <!-- MÁQUINA DE ESCREVER -->
        <g transform="translate(0, 340)">
          <rect x="50" y="20" width="500" height="60" rx="6" fill="url(#machine-grad)" stroke="#111" stroke-width="2"/>
          <!-- Rolo de Borracha -->
          <rect x="65" y="0" width="470" height="30" rx="10" fill="#1a1a1a" stroke="#000" stroke-width="2"/>
          <!-- Fixadores -->
          <rect x="130" y="15" width="15" height="40" rx="2" fill="#555" stroke="#222"/>
          <rect x="450" y="15" width="15" height="40" rx="2" fill="#555" stroke="#222"/>
          <rect x="250" y="25" width="100" height="5" fill="#333" stroke="#000"/>
        </g>
      </svg>
    `;

		res.setHeader("Content-Type", "image/svg+xml");
		res.setHeader("Cache-Control", "public, max-age=7200");
		res.status(200).send(svg);
	} catch (error) {
		res.status(500).send("Erro ao gerar o Save Room.");
	}
}
