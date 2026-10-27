export default async function handler(req, res) {
	const username = "SnuflyNoctis";

	try {
		const userRes = await fetch(`https://api.github.com/users/${username}`, {
			headers: { "User-Agent": "RE4-Status-Menu" },
		});
		const user = await userRes.json();

		const reposRes = await fetch(
			`https://api.github.com/users/${username}/repos?per_page=100`,
			{ headers: { "User-Agent": "RE4-Status-Menu" } },
		);
		const reposData = await reposRes.json();
		const totalStars = Array.isArray(reposData)
			? reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0)
			: 0;

		const eventsRes = await fetch(
			`https://api.github.com/users/${username}/events/public`,
			{ headers: { "User-Agent": "RE4-Status-Menu" } },
		);
		const events = await eventsRes.json();

		let recentCommitsCount = 0;
		let recentPrsCount = 0;
		let currentQuest = "SURVIVE RACCOON CITY";

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
				if (currentQuest.length > 25)
					currentQuest = currentQuest.substring(0, 25) + "...";
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
            
            .title { font-family: 'Cinzel', Palatino, 'Times New Roman', serif; font-size: 14px; font-weight: bold; fill: #b89c72; letter-spacing: 2px; }
            .value { font-family: 'Cinzel', Palatino, 'Times New Roman', serif; font-size: 14px; fill: #e0e0e0; }
            .pesetas-text { font-family: 'Cinzel', Palatino, 'Times New Roman', serif; font-size: 32px; fill: #d4af37; text-shadow: 2px 2px 4px #000; }
            .quest-text { font-family: 'Courier Prime', Courier, monospace; font-size: 12px; fill: #e0e0e0; }
            
            .panel { fill: rgba(15, 15, 15, 0.85); stroke: #3a2e21; stroke-width: 1.5; }
            .divider { stroke: #3a2e21; stroke-width: 1; stroke-dasharray: 4 2; }
            
            @keyframes slideIn {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .anim-panel { animation: slideIn 1.2s ease-out forwards; opacity: 0; }
            .delay-1 { animation-delay: 0.3s; }
            .delay-2 { animation-delay: 0.6s; }
            
            @keyframes breathe {
              0%, 100% { transform: translateY(0px) scaleY(1); }
              50% { transform: translateY(-3px) scaleY(1.02); }
            }
            .character-anim { animation: breathe 4s ease-in-out infinite; transform-origin: bottom; }
            
            @keyframes fogMove {
              0% { transform: translateX(-50px); opacity: 0.3; }
              50% { opacity: 0.5; }
              100% { transform: translateX(50px); opacity: 0.3; }
            }
            .fog { fill: #ffffff; filter: blur(20px); animation: fogMove 10s alternate infinite; }
          </style>
          
          <linearGradient id="bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0a0a0c" />
            <stop offset="50%" stop-color="#1a1c23" />
            <stop offset="100%" stop-color="#050505" />
          </linearGradient>
        </defs>

        <rect width="850" height="480" fill="url(#bg-grad)" />
        <ellipse cx="200" cy="400" rx="300" ry="100" class="fog" />
        <ellipse cx="600" cy="300" rx="250" ry="80" class="fog" style="animation-delay: -5s;" />

        <g fill="#080808" stroke="#111" stroke-width="1">
          <rect x="50" y="200" width="80" height="280" />
          <rect x="110" y="150" width="60" height="330" />
          <rect x="160" y="220" width="100" height="260" />
          <rect x="650" y="180" width="90" height="300" />
          <rect x="720" y="120" width="70" height="360" />
        </g>

        <!-- POSIÇÃO ISOLADA DA ANIMAÇÃO -->
        <g transform="translate(425, 300)">
          <g class="character-anim">
            <path d="M-40,180 C-40,50 40,50 40,180 Z" fill="#121212" />
            <circle cx="0" cy="40" r="25" fill="#1a1a1a" />
            <path d="M-30,100 L30,100 L40,180 L-40,180 Z" fill="#1f1b18" />
          </g>
        </g>

        <!-- UI: STATUS DO JOGADOR -->
        <!-- O grupo exterior dá a posição, o interior faz a animação de entrada sem alterar o X,Y absoluto -->
        <g transform="translate(30, 30)">
          <g class="anim-panel">
            <rect width="320" height="230" class="panel" />
            <text x="20" y="35" class="title">STATUS</text>
            <line x1="20" y1="45" x2="300" y2="45" class="divider" />
            
            <text x="20" y="75" class="title">LEVEL</text>      <text x="280" y="75" class="value" text-anchor="end">${level}</text>
            <text x="20" y="105" class="title">COMMITS</text>    <text x="280" y="105" class="value" text-anchor="end">${recentCommitsCount} (Recent)</text>
            <text x="20" y="135" class="title">PULL REQUESTS</text><text x="280" y="135" class="value" text-anchor="end">${recentPrsCount}</text>
            <text x="20" y="165" class="title">STARS</text>      <text x="280" y="165" class="value" text-anchor="end">${totalStars}</text>
            <text x="20" y="195" class="title">REPOSITORIES</text><text x="280" y="195" class="value" text-anchor="end">${repos}</text>
            <text x="20" y="225" class="title">FOLLOWERS</text>   <text x="280" y="225" class="value" text-anchor="end">${followers}</text>
          </g>
        </g>

        <!-- UI: MISSÃO ATUAL -->
        <g transform="translate(30, 280)">
          <g class="anim-panel delay-1">
            <rect width="280" height="170" class="panel" />
            <text x="20" y="35" class="title">CURRENT QUEST</text>
            <line x1="20" y1="45" x2="260" y2="45" class="divider" />
            
            <circle cx="25" cy="70" r="5" fill="#3a2e21" /> <text x="40" y="74" class="quest-text" fill="#777"><tspan text-decoration="line-through">ESCAPE THE VILLAGE</tspan></text>
            <circle cx="25" cy="100" r="5" fill="#3a2e21" /> <text x="40" y="104" class="quest-text" fill="#777"><tspan text-decoration="line-through">LEARN REACT</tspan></text>
            
            <circle cx="25" cy="130" r="5" fill="#b89c72" /> <circle cx="25" cy="130" r="2" fill="#000" />
            <text x="40" y="134" class="quest-text" fill="#e0e0e0">${currentQuest}</text>
          </g>
        </g>

        <!-- UI: EQUIPAMENTOS -->
        <g transform="translate(330, 280)">
          <g class="anim-panel delay-2">
            <rect width="220" height="170" class="panel" />
            <text x="20" y="35" class="title">ATTACHED CASE</text>
            <line x1="20" y1="45" x2="200" y2="45" class="divider" />
            
            <text x="20" y="75" class="value">⬡ REACT.JS</text>
            <text x="120" y="75" class="value">⬡ NODE.JS</text>
            <text x="20" y="110" class="value">⬡ TYPESCRIPT</text>
            <text x="120" y="110" class="value">⬡ TAILWIND</text>
            <text x="20" y="145" class="value">⬡ THREE.JS</text>
            <text x="120" y="145" class="value">⬡ VITE</text>
          </g>
        </g>

        <!-- UI: PESETAS -->
        <g transform="translate(570, 280)">
          <g class="anim-panel delay-2">
            <rect width="250" height="170" class="panel" />
            <text x="20" y="35" class="title">FUNDS</text>
            <line x1="20" y1="45" x2="230" y2="45" class="divider" />
            
            <text x="125" y="110" class="pesetas-text" text-anchor="middle">₧ ${pesetas.toLocaleString("pt-BR")}</text>
            <text x="125" y="140" class="quest-text" fill="#888" text-anchor="middle">"Welcome, stranger!"</text>
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
