from app.extensions import db

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')
    phone = db.Column(db.String(15))
    email = db.Column(db.String(100), unique=True)
    
    # ==========================================
    # CODE CŨ (Được giữ lại theo yêu cầu của bạn)
    # ==========================================
    # contracts = db.relationship('Contract', backref='student', lazy=True)
    # rental_requests = db.relationship('RentalRequest', backref='requester', lazy=True)
    # maintenance_histories = db.relationship('MaintenanceHistory', backref='reporter', lazy=True)

    # ==========================================
    # CODE MỚI (Đã thêm explicit foreign_keys để fix lỗi)
    # ==========================================
    contracts = db.relationship('Contract', backref='student', lazy=True, foreign_keys='Contract.user_id')
    rental_requests = db.relationship('RentalRequest', backref='requester', lazy=True, foreign_keys='RentalRequest.user_id')
    maintenance_histories = db.relationship('MaintenanceHistory', backref='reporter', lazy=True, foreign_keys='MaintenanceHistory.user_id')