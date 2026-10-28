from http.server import BaseHTTPRequestHandler
import requests
from PIL import Image, ImageDraw, ImageFont
import io
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        username = 'SnuflyNoctis'
        headers = {'User-Agent': 'SaveRoom-Categorized-Vitals'}
        
        # 1. Buscar dados no GitHub
        try:
            user_data = requests.get(f'https://api.github.com/users/{username}', headers=headers, timeout=5).json()
            repos = user_data.get('public_repos', 14)
            followers = user_data.get('followers', 3)
            
            events = requests.get(f'https://api.github.com/users/{username}/events/public', headers=headers, timeout=5).json()
            last_commit = "NO RECENT LOGS FOUND."
            if isinstance(events, list):
                for e in events:
                    if e.get('type') == 'PushEvent':
                        commits = e['payload'].get('commits', [])
                        if commits:
                            last_commit = commits[0]['message'].split('\n')[0]
                            if len(last_commit) > 28: last_commit = last_commit[:25] + "..."
                            break
        except:
            repos, followers = 14, 3
            last_commit = "COMMS LINK SEVERED."

        # Sistema de Condição Global
        condition_text = "FINE"
        condition_color = (50, 205, 50) 
        if repos < 10:
            condition_text = "CAUTION"
            condition_color = (255, 215, 0) 
        if repos < 5:
            condition_text = "DANGER"
            condition_color = (220, 20, 60) 

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        assets_dir = os.path.join(base_dir, 'assets')
        
        try:
            # 2. Carregar a Save Room e redimensionar
            bg_base = Image.open(os.path.join(assets_dir, 'bg.png')).convert("RGBA")
            bg_base = bg_base.resize((850, 480), Image.Resampling.LANCZOS)
            
            # 3. Carregar Fontes
            try:
                font_url = "https://raw.githubusercontent.com/googlefonts/vt323/main/fonts/ttf/VT323-Regular.ttf"
                font_response = requests.get(font_url)
                font_bytes = io.BytesIO(font_response.content)
                
                # Os tamanhos foram aumentados porque a VT323 é uma fonte mais compacta
                font_title = ImageFont.truetype(font_bytes, 22)
                font_text = ImageFont.truetype(font_bytes, 18)
                font_small = ImageFont.truetype(font_bytes, 16)
                font_pesetas = ImageFont.truetype(font_bytes, 28)
            except:
                font_title = font_text = font_small = font_pesetas = ImageFont.load_default()
            
            # 4. Criar a camada de painéis translúcidos
            ui_overlay = Image.new('RGBA', bg_base.size, (0, 0, 0, 0))
            draw_ui = ImageDraw.Draw(ui_overlay)
            
            panel_color = (15, 15, 18, 225)  
            border_color = (139, 0, 0, 180) 
            
            draw_ui.rectangle([30, 30, 290, 210], fill=panel_color, outline=border_color, width=1)
            draw_ui.rectangle([30, 250, 290, 430], fill=panel_color, outline=border_color, width=1)
            draw_ui.rectangle([560, 30, 820, 430], fill=panel_color, outline=border_color, width=1)
            
            bg_with_ui = Image.alpha_composite(bg_base, ui_overlay)
            
            # 5. Gerar as Frames da Animação (GIF)
            frames = []
            text_color = (220, 220, 220)
            title_color = (184, 156, 114) 
            
            for i in range(4):
                frame = bg_with_ui.copy()
                draw = ImageDraw.Draw(frame)
                
                # --- PAINEL 1: STATUS ---
                draw.text((45, 45), "SURVIVAL STATUS", fill=title_color, font=font_title)
                draw.line([(45, 65), (275, 65)], fill=border_color, width=1)
                
                draw.text((45, 80), "PLAYER:", fill=text_color, font=font_text)
                draw.text((120, 80), "JOÃO VICTOR", fill=(200, 200, 200), font=font_text)

                draw.text((45, 105), "CONDITION:", fill=text_color, font=font_text)
                draw.text((140, 105), f"{condition_text}", fill=condition_color, font=font_text)
                
                draw.text((45, 130), "LEVEL:", fill=text_color, font=font_text)
                draw.text((140, 130), f"{repos + followers}", fill=text_color, font=font_text)
                
                draw.text((45, 155), "REPOSITORIES:", fill=text_color, font=font_text)
                draw.text((160, 155), f"{repos}", fill=text_color, font=font_text)
                
                draw.text((45, 180), "FOLLOWERS:", fill=text_color, font=font_text)
                draw.text((160, 180), f"{followers}", fill=text_color, font=font_text)
                
                # --- PAINEL 2: QUEST/LOG ---
                draw.text((45, 265), "CURRENT DIRECTIVE", fill=title_color, font=font_title)
                draw.line([(45, 285), (275, 285)], fill=border_color, width=1)
                draw.text((45, 305), "> LATEST LOG ENTRY:", fill=title_color, font=font_text)
                draw.text((45, 335), last_commit, fill=text_color, font=font_text)
                
                if i % 2 == 0:
                    cursor_pos = 45 + draw.textlength(last_commit, font=font_text) + 2
                    draw.rectangle([cursor_pos, 337, cursor_pos + 6, 350], fill=(200, 0, 0))
                
                # --- PAINEL 3: SKILLS CONDITION (CATEGORIZADO) ---
                draw.text((575, 45), "SKILLS CONDITION", fill=title_color, font=font_title)
                draw.line([(575, 65), (805, 65)], fill=border_color, width=1)
                
                # Sub-função para desenhar títulos de categoria
                def draw_category(y_pos, text):
                    draw.text((575, y_pos), text, fill=(130, 130, 130), font=font_small)
                    # Linha separadora sutil
                    text_w = draw.textlength(text, font=font_small)
                    draw.line([(575 + text_w + 5, y_pos + 6), (805, y_pos + 6)], fill=(50, 50, 50), width=1)

                # Sub-função para desenhar o ECG
                def draw_skill_ecg(y_pos, skill_name, level, color):
                    draw.text((575, y_pos + 5), f"► {skill_name}", fill=text_color, font=font_text)
                    
                    box_x, box_y, box_w, box_h = 680, y_pos, 120, 26
                    draw.rectangle([box_x, box_y, box_x + box_w, box_y + box_h], fill=(10, 15, 10), outline=(50, 50, 50), width=1)
                    
                    for sy in range(box_y + 2, box_y + box_h, 4):
                        draw.line([(box_x, sy), (box_x + box_w, sy)], fill=(20, 30, 20), width=1)
                        
                    base_y = box_y + (box_h // 2)
                    spike = box_x + 20 + (i * 26) 
                    
                    points = [
                        (box_x, base_y), (spike - 10, base_y), (spike - 5, base_y - 8),
                        (spike, base_y + 10), (spike + 5, base_y - 5), (spike + 10, base_y),
                        (box_x + box_w, base_y)
                    ]
                    clipped = [(min(max(px, box_x), box_x + box_w), py) for px, py in points]
                    draw.line(clipped, fill=color, width=1)
                    
                    text_w = draw.textlength(level, font=font_small)
                    draw.text((box_x + box_w - text_w - 4, box_y + 11), level, fill=color, font=font_small)

                # ==========================================
                # RENDERIZAÇÃO DAS CATEGORIAS E HABILIDADES
                # ==========================================
                
                # Categoria 1
                draw_category(75, "[ UI & FRAMEWORKS ]")
                draw_skill_ecg(93, "REACT.JS", "FINE", (50, 205, 50))
                draw_skill_ecg(127, "TAILWIND CSS", "FINE", (50, 205, 50))
                draw_skill_ecg(161, "THREE.JS", "CAUTION", (255, 215, 0))
                
                # Categoria 2
                draw_category(205, "[ CORE LANGUAGES ]")
                draw_skill_ecg(223, "TYPESCRIPT", "FINE", (50, 205, 50))
                draw_skill_ecg(257, "JAVASCRIPT", "FINE", (50, 205, 50))
                
                # Categoria 3
                draw_category(301, "[ GEAR & TOOLS ]")
                draw_skill_ecg(319, "BUN & VITE", "FINE", (50, 205, 50))
                draw_skill_ecg(353, "GIT & ACTIONS", "FINE", (50, 205, 50))
                draw_skill_ecg(387, "DOCKER", "DANGER", (220, 20, 60))
                
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