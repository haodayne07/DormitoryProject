from app.extensions import db
from datetime import datetime

class Contract(db.Model):
    __tablename__ = 'contracts'
    
    contract_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.room_id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    deposit_amount = db.Column(db.Float)
    status = db.Column(db.String(50), default='active')

    bills = db.relationship('Bill', backref='contract', lazy=True)

class RentalRequest(db.Model):
    __tablename__ = 'rental_requests'
    
    request_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.room_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='pending')

class MaintenanceHistory(db.Model):
    __tablename__ = 'maintenance_history'
    
    maintenance_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    devices_id = db.Column(db.Integer, db.ForeignKey('devices.devices_id'), nullable=True)
    devices_status = db.Column(db.String(50))
    date_maintenance = db.Column(db.DateTime, default=datetime.utcnow)
    note = db.Column(db.Text)

class Bill(db.Model):
    __tablename__ = 'bills'
    
    bill_id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.contract_id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='unpaid')

    payments = db.relationship('Payment', backref='bill', lazy=True)

class Payment(db.Model):
    __tablename__ = 'payments'
    
    payment_id = db.Column(db.Integer, primary_key=True)
    bill_id = db.Column(db.Integer, db.ForeignKey('bills.bill_id'), nullable=False)
    method = db.Column(db.String(50))
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    amount_paid = db.Column(db.Float, nullable=False)