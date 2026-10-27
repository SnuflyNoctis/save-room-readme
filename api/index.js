export default async function handler(req, res) {
	const username = "SnuflyNoctis";

	try {
		const userRes = await fetch(`https://api.github.com/users/${username}`, {
			headers: { "User-Agent": "RPD-Status-Menu" },
		});
		const user = await userRes.json();

		const reposRes = await fetch(
			`https://api.github.com/users/${username}/repos?per_page=100`,
			{ headers: { "User-Agent": "RPD-Status-Menu" } },
		);
		const reposData = await reposRes.json();
		const totalStars = Array.isArray(reposData)
			? reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0)
			: 0;

		const eventsRes = await fetch(
			`https://api.github.com/users/${username}/events/public`,
			{ headers: { "User-Agent": "RPD-Status-Menu" } },
		);
		const events = await eventsRes.json();

		let recentCommitsCount = 0;
		let recentPrsCount = 0;
		let currentQuest = "REACH THE R.P.D.";

		if (Array.isArray(events)) {
			events.forEach((e) => {
				if (e.type === "PushEvent")
					recentCommitsCount += e.payload.commits.length;
				if (e.type === "PullRequestEvent") recentPrsCount += 1;
			});
			const push = events.find((e) => e.type === "PushEvent");
			if (push && push.payload.commits.length > 0) {
				currentQuest = push.payload.commits[0].message
					.split("\n")[0]
					.toUpperCase();
				if (currentQuest.length > 22)
					currentQuest = currentQuest.substring(0, 22) + "...";
			}
		}

		const repos = user.public_repos || 0;
		const followers = user.followers || 0;
		const level = Math.floor(Math.sqrt(repos * 50 + followers * 20)) + 10;
		const pesetas =
			repos * 1500 + followers * 5000 + totalStars * 10000 + 42500;

		const svg = `
      <svg width="850" height="480" viewBox="0 0 850 480" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&amp;family=Courier+Prime&amp;display=swap');
            
            .title { font-family: 'Cinzel', Palatino, serif; font-size: 14px; font-weight: bold; fill: #b89c72; letter-spacing: 2px; }
            .value { font-family: 'Cinzel', Palatino, serif; font-size: 14px; fill: #e0e0e0; }
            .pesetas-text { font-family: 'Cinzel', Palatino, serif; font-size: 28px; fill: #d4af37; text-shadow: 2px 2px 4px #000; }
            .quest-text { font-family: 'Courier Prime', monospace; font-size: 11px; fill: #e0e0e0; }
            
            /* Painéis mais escuros para garantir leitura sobre a imagem clara */
            .panel { fill: rgba(10, 10, 15, 0.85); stroke: #3a2e21; stroke-width: 1.5; }
            .divider { stroke: #3a2e21; stroke-width: 1; stroke-dasharray: 4 2; }
            
            /* Animação de entrada da UI */
            @keyframes slideIn {
              0% { opacity: 0; transform: translateY(15px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .anim-panel { animation: slideIn 1s ease-out forwards; opacity: 0; }
            .delay-1 { animation-delay: 0.2s; }
            .delay-2 { animation-delay: 0.4s; }
            .delay-3 { animation-delay: 0.6s; }
            
            /* Animações Atmosféricas sobre a imagem */
            @keyframes fogMove {
              0% { transform: translateX(-100px); opacity: 0.2; }
              50% { opacity: 0.4; }
              100% { transform: translateX(100px); opacity: 0.2; }
            }
            .fog { fill: #88929e; filter: blur(30px); animation: fogMove 12s alternate infinite ease-in-out; }
            
            @keyframes flicker {
              0%, 100% { opacity: 0.1; }
              5%, 95% { opacity: 0.2; }
              10%, 90% { opacity: 0.15; }
              50% { opacity: 0.4; }
            }
            .ambient-light { fill: #34495e; animation: flicker 6s infinite; mix-blend-mode: overlay; }
          </style>
        </defs>

        <!-- 1. BACKGROUND (SUA IMAGEM BASE64 AQUI) -->
        <!-- Substitua o texto 'COLE_O_SEU_BASE64_AQUI' pelo código da sua imagem gerada -->
        <image href="COLE_O_SEU_BASE64_AQUI" x="0" y="0" width="850" height="480" preserveAspectRatio="xMidYMid slice" />

        <!-- 2. EFEITOS ATMOSFÉRICOS (Fumaça e Luz ambiente) -->
        <rect width="850" height="480" class="ambient-light" />
        <ellipse cx="200" cy="350" rx="400" ry="150" class="fog" />
        <ellipse cx="650" cy="200" rx="350" ry="120" class="fog" style="animation-delay: -6s;" />

        <!-- 3. INTERFACE DE USUÁRIO (Enquadrando o centro) -->
        
        <!-- STATUS (Topo Esquerda) -->
        <g transform="translate(20, 20)">
          <g class="anim-panel">
            <rect width="280" height="210" class="panel" rx="4" />
            <text x="20" y="35" class="title">STATUS</text>
            <line x1="20" y1="45" x2="260" y2="45" class="divider" />
            
            <text x="20" y="75" class="title">LEVEL</text>      <text x="260" y="75" class="value" text-anchor="end">${level}</text>
            <text x="20" y="100" class="title">COMMITS</text>    <text x="260" y="100" class="value" text-anchor="end">${recentCommitsCount} (Recent)</text>
            <text x="20" y="125" class="title">PULL REQs</text>  <text x="260" y="125" class="value" text-anchor="end">${recentPrsCount}</text>
            <text x="20" y="150" class="title">STARS</text>      <text x="260" y="150" class="value" text-anchor="end">${totalStars}</text>
            <text x="20" y="175" class="title">REPOSITORIES</text><text x="260" y="175" class="value" text-anchor="end">${repos}</text>
          </g>
        </g>

        <!-- MISSÃO ATUAL (Base Esquerda) -->
        <g transform="translate(20, 250)">
          <g class="anim-panel delay-1">
            <rect width="280" height="150" class="panel" rx="4" />
            <text x="20" y="35" class="title">CURRENT QUEST</text>
            <line x1="20" y1="45" x2="260" y2="45" class="divider" />
            
            <circle cx="25" cy="70" r="4" fill="#3a2e21" /> <text x="38" y="74" class="quest-text" fill="#777"><tspan text-decoration="line-through">SURVIVE THE OUTBREAK</tspan></text>
            <circle cx="25" cy="95" r="4" fill="#3a2e21" /> <text x="38" y="99" class="quest-text" fill="#777"><tspan text-decoration="line-through">SECURE THE CODEBASE</tspan></text>
            
            <circle cx="25" cy="120" r="4" fill="#b89c72" /> <circle cx="25" cy="120" r="1.5" fill="#000" />
            <text x="38" y="124" class="quest-text" fill="#e0e0e0">${currentQuest}</text>
          </g>
        </g>

        <!-- PESETAS / FUNDS (Topo Direita) -->
        <g transform="translate(560, 20)">
          <g class="anim-panel delay-2">
            <rect width="270" height="130" class="panel" rx="4" />
            <text x="20" y="35" class="title">FUNDS</text>
            <line x1="20" y1="45" x2="250" y2="45" class="divider" />
            
            <text x="135" y="90" class="pesetas-text" text-anchor="middle">₧ ${pesetas.toLocaleString("pt-BR")}</text>
            <text x="135" y="115" class="quest-text" fill="#888" text-anchor="middle">"What're ya buyin'?"</text>
          </g>
        </g>

        <!-- EQUIPAMENTOS (Base Direita) -->
        <g transform="translate(560, 170)">
          <g class="anim-panel delay-3">
            <rect width="270" height="150" class="panel" rx="4" />
            <text x="20" y="35" class="title">ATTACHED CASE</text>
            <line x1="20" y1="45" x2="250" y2="45" class="divider" />
            
            <text x="20" y="75" class="value">⬡ REACT.JS</text>
            <text x="140" y="75" class="value">⬡ NODE.JS</text>
            <text x="20" y="105" class="value">⬡ TYPESCRIPT</text>
            <text x="140" y="105" class="value">⬡ TAILWIND</text>
            <text x="20" y="135" class="value">⬡ THREE.JS</text>
            <text x="140" y="135" class="value">⬡ VITE</text>
          </g>
        </g>

      </svg>
    `;

		res.setHeader("Content-Type", "image/svg+xml");
		res.setHeader("Cache-Control", "public, max-age=7200");
		res.status(200).send(svg);
	} catch (error) {
		res.status(500).send("Erro ao gerar o painel.");
	}
}
