from flask import Flask, request, render_template
from flask_cors import CORS
import mysql.connector
import os
from datetime import datetime, date, time, timedelta
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)  # Permitir solicitudes CORS

# Configuración de la base de datos
db_config = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'empresa_comercial'),
    'port': int(os.getenv('DB_PORT', '3306'))
}

# Función para conectar a la base de datos
def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Error al conectar a la base de datos: {err}")
        return None

# Función para hacer que los objetos sean serializables (usada para procesar datos)
def make_serializable(obj):
    if isinstance(obj, dict):
        return {k: make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_serializable(i) for i in obj]
    elif isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, time):
        return obj.isoformat()
    elif isinstance(obj, timedelta):
        return str(obj)
    else:
        return obj

# Simulación de IP basada en la ciudad (mock data)
city_ip_map = {
    "armenia": "192.168.1.100",
    "bogota": "192.168.1.101",
    "medellin": "192.168.1.102",
    "cali": "192.168.1.103",
    "barranquilla": "192.168.1.104"
}

# Ruta para la página principal
@app.route('/')
def home():
    return render_template('index.html')

# Ruta para obtener todas las categorías
@app.route('/api/categorias', methods=['GET'])
def get_categorias():
    conn = get_db_connection()
    if not conn:
        return render_template('error.html', error="Error al conectar a la base de datos"), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, nombre, descripcion FROM empresa_comercial.categoria")
        categorias = cursor.fetchall()
        cursor.close()
        conn.close()
        return render_template('categorias.html', categorias=categorias)
    except mysql.connector.Error as err:
        conn.close()
        return render_template('error.html', error=f"Error: {err}"), 500

# Ruta para obtener productos destacados o filtrados
@app.route('/api/productos', methods=['GET'])
def get_productos():
    categoria_id = request.args.get('categoria', None)
    busqueda = request.args.get('busqueda', None)

    conn = get_db_connection()
    if not conn:
        return render_template('error.html', error="Error al conectar a la base de datos"), 500

    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT p.*, c.nombre as categoria_nombre FROM empresa_comercial.productos p " \
                "JOIN empresa_comercial.categoria c ON p.id_categoria = c.id"
        params = []

        if categoria_id:
            query += " WHERE p.id_categoria = %s"
            params.append(categoria_id)

        if busqueda:
            if "WHERE" in query:
                query += " AND p.Nombre LIKE %s"
            else:
                query += " WHERE p.Nombre LIKE %s"
            params.append(f"%{busqueda}%")

        cursor.execute(query, params)
        productos = cursor.fetchall()
        cursor.close()
        conn.close()
        return render_template('productos.html', productos=productos, categoria_id=categoria_id, busqueda=busqueda)
    except mysql.connector.Error as err:
        conn.close()
        return render_template('error.html', error=f"Error: {err}"), 500

# Ruta para obtener un producto específico
@app.route('/api/productos/<int:producto_id>', methods=['GET'])
def get_producto(producto_id):
    conn = get_db_connection()
    if not conn:
        return render_template('error.html', error="Error al conectar a la base de datos"), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT p.*, c.nombre as categoria_nombre FROM empresa_comercial.productos p "
                       "JOIN empresa_comercial.categoria c ON p.id_categoria = c.id "
                       "WHERE p.id = %s", (producto_id,))
        producto = cursor.fetchone()

        if not producto:
            cursor.close()
            conn.close()
            return render_template('error.html', error="Producto no encontrado"), 404

        cursor.execute("SELECT r.*, u.Nombre as usuario_nombre FROM empresa_comercial.reseña r "
                       "JOIN empresa_comercial.usuario u ON r.id_usuario = u.id "
                       "WHERE r.id_Producto = %s", (producto_id,))
        reseñas = cursor.fetchall()
        producto['reseñas'] = reseñas

        cursor.close()
        conn.close()
        return render_template('producto.html', producto=producto)
    except mysql.connector.Error as err:
        conn.close()
        return render_template('error.html', error=f"Error: {err}"), 500

# Ruta para obtener reseñas destacadas
@app.route('/api/resenas', methods=['GET'])
def get_resenas():
    conn = get_db_connection()
    if not conn:
        return render_template('error.html', error="Error al conectar a la base de datos"), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT r.*, u.Nombre as usuario_nombre, p.Nombre as producto_nombre "
                       "FROM empresa_comercial.reseña r "
                       "JOIN empresa_comercial.usuario u ON r.id_usuario = u.id "
                       "JOIN empresa_comercial.productos p ON r.id_Producto = p.id "
                       "ORDER BY r.Estrellita DESC LIMIT 4")
        resenas = cursor.fetchall()
        cursor.close()
        conn.close()
        return render_template('resenas.html', resenas=resenas)
    except mysql.connector.Error as err:
        conn.close()
        return render_template('error.html', error=f"Error: {err}"), 500

# Ruta para el login de usuario
@app.route('/api/login', methods=['POST'])
def login():
    data = request.form
    nombre = data.get('nombre')
    ciudad = data.get('ciudad')

    if not nombre or not ciudad:
        return render_template('error.html', error="Nombre y ciudad son requeridos"), 400

    # Obtener IP simulada basada en la ciudad (en minúsculas para evitar problemas de coincidencia)
    ciudad_lower = ciudad.lower()
    ip_address = city_ip_map.get(ciudad_lower, "192.168.1.1")  # IP por defecto si la ciudad no está en el mapa

    conn = get_db_connection()
    if not conn:
        return render_template('error.html', error="Error al conectar a la base de datos"), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM empresa_comercial.usuario WHERE Nombre = %s AND Ciudad = %s",
                       (nombre, ciudad))
        usuario = cursor.fetchone()

        if not usuario:
            cursor.execute("INSERT INTO empresa_comercial.usuario (Nombre, Ciudad) VALUES (%s, %s)",
                           (nombre, ciudad))
            conn.commit()
            usuario_id = cursor.lastrowid
            usuario = {"id": usuario_id, "Nombre": nombre, "Ciudad": ciudad}

        cursor.close()
        conn.close()
        return render_template('login.html', usuario=usuario, ip_address=ip_address)
    except mysql.connector.Error as err:
        conn.close()
        return render_template('error.html', error=f"Error: {err}"), 500

# Ruta para añadir una reseña
@app.route('/api/resenas', methods=['POST'])
def add_resena():
    data = request.form
    usuario_id = data.get('usuario_id')
    producto_id = data.get('producto_id')
    contenido = data.get('contenido')
    reseña_texto = data.get('reseña')
    estrellita = data.get('estrellita')

    if not all([usuario_id, producto_id, contenido, reseña_texto, estrellita]):
        return render_template('error.html', error="Todos los campos son requeridos"), 400

    conn = get_db_connection()
    if not conn:
        return render_template('error.html', error="Error al conectar a la base de datos"), 500

    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO empresa_comercial.reseña "
                       "(id_usuario, id_Producto, Contenido, Reseña, Fecha, Hora, Estrellita) "
                       "VALUES (%s, %s, %s, %s, CURDATE(), CURTIME(), %s)",
                       (usuario_id, producto_id, contenido, reseña_texto, estrellita))
        conn.commit()
        reseña_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return render_template('resena_success.html', reseña_id=reseña_id)
    except mysql.connector.Error as err:
        conn.close()
        return render_template('error.html', error=f"Error: {err}"), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)