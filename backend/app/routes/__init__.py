from .auth_routes import auth_bp
from .room_routes import room_bp
from .student_routes import student_bp
from .billing_routes import billing_bp
from .payment_routes import payment_bp 
from .admin_routes import admin_bp

def register_routes(app):
   
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(room_bp, url_prefix='/api/rooms')
    app.register_blueprint(student_bp, url_prefix='/api/students')
    app.register_blueprint(billing_bp, url_prefix='/api/billing')
    app.register_blueprint(payment_bp, url_prefix='/api/payments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')