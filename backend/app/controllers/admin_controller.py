from flask import jsonify
from sqlalchemy import func
from app.extensions import db
from app.models.room_model import Room
from app.models.rental_model import Bill

def get_occupancy_stats_logic():
    total_rooms = Room.query.count()
    vacant_rooms = Room.query.filter_by(status='vacant').count()
    full_rooms = Room.query.filter_by(status='full').count()
    
    return jsonify({
        'total': total_rooms,
        'vacant': vacant_rooms,
        'full': full_rooms,
        'maintenance': total_rooms - vacant_rooms - full_rooms
    }), 200

def get_revenue_report_logic():
    revenue = db.session.query(func.sum(Bill.amount)).filter(Bill.status == 'paid').scalar() or 0
    return jsonify({'total_revenue': revenue}), 200