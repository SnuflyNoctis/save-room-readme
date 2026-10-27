from http.server import BaseHTTPRequestHandler
import requests
from PIL import Image, ImageDraw, ImageFont
import io
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        username = 'SnuflyNoctis'
        headers = {'User-Agent': 'SaveRoom-Clean-UI'}
        
        # 1. Buscar dados no GitHub
        try:
            user_data = requests.get(f'https://api.github.com/users/{username}', headers=headers, timeout=5).json()
            repos = user_data.get('public_repos', 14)
            followers = user_data.get('followers', 3)
            pesetas = (repos * 1500) + (followers * 5000) + 42500
            
            events = requests.get(f'https://api.github.com/users/{username}/events/public', headers=headers, timeout=5).json()
            last_commit = "Aguardando logs..."
            if isinstance(events, list):
                for e in events:
                    if e.get('type') == 'PushEvent':
                        commits = e['payload'].get('commits', [])
                        if commits:
                            last_commit = commits[0]['message'].split('\n')[0]
                            if len(last_commit) > 28: last_commit = last_commit[:25] + "..."
                            break
        except:
            repos, followers, pesetas = 14, 3, 88500
            last_commit = "Sistema offline"

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        assets_dir = os.path.join(base_dir, 'assets')
        
        try:
            # 2. Carregar a Save Room e redimensionar
            bg_base = Image.open(os.path.join(assets_dir, 'bg.png')).convert("RGBA")
            bg_base = bg_base.resize((850, 480), Image.Resampling.LANCZOS)
            
            # 3. Criar a camada de painéis translúcidos
            ui_overlay = Image.new('RGBA', bg_base.size, (0, 0, 0, 0))
            draw_ui = ImageDraw.Draw(ui_overlay)
            
            panel_color = (15, 15, 18, 220)  # Fundo escuro (quase opaco para leitura)
            border_color = (100, 80, 60, 255) # Borda rústica
            
            # Desenhar os 4 Painéis (Esquerda e Direita)
            draw_ui.rectangle([30, 30, 290, 210], fill=panel_color, outline=border_color, width=2)   # Status
            draw_ui.rectangle([30, 250, 290, 430], fill=panel_color, outline=border_color, width=2)  # Quest/Logs
            draw_ui.rectangle([560, 30, 820, 210], fill=panel_color, outline=border_color, width=2)  # Inventário
            draw_ui.rectangle([560, 250, 820, 430], fill=panel_color, outline=border_color, width=2) # Pesetas
            
            # Fundir os painéis vazios com o fundo
            bg_with_ui = Image.alpha_composite(bg_base, ui_overlay)
            
            # 4. Gerar as Frames da Animação (GIF)
            frames = []
            font = ImageFont.load_default()
            
            text_color = (210, 210, 210)
            title_color = (184, 156, 114)
            
            for i in range(4):
                frame = bg_with_ui.copy()
                draw = ImageDraw.Draw(frame)
                
                # --- PAINEL 1: STATUS (Esquerda Cima) ---
                draw.text((45, 45), "STATUS", fill=title_color, font=font)
                draw.line([(45, 60), (275, 60)], fill=border_color, width=1)
                draw.text((45, 75), f"LEVEL: {repos + followers}", fill=(100, 255, 100), font=font)
                draw.text((45, 105), f"REPOSITORIES: {repos}", fill=text_color, font=font)
                draw.text((45, 135), f"FOLLOWERS: {followers}", fill=text_color, font=font)
                
                # --- PAINEL 2: QUEST/LOG (Esquerda Baixo) ---
                draw.text((45, 265), "CURRENT QUEST", fill=title_color, font=font)
                draw.line([(45, 280), (275, 280)], fill=border_color, width=1)
                draw.text((45, 300), "> LATEST CODE LOG:", fill=text_color, font=font)
                draw.text((45, 330), last_commit, fill=(230, 230, 230), font=font)
                
                # Animação do Cursor
                if i % 2 == 0:
                    cursor_pos = 45 + (len(last_commit) * 6.5)
                    draw.rectangle([cursor_pos, 330, cursor_pos + 6, 342], fill=(200, 0, 0))
                
                # --- PAINEL 3: ATTACHED CASE (Direita Cima) ---
                draw.text((575, 45), "ATTACHED CASE", fill=title_color, font=font)
                draw.line([(575, 60), (805, 60)], fill=border_color, width=1)
                draw.text((575, 80), "⬡ REACT.JS", fill=text_color, font=font)
                draw.text((700, 80), "⬡ BUN", fill=text_color, font=font)
                draw.text((575, 115), "⬡ TYPESCRIPT", fill=text_color, font=font)
                draw.text((700, 115), "⬡ VITE", fill=text_color, font=font)
                draw.text((575, 150), "⬡ TAILWIND", fill=text_color, font=font)
                draw.text((700, 150), "⬡ THREE.JS", fill=text_color, font=font)
                
                # --- PAINEL 4: FUNDS (Direita Baixo) ---
                draw.text((575, 265), "FUNDS", fill=title_color, font=font)
                draw.line([(575, 280), (805, 280)], fill=border_color, width=1)
                draw.text((620, 320), f"₧ {pesetas:,}".replace(",", "."), fill=(212, 175, 55), font=font)
                draw.text((620, 360), '"What\'re ya buyin\'?"', fill=(130, 130, 130), font=font)
                
                frames.append(frame.convert("RGB"))
            
            # 5. Salvar e Enviar
            img_io = io.BytesIO()
            frames[0].save(img_io, format='GIF', save_all=True, append_images=frames[1:], duration=500, loop=0, optimize=True)
            img_io.seek(0)
            
            self.send_response(200)
            self.send_header('Content-Type', 'image/gif')
            self.send_header('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=300')
            self.end_headers()
            self.wfile.write(img_io.read())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(f"Erro interno: {str(e)}".encode())
        return