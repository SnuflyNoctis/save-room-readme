from http.server import BaseHTTPRequestHandler
import requests
from PIL import Image, ImageDraw, ImageFont
import io
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        username = 'SnuflyNoctis'
        
        headers = {'User-Agent': 'SaveRoom-Python'}
        try:
            user_data = requests.get(f'https://api.github.com/users/{username}', headers=headers).json()
            repos = user_data.get('public_repos', 14)
            followers = user_data.get('followers', 3)
            pesetas = (repos * 1500) + (followers * 5000) + 42500
        except:
            repos, followers, pesetas = 14, 3, 88500

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        assets_dir = os.path.join(base_dir, 'assets')
        
        try:
            bg = Image.open(os.path.join(assets_dir, 'bg.png')).convert("RGBA")
            merchant = Image.open(os.path.join(assets_dir, 'merchant.png')).convert("RGBA")
            player = Image.open(os.path.join(assets_dir, 'player.png')).convert("RGBA")
            
            # 1. OTIMIZAÇÃO: Redimensionar o fundo para 850x480 (Evita o corte no GitHub)
            # Usamos LANCZOS para manter a qualidade da pixel art durante a redução
            bg = bg.resize((850, 480), Image.Resampling.LANCZOS)
            
            # 2. Redimensionar personagens proporcionalmente para caberem no novo fundo
            # Podes alterar estes valores (0.4 = 40% do tamanho original) se ficarem grandes ou pequenos
            merchant = merchant.resize((int(merchant.width * 0.4), int(merchant.height * 0.4)), Image.Resampling.LANCZOS)
            player = player.resize((int(player.width * 0.35), int(player.height * 0.35)), Image.Resampling.LANCZOS)
            
            # 3. Composição com as novas coordenadas ajustadas
            bg.alpha_composite(merchant, (150, 200)) # Mercador perto da estante
            bg.alpha_composite(player, (450, 250))   # Player perto da mesa
            
            # 4. Textos da Interface
            draw = ImageDraw.Draw(bg)
            font = ImageFont.load_default()
            
            # Textos a flutuar por cima das cabeças
            draw.text((150, 180), f"PESETAS: {pesetas}", fill=(212, 175, 55), font=font)
            draw.text((450, 210), f"ID: {username}", fill=(200, 200, 200), font=font)
            draw.text((450, 230), f"LEVEL: {repos + followers}", fill=(100, 255, 100), font=font)
            
            # 5. Converter, comprimir levemente e enviar
            img_io = io.BytesIO()
            # Guardamos com o parâmetro optimize=True para reduzir o peso final
            bg.save(img_io, format='PNG', optimize=True)
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