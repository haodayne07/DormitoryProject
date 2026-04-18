from app.extensions import db

class Setting(db.Model):
    __tablename__ = 'settings'
    
    setting_id = db.Column(db.Integer, primary_key=True)
    electricity_price = db.Column(db.Float, default=3500)
    water_price = db.Column(db.Float, default=15000)
    default_deposit = db.Column(db.Float, default=1500000)
    
    auto_billing = db.Column(db.Boolean, default=True)
    email_notifications = db.Column(db.Boolean, default=False)
    maintenance_mode = db.Column(db.Boolean, default=False)