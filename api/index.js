export default async function handler(req, res) {
	const username = "SnuflyNoctis";

	try {
		// Busca os teus dados no GitHub
		const userRes = await fetch(`https://api.github.com/users/${username}`, {
			headers: { "User-Agent": "FF-Menu-SVG" },
		});
		const user = await userRes.json();

		const eventsRes = await fetch(
			`https://api.github.com/users/${username}/events/public`,
			{ headers: { "User-Agent": "FF-Menu-SVG" } },
		);
		const events = await eventsRes.json();

		// Extrai o último commit
		let recentCommit = "A explorar o mapa...";
		if (Array.isArray(events)) {
			const pushEvent = events.find((e) => e.type === "PushEvent");
			if (pushEvent && pushEvent.payload.commits.length > 0) {
				recentCommit = pushEvent.payload.commits[0].message.split("\n")[0];
				if (recentCommit.length > 55)
					recentCommit = recentCommit.substring(0, 55) + "...";
			}
		}

		// Sistema de RPG: Calcula o Level e EXP com base nos repositórios e seguidores
		const repos = user.public_repos || 0;
		const followers = user.followers || 0;
		const totalXP = repos * 150 + followers * 50;
		const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;

		// HP e MP simulados com base nas estatísticas
		const currentHP = 1500 + repos * 50;
		const maxHP = 9999;
		const currentMP = 100 + followers * 10;
		const maxMP = 999;

		const hpPercent = Math.min((currentHP / maxHP) * 100, 100);
		const mpPercent = Math.min((currentMP / maxMP) * 100, 100);

		// O Layout do Menu em SVG
		const svg = `
      <svg width="800" height="420" viewBox="0 0 800 420" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;600&amp;family=VT323&amp;display=swap');
            
            .text-main { font-family: 'Arial', sans-serif; font-size: 16px; fill: #ffffff; text-shadow: 1px 1px 2px #000000; }
            .text-title { font-family: 'Arial', sans-serif; font-size: 24px; font-weight: bold; fill: #ffffff; text-shadow: 2px 2px 2px #000000; letter-spacing: 1px; }
            .text-label { fill: #a5c2f5; font-weight: bold; }
            .text-value { fill: #ffffff; }
            .text-highlight { fill: #f5d061; font-weight: bold; } /* Amarelo clássico de FF */
            
            .box-bg { fill: url(#ff-bg); stroke: #ffffff; stroke-width: 3; rx: 8; }
            .box-inner { fill: none; stroke: #a5c2f5; stroke-width: 1; rx: 6; }
            
            @keyframes pulse {
              0% { opacity: 0.8; }
              50% { opacity: 1; filter: brightness(1.2); }
              100% { opacity: 0.8; }
            }
            .bar-fill-hp { fill: linear-gradient(90deg, #2ecc71, #27ae60); animation: pulse 3s infinite; }
            .bar-fill-mp { fill: linear-gradient(90deg, #3498db, #2980b9); animation: pulse 3s infinite; }
          </style>

          <linearGradient id="ff-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#000033" />
            <stop offset="50%" stop-color="#000088" />
            <stop offset="100%" stop-color="#000044" />
          </linearGradient>

          <linearGradient id="hp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#2ecc71" />
            <stop offset="100%" stop-color="#1abc9c" />
          </linearGradient>

          <linearGradient id="mp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3498db" />
            <stop offset="100%" stop-color="#9b59b6" />
          </linearGradient>
        </defs>

        <!-- FUNDO TRANSPARENTE -->
        <rect width="800" height="420" fill="#00000000" />

        <!-- ========================================== -->
        <!-- CAIXA ESQUERDA: STATUS DO PERSONAGEM       -->
        <!-- ========================================== -->
        <g transform="translate(10, 10)">
          <rect width="380" height="250" class="box-bg" />
          <rect x="3" y="3" width="374" height="244" class="box-inner" />
          
          <text x="25" y="45" class="text-title">João Victor</text>
          <text x="25" y="75" class="text-main"><tspan class="text-label">LV</tspan>  <tspan class="text-highlight">${level}</tspan></text>
          <text x="120" y="75" class="text-main"><tspan class="text-label">CLASS:</tspan> Front-End Dev</text>

          <!-- Barra de HP -->
          <text x="25" y="120" class="text-main text-label">HP</text>
          <text x="240" y="120" class="text-main text-value">${currentHP} / ${maxHP}</text>
          <rect x="60" y="108" width="160" height="12" fill="#222" rx="6" />
          <rect x="60" y="108" width="${(160 * hpPercent) / 100}" height="12" fill="url(#hp-grad)" rx="6" class="bar-fill-hp" />

          <!-- Barra de MP -->
          <text x="25" y="150" class="text-main text-label">MP</text>
          <text x="240" y="150" class="text-main text-value">${currentMP} / ${maxMP}</text>
          <rect x="60" y="138" width="160" height="12" fill="#222" rx="6" />
          <rect x="60" y="138" width="${(160 * mpPercent) / 100}" height="12" fill="url(#mp-grad)" rx="6" class="bar-fill-mp" />

          <!-- EXP -->
          <text x="25" y="190" class="text-main"><tspan class="text-label">EXP:</tspan> ${totalXP}</text>
          <text x="25" y="220" class="text-main"><tspan class="text-label">NEXT LVL:</tspan> ${Math.pow(level, 2) * 100}</text>
        </g>

        <!-- ========================================== -->
        <!-- CAIXA DIREITA: EQUIPAMENTOS (TECH STACK)   -->
        <!-- ========================================== -->
        <g transform="translate(405, 10)">
          <rect width="385" height="250" class="box-bg" />
          <rect x="3" y="3" width="379" height="244" class="box-inner" />
          
          <text x="25" y="40" class="text-main text-highlight">EQUIPMENT</text>
          
          <!-- Ícones simulados e Textos -->
          <text x="25" y="80" class="text-main"><tspan class="text-label">R-Hand:</tspan> React 19 &amp; TypeScript</text>
          <text x="25" y="120" class="text-main"><tspan class="text-label">L-Hand:</tspan> Tailwind CSS v4</text>
          <text x="25" y="160" class="text-main"><tspan class="text-label">Armor :</tspan> Three.js &amp; Framer Motion</text>
          <text x="25" y="200" class="text-main"><tspan class="text-label">Relic :</tspan> Bun, Vite &amp; Biome</text>
          <text x="25" y="240" class="text-main"><tspan class="text-label">Mount :</tspan> VS Code Terminal</text>
        </g>

        <!-- ========================================== -->
        <!-- CAIXA INFERIOR: LOCALIZAÇÃO E ÚLTIMA AÇÃO  -->
        <!-- ========================================== -->
        <g transform="translate(10, 275)">
          <rect width="780" height="135" class="box-bg" />
          <rect x="3" y="3" width="774" height="129" class="box-inner" />
          
          <text x="25" y="35" class="text-main"><tspan class="text-label">LOCATION:</tspan> Vitória da Conquista / Futuro Construções</text>
          <line x1="25" y1="50" x2="755" y2="50" stroke="#a5c2f5" stroke-width="1" stroke-dasharray="4,4" />
          
          <text x="25" y="80" class="text-main text-highlight">LATEST SYSTEM LOG:</text>
          <text x="25" y="110" class="text-main text-value">❯ ${recentCommit}</text>
        </g>
      </svg>
    `;

		res.setHeader("Content-Type", "image/svg+xml");
		res.setHeader("Cache-Control", "public, max-age=7200");
		res.status(200).send(svg);
	} catch (error) {
		res.status(500).send("Erro ao gerar o Menu Final Fantasy.");
	}
}
