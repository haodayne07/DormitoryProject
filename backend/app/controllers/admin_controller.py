from flask import jsonify
from sqlalchemy import func
from app.extensions import db
from app.models.room_model import Room
from app.models.rental_model import Bill

# RM-14: Thống kê chỗ ở (Phòng trống/đầy)
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

# RM-15: Báo cáo doanh thu theo tháng
def get_revenue_report_logic():
    # Sử dụng db.session.query và func.sum để tính tổng doanh thu
    revenue = db.session.query(func.sum(Bill.amount)).filter(Bill.status == 'paid').scalar() or 0
    return jsonify({'total_revenue': revenue}), 200