// api/index.js

export default async function handler(req, res) {
	const username = "SnuflyNoctis";

	try {
		// 1. Busca os últimos eventos do seu GitHub
		const githubRes = await fetch(
			`https://api.github.com/users/${username}/events/public`,
			{
				headers: { "User-Agent": "Resident-Evil-Save-Room" }, // O GitHub exige um User-Agent
			},
		);

		if (!githubRes.ok) throw new Error("Falha ao buscar dados do GitHub");

		const events = await githubRes.json();

		const pushEvents = events.filter((e) => e.type === "PushEvent");

		// Pega os 4 commits mais recentes
		const recentCommits = pushEvents
			.flatMap((e) => e.payload.commits)
			.slice(0, 4);

		// 3. Monta o texto dos commits para o SVG
		// Centralizando e quebrando linhas longas
		const commitsSvg = recentCommits
			.map((commit, index) => {
				let message = commit.message.split("\n")[0]; // Pega só a primeira linha do commit
				if (message.length > 35) message = message.substring(0, 35) + "...";

				// Calcula a posição Y para cada linha
				const yPosition = 125 + index * 25;
				return `<text x="90" y="${yPosition}" font-family="Courier, monospace" font-size="13" fill="#111111">> ${message}</text>`;
			})
			.join("");

		// 4. Desenha o SVG da Máquina de Escrever + Papel
		const svg = `
      <svg width="500" height="320" viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg">
        <!-- Fundo Transparente ou Escuro -->
        <rect x="0" y="0" width="500" height="320" fill="#00000000" />
        
        <!-- O Papel -->
        <rect x="70" y="20" width="360" height="250" fill="#f4f1de" rx="3" stroke="#d4cbad" stroke-width="2"/>
        
        <!-- Cabeçalho no Papel -->
        <text x="90" y="60" font-family="Courier, monospace" font-size="22" font-weight="bold" fill="#9e1a1a">SAVE ROOM LOG</text>
        <text x="90" y="85" font-family="Courier, monospace" font-size="14" fill="#555555">Player: ${username}</text>
        
        <line x1="90" y1="95" x2="410" y2="95" stroke="#d4cbad" stroke-width="1" stroke-dasharray="5,5"/>
        
        <!-- Título dos Commits -->
        <text x="90" y="115" font-family="Courier, monospace" font-size="12" fill="#555555">Recent Actions:</text>
        
        <!-- Injeta os commits dinamicamente -->
        ${commitsSvg || '<text x="90" y="140" font-family="Courier, monospace" font-size="13" fill="#111">> No recent saves found.</text>'}
        
        <!-- O Corpo da Máquina de Escrever -->
        <path d="M40,230 L460,230 L480,310 L20,310 Z" fill="#2c2c2c" stroke="#111" stroke-width="2"/>
        
        <!-- O Rolo da Máquina -->
        <rect x="50" y="210" width="400" height="25" fill="#1a1a1a" rx="5" stroke="#000" stroke-width="2"/>
        <rect x="40" y="215" width="420" height="15" fill="#111" rx="3"/>
        
        <!-- Teclado (Detalhe Estético) -->
        <circle cx="150" cy="270" r="10" fill="#1a1a1a" stroke="#000"/>
        <circle cx="180" cy="270" r="10" fill="#1a1a1a" stroke="#000"/>
        <circle cx="210" cy="270" r="10" fill="#1a1a1a" stroke="#000"/>
        <circle cx="240" cy="270" r="10" fill="#1a1a1a" stroke="#000"/>
        <circle cx="270" cy="270" r="10" fill="#1a1a1a" stroke="#000"/>
        <circle cx="300" cy="270" r="10" fill="#1a1a1a" stroke="#000"/>
        <circle cx="330" cy="270" r="10" fill="#1a1a1a" stroke="#000"/>
        <circle cx="360" cy="270" r="10" fill="#1a1a1a" stroke="#000"/>
      </svg>
    `;

		// 5. Retorna a imagem SVG com cache configurado
		res.setHeader("Content-Type", "image/svg+xml");
		// Faz o GitHub armazenar a imagem em cache por apenas 2 horas para não sobrecarregar sua API
		res.setHeader("Cache-Control", "public, max-age=7200");
		res.status(200).send(svg);
	} catch (error) {
		res.status(500).send("Erro ao gerar a fogueira/save room.");
	}
}
