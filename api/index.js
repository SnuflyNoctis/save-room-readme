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
        <image href="data:image/jpeg;base64,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" 
        x="0" 
        y="0" 
        width="850" 
        height="480" 
        preserveAspectRatio="xMidYMid slice" />

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
