from http.server import BaseHTTPRequestHandler
import requests
from PIL import Image, ImageDraw, ImageFont
import io
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        username = 'SnuflyNoctis'
        headers = {'User-Agent': 'SaveRoom-Final-UI'}
        
        # 1. Buscar dados no GitHub
        try:
            user_data = requests.get(f'https://api.github.com/users/{username}', headers=headers, timeout=5).json()
            repos = user_data.get('public_repos', 14)
            followers = user_data.get('followers', 3)
            pesetas = (repos * 1500) + (followers * 5000) + 42500
            
            events = requests.get(f'https://api.github.com/users/{username}/events/public', headers=headers, timeout=5).json()
            last_commit = "NO RECENT LOGS FOUND."
            if isinstance(events, list):
                for e in events:
                    if e.get('type') == 'PushEvent':
                        commits = e['payload'].get('commits', [])
                        if commits:
                            last_commit = commits[0]['message'].split('\n')[0]
                            # Limitar tamanho para não quebrar o painel
                            if len(last_commit) > 28: last_commit = last_commit[:25] + "..."
                            break
        except:
            repos, followers, pesetas = 14, 3, 88500
            last_commit = "COMMS LINK SEVERED."

        # Sistema de Condição (Classic RE)
        condition_text = "FINE"
        condition_color = (50, 205, 50) # Verde clássico
        if repos < 10:
            condition_text = "CAUTION"
            condition_color = (255, 215, 0) # Amarelo
        if repos < 5:
            condition_text = "DANGER"
            condition_color = (220, 20, 60) # Vermelho

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        assets_dir = os.path.join(base_dir, 'assets')
        
        try:
            # 2. Carregar a Save Room e redimensionar
            bg_base = Image.open(os.path.join(assets_dir, 'bg.png')).convert("RGBA")
            bg_base = bg_base.resize((850, 480), Image.Resampling.LANCZOS)
            
            # 3. Carregar Fonte Customizada (Se não existir, usa a básica)
            try:
                # Tenta carregar a fonte que colocaste na pasta assets
                font_title = ImageFont.truetype(os.path.join(assets_dir, 'font.ttf'), 16)
                font_text = ImageFont.truetype(os.path.join(assets_dir, 'font.ttf'), 14)
                font_pesetas = ImageFont.truetype(os.path.join(assets_dir, 'font.ttf'), 22)
            except:
                font_title = font_text = font_pesetas = ImageFont.load_default()
            
            # 4. Criar a camada de painéis translúcidos
            ui_overlay = Image.new('RGBA', bg_base.size, (0, 0, 0, 0))
            draw_ui = ImageDraw.Draw(ui_overlay)
            
            panel_color = (15, 15, 18, 225)  
            border_color = (139, 0, 0, 180) # Borda mudada para um Vermelho Escuro (Blood Red) elegante
            
            draw_ui.rectangle([30, 30, 290, 210], fill=panel_color, outline=border_color, width=1)
            draw_ui.rectangle([30, 250, 290, 430], fill=panel_color, outline=border_color, width=1)
            draw_ui.rectangle([560, 30, 820, 210], fill=panel_color, outline=border_color, width=1)
            draw_ui.rectangle([560, 250, 820, 430], fill=panel_color, outline=border_color, width=1)
            
            bg_with_ui = Image.alpha_composite(bg_base, ui_overlay)
            
            # 5. Gerar as Frames da Animação (GIF)
            frames = []
            
            text_color = (220, 220, 220)
            title_color = (184, 156, 114) # Dourado envelhecido
            accent_color = (200, 50, 50)  # Vermelho para os bullets
            
            for i in range(4):
                frame = bg_with_ui.copy()
                draw = ImageDraw.Draw(frame)
                
                # --- PAINEL 1: STATUS ---
                draw.text((45, 45), "SURVIVAL STATUS", fill=title_color, font=font_title)
                draw.line([(45, 65), (275, 65)], fill=border_color, width=1)
                
                # Nome do Player
                draw.text((45, 80), "PLAYER:", fill=text_color, font=font_text)
                draw.text((120, 80), "JOÃO VICTOR", fill=(200, 200, 200), font=font_text)

                # Condition clássico do Resident Evil
                draw.text((45, 105), "CONDITION:", fill=text_color, font=font_text)
                draw.text((140, 105), f"{condition_text}", fill=condition_color, font=font_text)
                
                draw.text((45, 130), "LEVEL:", fill=text_color, font=font_text)
                draw.text((140, 130), f"{repos + followers}", fill=text_color, font=font_text)
                
                draw.text((45, 155), "REPOSITORIES:", fill=text_color, font=font_text)
                draw.text((160, 155), f"{repos}", fill=text_color, font=font_text)
                
                draw.text((45, 180), "FOLLOWERS:", fill=text_color, font=font_text)
                draw.text((160, 180), f"{followers}", fill=text_color, font=font_text)
                
                # --- PAINEL 2: QUEST/LOG --- (CORRIGIDO: Estava a faltar no teu código!)
                draw.text((45, 265), "CURRENT DIRECTIVE", fill=title_color, font=font_title)
                draw.line([(45, 285), (275, 285)], fill=border_color, width=1)
                draw.text((45, 305), "> LATEST LOG ENTRY:", fill=title_color, font=font_text)
                draw.text((45, 335), last_commit, fill=text_color, font=font_text)
                
                if i % 2 == 0:
                    # Ajuste do cursor baseado na fonte
                    cursor_pos = 45 + draw.textlength(last_commit, font=font_text) + 2
                    draw.rectangle([cursor_pos, 337, cursor_pos + 6, 350], fill=(200, 0, 0))
                
                # --- PAINEL 3: ATTACHED CASE ---
                draw.text((575, 45), "ATTACHED CASE", fill=title_color, font=font_title)
                draw.line([(575, 65), (805, 65)], fill=border_color, width=1)
                
                # Usando um caractere temático de bullet (♦ ou ►)
                draw.text((575, 85), "► REACT.JS", fill=text_color, font=font_text)
                draw.text((700, 85), "► BUN", fill=text_color, font=font_text)
                draw.text((575, 120), "► TYPESCRIPT", fill=text_color, font=font_text)
                draw.text((700, 120), "► VITE", fill=text_color, font=font_text)
                draw.text((575, 155), "► TAILWIND", fill=text_color, font=font_text)
                draw.text((700, 155), "► THREE.JS", fill=text_color, font=font_text)
                
                # --- PAINEL 4: FUNDS ---
                draw.text((575, 265), "FUNDS", fill=title_color, font=font_title)
                draw.line([(575, 285), (805, 285)], fill=border_color, width=1)
                
                # Centralizar as pesetas
                ptas_text = f"₧ {pesetas:,}".replace(",", ".")
                ptas_width = draw.textlength(ptas_text, font=font_pesetas)
                draw.text((690 - (ptas_width/2), 325), ptas_text, fill=(212, 175, 55), font=font_pesetas)
                
                quote = '"What\'re ya buyin\'?"'
                quote_width = draw.textlength(quote, font=font_text)
                draw.text((690 - (quote_width/2), 370), quote, fill=(140, 140, 140), font=font_text)
                
                frames.append(frame.convert("RGB"))
            
            # 6. Salvar e Enviar
            img_io = io.BytesIO()
            frames[0].save(img_io, format='GIF', save_all=True, append_images=frames[1:], duration=600, loop=0, optimize=True)
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