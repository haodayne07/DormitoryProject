from flask import Flask
from .extensions import db, migrate, jwt, cors
from .routes import register_routes 
from flask_apscheduler import APScheduler
from flask_cors import CORS 
from app.routes.contract_routes import contract_bp
from app.routes.event_routes import event_bp
from app.routes.setting_routes import setting_bp 
from app.routes.dashboard_routes import dashboard_bp
from app.routes.maintenance_routes import maintenance_bp 
import os 
from app.routes.student_api_routes import student_api_bp
from app.routes.payment_routes import payment_bp

scheduler = APScheduler()

def create_app():
    app = Flask(__name__, static_folder='../static', static_url_path='/static')
    app.config.from_object('app.config.Config')

    # ==========================================
    # CẤU HÌNH CORS CHUẨN XÁC VÀ DUY NHẤT
    # ==========================================
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
            "supports_credentials": True
        }
    })

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    # QUAN TRỌNG: Đã xóa dòng cors.init_app(app) cũ để tránh xung đột

    scheduler.init_app(app)
    scheduler.start()

    @scheduler.task('cron', id='monthly_bill', day='1', hour='0', minute='0')
    def scheduled_task():
        with app.app_context():
            from app.utils.scheduler import auto_generate_bills
            auto_generate_bills()

    with app.app_context():
        try:
            from app.models.auth_model import User
            from werkzeug.security import generate_password_hash
            admin_user = User.query.filter_by(username='admin').first()
            if not admin_user:
                hashed_pw = generate_password_hash('admin123')
                new_admin = User(username='admin', password=hashed_pw, email='admin@dormhub.com', role='admin')
                db.session.add(new_admin)
                db.session.commit()
        except Exception as e:
            pass

    # ĐĂNG KÝ CÁC BLUEPRINT (Giữ nguyên y hệt của bạn)
    app.register_blueprint(contract_bp, url_prefix='/api/contracts')
    app.register_blueprint(event_bp, url_prefix='/api/events')
    app.register_blueprint(setting_bp, url_prefix='/api/settings')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(maintenance_bp, url_prefix='/api/maintenance')
    app.register_blueprint(student_api_bp, url_prefix='/api/students')
    

    register_routes(app)
    return app