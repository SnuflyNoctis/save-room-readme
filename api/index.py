from http.server import BaseHTTPRequestHandler
import requests
from PIL import Image, ImageDraw, ImageFont
import io
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        username = 'SnuflyNoctis'
        
        # 1. Buscar os teus dados reais no GitHub
        headers = {'User-Agent': 'SaveRoom-Python'}
        try:
            user_data = requests.get(f'https://api.github.com/users/{username}', headers=headers).json()
            repos = user_data.get('public_repos', 14)
            followers = user_data.get('followers', 3)
            pesetas = (repos * 1500) + (followers * 5000) + 42500
        except:
            repos, followers, pesetas = 14, 3, 88500

        # 2. Localizar a pasta "assets" (Um nível acima da pasta "api")
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        assets_dir = os.path.join(base_dir, 'assets')
        
        try:
            # Carregar as tuas imagens garantindo o canal Alfa (RGBA) para a transparência
            bg = Image.open(os.path.join(assets_dir, 'bg.png')).convert("RGBA")
            merchant = Image.open(os.path.join(assets_dir, 'merchant.png')).convert("RGBA")
            player = Image.open(os.path.join(assets_dir, 'player.png')).convert("RGBA")
            
            # Se as imagens do player/mercador ficarem gigantes no cenário, podes redimensioná-las assim:
            # merchant = merchant.resize((int(merchant.width * 0.7), int(merchant.height * 0.7)))
            # player = player.resize((int(player.width * 0.7), int(player.height * 0.7)))
            
            # 3. Composição (Colar os personagens por cima do fundo)
            # Os números (X, Y) controlam a posição. Vais ter de os ajustar para sentar o player na cadeira!
            bg.alpha_composite(merchant, (50, 150))   # X=50 (Esquerda), Y=150 (Altura)
            bg.alpha_composite(player, (450, 200))    # X=450 (Centro/Direita), Y=200 (Altura)
            
            # 4. Escrever a Interface (UI)
            draw = ImageDraw.Draw(bg)
            font = ImageFont.load_default()
            
            # Textos
            draw.text((60, 120), f"PESETAS: {pesetas}", fill=(212, 175, 55), font=font)
            draw.text((450, 160), f"ID: {username}", fill=(200, 200, 200), font=font)
            draw.text((450, 180), f"LEVEL: {repos + followers}", fill=(100, 255, 100), font=font)
            
            # 5. Guardar em memória e enviar
            img_io = io.BytesIO()
            bg.save(img_io, format='PNG')
            img_io.seek(0)
            
            self.send_response(200)
            self.send_header('Content-Type', 'image/png')
            self.send_header('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=300')
            self.end_headers()
            self.wfile.write(img_io.read())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(f"Erro ao compor a Save Room: {str(e)}".encode())
        return