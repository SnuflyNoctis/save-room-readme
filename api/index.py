from http.server import BaseHTTPRequestHandler
import requests
from PIL import Image, ImageDraw, ImageFont
import io
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        username = 'SnuflyNoctis'
        
        # 1. Buscar dados no GitHub
        headers = {'User-Agent': 'SaveRoom-Animated-Python'}
        try:
            # Dados principais
            user_data = requests.get(f'https://api.github.com/users/{username}', headers=headers, timeout=5).json()
            repos = user_data.get('public_repos', 14)
            followers = user_data.get('followers', 3)
            pesetas = (repos * 1500) + (followers * 5000) + 42500
            
            # Buscar último evento (Commit/Push)
            events = requests.get(f'https://api.github.com/users/{username}/events/public', headers=headers, timeout=5).json()
            last_commit = "Aguardando logs..."
            if isinstance(events, list):
                for e in events:
                    if e.get('type') == 'PushEvent':
                        commits = e['payload'].get('commits', [])
                        if commits:
                            last_commit = commits[0]['message'].split('\n')[0]
                            if len(last_commit) > 20: last_commit = last_commit[:17] + "..."
                            break
        except:
            repos, followers, pesetas = 14, 3, 88500
            last_commit = "Sistema offline"

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        assets_dir = os.path.join(base_dir, 'assets')
        
        try:
            # 2. Carregar assets e redimensionar
            bg_base = Image.open(os.path.join(assets_dir, 'bg.png')).convert("RGBA")
            bg_base = bg_base.resize((850, 480), Image.Resampling.LANCZOS)
            
            merchant = Image.open(os.path.join(assets_dir, 'merchant.png')).convert("RGBA")
            merchant = merchant.resize((int(merchant.width * 0.4), int(merchant.height * 0.4)), Image.Resampling.LANCZOS)
            
            player = Image.open(os.path.join(assets_dir, 'player.png')).convert("RGBA")
            player = player.resize((int(player.width * 0.35), int(player.height * 0.35)), Image.Resampling.LANCZOS)
            
            # Posições Base (Ajustadas para ficar mais natural no cenário)
            # Mercador mais abaixo perto do baú, Player perto do sofá
            pos_merchant = (200, 230)
            pos_player = (480, 270)
            
            # 3. Gerar Frames para o GIF animado
            frames = []
            # Array de deslocamento vertical para simular respiração
            respiracao = [0, 1, 2, 1, 0, -1, -2, -1] 
            
            font = ImageFont.load_default()
            
            for i in range(8):
                # Criar uma cópia do fundo para esta frame
                frame = bg_base.copy()
                
                # Calcular o movimento desta frame
                move_y = respiracao[i]
                
                # Colar personagens com o efeito de respiração (move_y)
                frame.alpha_composite(merchant, (pos_merchant[0], pos_merchant[1] + move_y))
                frame.alpha_composite(player, (pos_player[0], pos_player[1] + move_y))
                
                # 4. Desenhar a Interface (UI)
                draw = ImageDraw.Draw(frame)
                
                # Status Flutuantes (acompanham a respiração dos personagens)
                draw.text((pos_merchant[0] - 20, pos_merchant[1] - 30 + move_y), f"PESETAS: {pesetas}", fill=(212, 175, 55), font=font)
                draw.text((pos_player[0] + 10, pos_player[1] - 40 + move_y), f"LVL: {repos + followers}", fill=(100, 255, 100), font=font)
                draw.text((pos_player[0] + 10, pos_player[1] - 25 + move_y), f"ID: {username}", fill=(200, 200, 200), font=font)
                
                # Status fixos na parede (Quadro de Missões)
                draw.text((50, 50), f"[ RECORDED LOGS ]", fill=(184, 156, 114), font=font)
                draw.text((50, 70), f"> REPOSITORIES: {repos}", fill=(200, 200, 200), font=font)
                draw.text((50, 90), f"> FOLLOWERS: {followers}", fill=(200, 200, 200), font=font)
                
                # Máquina de escrever (Último commit) no centro da mesa
                draw.text((380, 150), "> LATEST LOG:", fill=(184, 156, 114), font=font)
                draw.text((380, 170), last_commit, fill=(200, 200, 200), font=font)
                
                # Animação do Cursor a piscar na máquina de escrever (aparece metade do tempo)
                if i % 4 < 2:
                    cursor_x = 380 + (len(last_commit) * 6) # Posição aproximada do fim do texto
                    draw.rectangle([cursor_x, 170, cursor_x + 6, 182], fill=(200, 0, 0))
                
                # Garantir que a frame está em modo RGB para salvar como GIF
                frames.append(frame.convert("RGB"))
            
            # 5. Guardar as frames como GIF animado
            img_io = io.BytesIO()
            # duration=150 significa 150 milissegundos por frame
            frames[0].save(img_io, format='GIF', save_all=True, append_images=frames[1:], duration=150, loop=0, optimize=True)
            img_io.seek(0)
            
            self.send_response(200)
            self.send_header('Content-Type', 'image/gif') # Agora devolvemos um GIF!
            self.send_header('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=300')
            self.end_headers()
            self.wfile.write(img_io.read())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(f"Erro ao animar a Save Room: {str(e)}".encode())
        return