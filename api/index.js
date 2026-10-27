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

        <image href="data:image/png;base64,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"
         x="0"
         y="0"
         width="850" 
        height="480" 
        preserveAspectRatio="xMidYMid slice"
         opacity="0.6"
         />

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
