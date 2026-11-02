# Sert site/ (ou le dossier donné en argument, sur le port donné) en local avec des pages en UTF-8 (l'artefact publié ajoute lui-même l'en-tête).
# /extension/… sert aussi le dossier de l'extension, avec CORS, pour l'injecter dans carrefour.fr pendant les tests.
import http.server, os, sys

base = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
site = os.path.join(base, sys.argv[1] if len(sys.argv) > 1 else 'site')
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8737
extension = os.path.join(base, 'extension')


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.html': 'text/html; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=site, **kwargs)

    def translate_path(self, path):
        if path.startswith('/extension/'):
            return os.path.join(extension, os.path.basename(path.split('?')[0]))
        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
